import * as sheets from "#utils/sheets/operations";

import type { TMenu } from "./menu";

const SHEET = "Orders";
const ORDER_HEADERS = [
	"_id",
	"restaurantID",
	"customer",
	"state",
	"orderTotal",
	"taxTotal",
	"paymentStatus",
	"paymentReference",
	"paymentAmount",
	"paidAt",
	"products",
	"createdAt",
	"updatedAt",
];

const orderState = ["pending_payment", "paid", "cancel", "complete"] as const;
const paymentStatus = ["pending", "paid"] as const;

function resolveCustomerName(row: Record<string, unknown>): string {
	const name = row.customer ?? row.customerName;
	return name == null ? "" : String(name);
}

function withCustomerColumns(data: Record<string, unknown>): Record<string, unknown> {
	const payload = { ...data };
	delete payload.customerName;

	const hasCustomerField = "customer" in data || "customerName" in data;
	if (hasCustomerField) {
		payload.customer = resolveCustomerName(data);
	} else {
		delete payload.customer;
	}

	return payload;
}

function rowToOrder(row: Record<string, unknown>): TOrder {
	return {
		_id: String(row._id),
		restaurantID: String(row.restaurantID ?? ""),
		state: row.state as (typeof orderState)[number],
		orderTotal: Number(row.orderTotal ?? 0),
		products: (row.products ?? []) as TProduct[],
		paymentStatus: (row.paymentStatus as TPaymentStatus) ?? (row.state === "paid" || row.state === "complete" ? "paid" : "pending"),
		paymentReference: (row.paymentReference as string) ?? "",
		paymentAmount: Number(row.paymentAmount ?? row.orderTotal ?? 0),
		paidAt: (row.paidAt as string) ?? "",
		customerName: resolveCustomerName(row),
		createdAt: (row.createdAt as string) ?? "",
		updatedAt: (row.updatedAt as string) ?? "",
	};
}

function calculateOrderTotal(products: TProduct[]): number {
	return products.reduce((sum, product) => sum + (product.price ?? 0) * (product.quantity ?? 1), 0);
}

export const Orders = {
	async findOne<T = TOrder>(filter: Record<string, unknown>, options?: { populate?: string[] }): Promise<T | null> {
		const row = await sheets.findOne(SHEET, filter);
		if (!row) return null;
		const doc = rowToOrder(row) as unknown as Record<string, unknown>;

		if (options?.populate) {
			for (const path of options.populate) {
				if (path === "products.product") {
					const menuSheet = await sheets.findAll("Menus");
					const products = doc.products as Record<string, unknown>[];
					doc.products = products.map((p) => {
						const menu = menuSheet.find((m) => String(m._id) === String(p.product));
						return { ...p, product: menu ?? p.product };
					}) as unknown as TProduct[];
				}
			}
		}

		return doc as unknown as T;
	},

	async find<T = TOrder>(filter?: Record<string, unknown>, options?: { populate?: string[] }): Promise<T[]> {
		const rows = await sheets.findAll(SHEET, filter);
		const docs = rows.map(rowToOrder) as unknown as Record<string, unknown>[];

		if (options?.populate) {
			for (const path of options.populate) {
				if (path === "products.product") {
					const menuSheet = await sheets.findAll("Menus");
					for (const doc of docs) {
						const products = doc.products as Record<string, unknown>[];
						doc.products = products.map((p) => {
							const menu = menuSheet.find((m) => String(m._id) === String(p.product));
							return { ...p, product: menu ?? p.product };
						}) as unknown as TProduct[];
					}
				}
			}
		}

		return docs as unknown as T[];
	},

	async findById<T = TOrder>(id: string): Promise<T | null> {
		return Orders.findOne<T>({ _id: id });
	},

	async create<T = TOrder>(data: Partial<TOrder>): Promise<T> {
		const products = (data.products ?? []).map((p) => ({
			product: typeof p.product === "object" ? (p.product as Record<string, unknown>)?._id : p.product,
			quantity: p.quantity ?? 1,
			price: p.price ?? 0,
			adminApproved: p.adminApproved ?? false,
			fulfilled: p.fulfilled ?? false,
		})) as TProduct[];

		const orderTotal = calculateOrderTotal(products);
		const orderId = data._id ?? (await sheets.getNextId(SHEET));

		const doc = withCustomerColumns({
			_id: orderId,
			restaurantID: data.restaurantID ?? "",
			state: data.state ?? "complete",
			orderTotal,
			paymentStatus: data.paymentStatus ?? (data.state === "complete" ? "paid" : "pending"),
			paymentReference: data.paymentReference ?? "",
			paymentAmount: data.paymentAmount ?? orderTotal,
			paidAt: data.paidAt ?? "",
			products,
			customer: data.customerName ?? "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		await sheets.ensureColumns(SHEET, ORDER_HEADERS);
		const created = await sheets.insertOne(SHEET, doc);
		return rowToOrder(created) as unknown as T;
	},

	async save(order: Partial<TOrder> & { _id?: string }): Promise<TOrder> {
		if (order.products) {
			(order as unknown as Record<string, unknown>).orderTotal = calculateOrderTotal(order.products as TProduct[]);
		}
		if (order._id) {
			const payload = withCustomerColumns({
				...(order as unknown as Record<string, unknown>),
				updatedAt: new Date().toISOString(),
			});
			await sheets.ensureColumns(SHEET, ORDER_HEADERS);
			await sheets.updateOneById(SHEET, order._id, payload);
			const row = await sheets.findById(SHEET, order._id);
			return row ? rowToOrder(row) : (order as TOrder);
		}
		return Orders.create(order);
	},

	async findOneAndUpdate<T = TOrder>(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<T | null> {
		const resolved = { ...update };
		if (resolved.products) {
			resolved.orderTotal = calculateOrderTotal(resolved.products as TProduct[]);
		}
		const payload = withCustomerColumns({ ...resolved, updatedAt: new Date().toISOString() });
		await sheets.ensureColumns(SHEET, ORDER_HEADERS);
		await sheets.updateOne(SHEET, filter, payload);
		const row = await sheets.findOne(SHEET, filter);
		return row ? (rowToOrder(row) as unknown as T) : null;
	},
};

export type TOrder = {
	_id: string;
	restaurantID: string;
	state: (typeof orderState)[number];
	orderTotal: number;
	products: TProduct[];
	paymentStatus: TPaymentStatus;
	paymentReference: string;
	paymentAmount: number;
	paidAt: string;
	customerName: string;
	createdAt: string;
	updatedAt: string;
};

export type TProduct = {
	_id?: string;
	product: TMenu | string;
	quantity: number;
	price: number;
	fulfilled: boolean;
	adminApproved: boolean;
	[key: string]: unknown;
};

export type TOrderState = (typeof orderState)[number];
export type TPaymentStatus = (typeof paymentStatus)[number];
