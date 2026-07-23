import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import type { TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder, type TProduct } from "#utils/database/models/order";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		await initSheets();
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };

		const orders = (await Orders.find<TOrder>({}, { populate: ["products.product"] })) ?? [];

		const formattedOrders = orders.map((order) => {
			if (order?.products) {
				const products = order.products.map((p) => {
					const product = p as unknown as TProduct;
					const menu = product.product as unknown as TMenu;
					return {
						...product,
						...menu,
						product: menu?._id,
					};
				});
				return { ...order, products: products as unknown as TProduct[] };
			}
			return order;
		});

		return NextResponse.json(formattedOrders);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
