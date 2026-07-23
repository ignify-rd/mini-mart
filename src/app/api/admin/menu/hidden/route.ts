import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		await initSheets();
		const session = await getServerSession(authOptions);
		const { itemId, hidden } = await req.json();

		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };
		if (!itemId) throw { status: 400, message: "Thiếu ID sản phẩm" };
		if (hidden === undefined) throw { status: 400, message: "Thiếu giá trị ẩn/hiện" };

		const menuItem = await Menus.findById<TMenu>(itemId);

		if (!menuItem) throw { status: 404, message: `Không tìm thấy sản phẩm với ID: ${itemId}` };

		await Menus.findOneAndUpdate({ _id: itemId }, { hidden });

		return NextResponse.json({ status: 200, message: hidden ? "Sản phẩm đã được ẩn" : "Sản phẩm đã hiển thị cho khách" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
