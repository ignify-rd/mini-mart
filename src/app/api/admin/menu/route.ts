import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";
import { Categories } from "#utils/database/models/category";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { clearCache } from "#utils/sheets";

async function getSessionAccount() {
	const session = await getServerSession(authOptions);
	if (!session?.username) throw { status: 401, message: "Yêu cầu xác thực" };

	await initSheets();
	const account = await Accounts.findOne<TAccount>({ username: session.username }, { populate: ["profile"] });
	if (!account) throw { status: 500, message: "Không tìm thấy tài khoản" };

	return { session, account, username: session.username };
}

async function resolveCategoryId(restaurantID: string, body: Record<string, unknown>) {
	const categoryIdRaw = body.categoryId ?? body.category_id;
	if (categoryIdRaw != null && String(categoryIdRaw).trim() !== "") {
		const category = await Categories.findById(String(categoryIdRaw).trim());
		if (!category || category.restaurantID !== restaurantID) {
			throw { status: 400, message: "Danh mục không tồn tại" };
		}
		return String(category._id);
	}

	const name = typeof body.category === "string" ? body.category.trim() : "";
	if (!name) throw { status: 400, message: "Danh mục là bắt buộc" };

	const matched = await Categories.findByName(restaurantID, name);
	if (!matched) throw { status: 400, message: `Danh mục "${name}" không tồn tại` };
	return String(matched._id);
}

async function parseMenuPayload(body: Record<string, unknown>, restaurantID: string) {
	const name = typeof body.name === "string" ? body.name.trim() : "";
	if (!name) throw { status: 400, message: "Tên sản phẩm là bắt buộc" };

	const categoryId = await resolveCategoryId(restaurantID, body);

	const price = Number(body.price);
	if (Number.isNaN(price) || price < 0) throw { status: 400, message: "Giá phải là số không âm" };

	const stock = body.stock === undefined || body.stock === "" ? 0 : Number(body.stock);
	if (Number.isNaN(stock) || stock < 0) throw { status: 400, message: "Tồn kho phải là số không âm" };

	return {
		name,
		categoryId,
		price,
		image: typeof body.image === "string" ? body.image.trim() : "",
		hidden: Boolean(body.hidden),
		stock,
	};
}

export async function POST(req: Request) {
	try {
		const { username } = await getSessionAccount();
		const payload = await parseMenuPayload(await req.json(), username);

		const created = await Menus.create<TMenu>({
			...payload,
			restaurantID: username,
		});

		clearCache("Menus");
		clearCache("Accounts");
		clearCache("Categories");

		return NextResponse.json({ status: 200, message: "Đã thêm sản phẩm", item: created });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function PUT(req: Request) {
	try {
		const { username } = await getSessionAccount();
		const body = await req.json();
		const itemId = typeof body.itemId === "string" ? body.itemId : "";
		if (!itemId) throw { status: 400, message: "ID sản phẩm là bắt buộc" };

		const payload = await parseMenuPayload(body, username);

		const menuItem = await Menus.findById<TMenu>(itemId);
		if (!menuItem) throw { status: 404, message: "Không tìm thấy sản phẩm" };
		if (menuItem.restaurantID !== username) throw { status: 403, message: "Không có quyền sửa sản phẩm này" };

		const updated = await Menus.findOneAndUpdate<TMenu>({ _id: itemId }, payload);

		clearCache("Menus");
		clearCache("Accounts");
		clearCache("Categories");

		return NextResponse.json({ status: 200, message: "Đã cập nhật sản phẩm", item: updated });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
