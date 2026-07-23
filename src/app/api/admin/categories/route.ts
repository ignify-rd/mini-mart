import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Categories, type TCategory } from "#utils/database/models/category";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { clearCache } from "#utils/sheets";

async function requireUsername() {
	const session = await getServerSession(authOptions);
	if (!session?.username) throw { status: 401, message: "Yêu cầu xác thực" };
	await initSheets();
	return session.username;
}

function mapCategoryError(err: unknown) {
	const message = err instanceof Error ? err.message : "";
	if (message.includes("already exists")) throw { status: 400, message: "Danh mục đã tồn tại" };
	if (message.includes("required")) throw { status: 400, message: "Tên danh mục là bắt buộc" };
	if (message.includes("đang được dùng")) throw { status: 400, message };
	if (message.includes("not found")) throw { status: 404, message: "Không tìm thấy danh mục" };
	throw err;
}

export async function GET() {
	try {
		const username = await requireUsername();
		const categories = await Categories.findByRestaurant(username);

		return NextResponse.json({
			status: 200,
			categories: categories as TCategory[],
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function POST(req: Request) {
	try {
		const username = await requireUsername();
		const body = await req.json();
		const name = typeof body.name === "string" ? body.name.trim() : "";
		if (!name) throw { status: 400, message: "Tên danh mục là bắt buộc" };

		try {
			const created = await Categories.create<TCategory>({
				name,
				restaurantID: username,
			});
			clearCache("Categories");
			return NextResponse.json({ status: 200, message: "Đã thêm danh mục", category: created });
		} catch (err) {
			mapCategoryError(err);
		}
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function PUT(req: Request) {
	try {
		const username = await requireUsername();
		const body = await req.json();
		const categoryId = typeof body.categoryId === "string" ? body.categoryId : typeof body._id === "string" ? body._id : "";
		const name = typeof body.name === "string" ? body.name.trim() : "";
		if (!categoryId) throw { status: 400, message: "ID danh mục là bắt buộc" };
		if (!name) throw { status: 400, message: "Tên danh mục là bắt buộc" };

		try {
			const updated = await Categories.update<TCategory>(categoryId, {
				name,
				restaurantID: username,
			});
			clearCache("Categories");
			return NextResponse.json({ status: 200, message: "Đã cập nhật danh mục", category: updated });
		} catch (err) {
			mapCategoryError(err);
		}
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function DELETE(req: Request) {
	try {
		const username = await requireUsername();
		const body = await req.json();
		const categoryId = typeof body.categoryId === "string" ? body.categoryId : typeof body._id === "string" ? body._id : "";
		if (!categoryId) throw { status: 400, message: "ID danh mục là bắt buộc" };

		try {
			await Categories.deleteById(categoryId, username);
			clearCache("Categories");
			return NextResponse.json({ status: 200, message: "Đã xóa danh mục" });
		} catch (err) {
			mapCategoryError(err);
		}
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
