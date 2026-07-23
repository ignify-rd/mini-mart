import { NextResponse } from "next/server";

import { createOrderFromCheckout } from "#utils/database/helper/orderCheckout";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const requestedProducts = body?.products;
		const customerName = body?.customerName as string;
		const paymentReference = body?.paymentReference as string | undefined;

		if (!Array.isArray(requestedProducts) || requestedProducts.length === 0) {
			throw { status: 400, message: "Không thể xác nhận thanh toán khi giỏ hàng trống" };
		}
		if (!customerName?.trim()) throw { status: 400, message: "Vui lòng nhập tên của bạn" };

		const order = await createOrderFromCheckout(requestedProducts, customerName, paymentReference);

		return NextResponse.json({ status: 200, message: "Đặt hàng thành công", order });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
