import { NextResponse } from "next/server";

import { createCheckoutPreview } from "#utils/database/helper/orderCheckout";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const requestedProducts = body?.products;
		const customerName = body?.customerName as string;

		const checkout = await createCheckoutPreview(requestedProducts, customerName);

		return NextResponse.json({
			status: 200,
			message: "Đã tạo bản xem trước thanh toán",
			checkout,
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
