import { getRestaurantData } from "#utils/database/helper/account";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder, type TProduct } from "#utils/database/models/order";
import * as sheets from "#utils/sheets/operations";
import { getNextId } from "#utils/sheets";
import { getPaymentInstructions, STORE_ID } from "#utils/store/config";

export type CheckoutProduct = {
	_id: string;
	quantity: number;
};

export async function buildCheckoutProducts(requestedProducts: CheckoutProduct[]) {
	if (!Array.isArray(requestedProducts) || requestedProducts.length === 0) {
		throw { status: 400, message: "Không thể thanh toán khi giỏ hàng trống" };
	}

	const menuItemsById = new Map<string, TMenu>();
	const products: TProduct[] = await Promise.all(
		requestedProducts.map(async (product) => {
			if (!product?._id) throw { status: 400, message: "Thiếu mã sản phẩm" };
			if (!Number.isInteger(product.quantity) || product.quantity <= 0) {
				throw { status: 400, message: "Số lượng sản phẩm phải lớn hơn 0" };
			}

			const menuItem = await Menus.findById<TMenu>(product._id);
			if (!menuItem || menuItem.hidden) throw { status: 404, message: "Không tìm thấy sản phẩm đã đặt" };
			if (menuItem.stock < product.quantity) {
				throw { status: 409, message: `${menuItem.name} chỉ còn ${menuItem.stock} sản phẩm` };
			}

			menuItemsById.set(String(product._id), menuItem);

			return {
				product: String(product._id),
				quantity: product.quantity,
				price: menuItem.price,
				adminApproved: true,
				fulfilled: true,
			};
		}),
	);

	const orderTotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

	return { products, menuItemsById, orderTotal };
}

export async function createCheckoutPreview(requestedProducts: CheckoutProduct[], customerName: string) {
	const trimmedName = customerName?.trim();
	if (!trimmedName) throw { status: 400, message: "Vui lòng nhập tên của bạn" };

	const { products, menuItemsById, orderTotal } = await buildCheckoutProducts(requestedProducts);
	const checkoutId = await getNextId("Orders");
	const storeData = await getRestaurantData(STORE_ID);
	const profile = storeData?.profile as Record<string, unknown> | undefined;
	const payment = getPaymentInstructions(checkoutId, orderTotal, profile);
	const displayProducts = products.map((product) => {
		const productId = typeof product.product === "string" ? String(product.product) : String(product.product?._id ?? "");
		const menuItem = menuItemsById.get(productId);
		return {
			...product,
			...menuItem,
			product: productId,
		};
	});

	return {
		products: requestedProducts,
		customerName: trimmedName,
		orderTotal,
		paymentReference: payment.reference,
		paymentAmount: payment.amount,
		payment,
		displayProducts,
	};
}

export async function createOrderFromCheckout(requestedProducts: CheckoutProduct[], customerName: string, paymentReference?: string) {
	const trimmedName = customerName?.trim();
	if (!trimmedName) throw { status: 400, message: "Vui lòng nhập tên của bạn" };

	const { products, menuItemsById, orderTotal } = await buildCheckoutProducts(requestedProducts);

	for (const product of products) {
		const productId = typeof product.product === "string" ? String(product.product) : String(product.product?._id ?? "");
		const menuItem = menuItemsById.get(productId);
		if (!menuItem) throw { status: 404, message: "Không tìm thấy sản phẩm đã đặt" };
		await sheets.setField("Menus", menuItem._id, "stock", Math.max(0, menuItem.stock - product.quantity));
	}

	const paidAt = new Date().toISOString();
	const storeData = await getRestaurantData(STORE_ID);
	const profile = storeData?.profile as Record<string, unknown> | undefined;
	const orderId = await getNextId("Orders");
	const payment = getPaymentInstructions(orderId, orderTotal, profile);
	const reference = paymentReference || payment.reference;

	const order = await Orders.create<TOrder>({
		_id: orderId,
		restaurantID: STORE_ID,
		products,
		state: "complete",
		paymentStatus: "paid",
		customerName: trimmedName,
		paymentReference: reference,
		paymentAmount: orderTotal,
		paidAt,
	});

	const displayProducts = order.products.map((product) => {
		const productId = typeof product.product === "string" ? String(product.product) : String(product.product?._id ?? "");
		const menuItem = menuItemsById.get(productId);
		return {
			...product,
			...menuItem,
			product: productId,
		};
	});

	return { ...order, products: displayProducts, payment };
}
