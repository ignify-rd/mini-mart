import { NextResponse } from "next/server";
import { getRestaurantData } from "#utils/database/helper/account";
import type { TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder, type TProduct } from "#utils/database/models/order";
import { CatchNextResponse } from "#utils/helper/common";
import { getPaymentInstructions, STORE_ID } from "#utils/store/config";

export async function GET(req: Request) {
	try {
		const orderID = new URL(req.url).searchParams.get("id");
		if (!orderID) throw { status: 400, message: "Thiếu mã đơn hàng" };

		const order = await Orders.findOne<TOrder>({ _id: orderID }, { populate: ["products.product"] });

		let formattedOrder: unknown = order;

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
			const storeData = await getRestaurantData(STORE_ID);
			const profile = storeData?.profile as Record<string, unknown> | undefined;
			const amount = order.orderTotal;
			formattedOrder = { ...order, products: products as unknown as TProduct[], payment: getPaymentInstructions(order._id, amount, profile) };
		}

		return NextResponse.json(formattedOrder);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
