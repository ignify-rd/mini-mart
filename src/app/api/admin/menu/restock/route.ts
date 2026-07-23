import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { RestockLogs } from "#utils/database/models/restockLog";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		const body = await req.json();

		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };
		if (!body?.itemId) throw { status: 400, message: "Thiếu ID sản phẩm" };
		if (typeof body?.quantity !== "number" || body.quantity <= 0) {
			throw { status: 400, message: "Số lượng nhập phải lớn hơn 0" };
		}

		await initSheets();

		const menuItem = await Menus.findById<TMenu>(body.itemId);
		if (!menuItem) throw { status: 404, message: "Không tìm thấy sản phẩm" };

		const stockBefore = menuItem.stock ?? 0;
		const quantity = Math.floor(body.quantity);
		const stockAfter = stockBefore + quantity;

		const updateData: Record<string, unknown> = { stock: stockAfter };
		if (body.restockDate) updateData.restockDate = body.restockDate;

		await Menus.findOneAndUpdate({ _id: body.itemId }, updateData);

		await RestockLogs.create({
			menuId: menuItem._id,
			menuName: menuItem.name,
			quantity,
			stockBefore,
			stockAfter,
			note: body.note ?? "",
			createdBy: session?.username ?? "admin",
		});

		return NextResponse.json({
			status: 200,
			message: "Cập nhật tồn kho thành công",
			stockBefore,
			stockAfter,
			quantity,
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
