import * as sheets from "#utils/sheets/operations";
import { Accounts, type TAccount } from "./account";
import { Categories, type TCategory } from "./category";

const SHEET = "Menus";

function rowToMenu(row: Record<string, unknown>): TMenu {
	const rawCategoryId = row.categoryId ?? row.category_id;
	const legacyCategory = row.category;
	const categoryIdFromLegacy =
		rawCategoryId == null || rawCategoryId === "" ? (/^\d+$/.test(String(legacyCategory ?? "").trim()) ? String(legacyCategory).trim() : "") : String(rawCategoryId);

	const legacyName =
		!categoryIdFromLegacy && typeof legacyCategory === "string" && legacyCategory.trim() && !/^\d+$/.test(legacyCategory.trim()) ? legacyCategory.trim() : undefined;

	return {
		_id: String(row._id),
		name: row.name as string,
		restaurantID: row.restaurantID as string,
		categoryId: categoryIdFromLegacy,
		category: legacyName,
		price: Number(row.price),
		image: row.image as string,
		hidden: Boolean(row.hidden ?? true),
		stock: Number(row.stock ?? 0),
		restockDate: (row.restockDate as string) ?? "",
	};
}

export async function hydrateMenus(rows: Record<string, unknown>[]): Promise<TMenu[]> {
	return withCategoryNames(rows.map(rowToMenu));
}

async function toSheetPayload(data: Partial<TMenu> | Record<string, unknown>) {
	const { headers } = await sheets.loadSheet(SHEET);
	const payload: Record<string, unknown> = { ...data };
	delete payload.category;

	if ("categoryId" in data) {
		const categoryId = data.categoryId != null ? String(data.categoryId) : "";
		if (headers.includes("categoryId")) {
			payload.categoryId = categoryId;
			if (headers.includes("category")) payload.category = "";
		} else if (headers.includes("category")) {
			payload.category = categoryId;
		} else {
			payload.categoryId = categoryId;
		}
	} else {
		delete payload.categoryId;
	}

	return payload;
}

export async function withCategoryNames(menus: TMenu[]): Promise<TMenu[]> {
	if (menus.length === 0) return menus;

	const restaurantIDs = Array.from(new Set(menus.map((menu) => menu.restaurantID).filter(Boolean)));
	const categories: TCategory[] = [];
	for (const restaurantID of restaurantIDs) {
		categories.push(...(await Categories.findByRestaurant(restaurantID)));
	}

	const byId = new Map(categories.map((cat) => [String(cat._id), cat]));
	const byName = new Map(categories.map((cat) => [cat.name.trim().toLowerCase(), cat]));

	return menus.map((menu) => {
		let categoryId = menu.categoryId ? String(menu.categoryId) : "";
		let category = byId.get(categoryId)?.name;

		if (!category && menu.category) {
			const matched = byName.get(menu.category.trim().toLowerCase());
			if (matched) {
				categoryId = String(matched._id);
				category = matched.name;
			} else {
				category = menu.category;
			}
		}

		return {
			...menu,
			categoryId,
			category: category ?? "",
		};
	});
}

export const Menus = {
	async findOne<T = TMenu>(filter: Record<string, unknown>): Promise<T | null> {
		const row = await sheets.findOne(SHEET, filter);
		if (!row) return null;
		const [menu] = await withCategoryNames([rowToMenu(row)]);
		return menu as unknown as T;
	},

	async find<T = TMenu>(filter?: Record<string, unknown>): Promise<T[]> {
		const rows = await sheets.findAll(SHEET, filter);
		return (await withCategoryNames(rows.map(rowToMenu))) as unknown as T[];
	},

	async findById<T = TMenu>(id: string): Promise<T | null> {
		return Menus.findOne<T>({ _id: id });
	},

	async create<T = TMenu>(data: Partial<TMenu>): Promise<T> {
		return (await Menus.createMany([data]))[0] as unknown as T;
	},

	async createMany<T = TMenu>(dataArray: Partial<TMenu>[]): Promise<T[]> {
		if (dataArray.length === 0) return [];

		const restaurantID = dataArray[0].restaurantID;
		if (!restaurantID) throw new Error("restaurantID is required.");

		const account = await Accounts.findOne<TAccount>({ username: restaurantID });
		if (!account) throw new Error(`The associated account with username '${restaurantID}' does not exist.`);

		const ids = await sheets.getNextIds(SHEET, dataArray.length);
		const docs = await Promise.all(
			dataArray.map(async (data, index) =>
				toSheetPayload({
					_id: ids[index],
					name: data.name ?? "",
					restaurantID: data.restaurantID ?? "",
					categoryId: data.categoryId ? String(data.categoryId) : "",
					price: data.price ?? 0,
					image: data.image ?? "",
					hidden: data.hidden ?? false,
					stock: data.stock ?? 0,
					restockDate: data.restockDate ?? "",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}),
			),
		);

		const created = await sheets.insertMany(SHEET, docs as unknown as Record<string, unknown>[]);

		return (await withCategoryNames(created.map(rowToMenu))) as unknown as T[];
	},

	async save(menu: Partial<TMenu> & { _id?: string }): Promise<TMenu> {
		if (menu._id) {
			const payload = await toSheetPayload({ ...menu, updatedAt: new Date().toISOString() });
			await sheets.updateOneById(SHEET, menu._id, payload);
			const row = await sheets.findById(SHEET, menu._id);
			const [result] = await withCategoryNames([rowToMenu(row ?? { _id: menu._id })]);
			return result;
		}
		return Menus.create(menu);
	},

	async findOneAndUpdate<T = TMenu>(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<T | null> {
		const payload = await toSheetPayload({ ...update, updatedAt: new Date().toISOString() });
		await sheets.updateOne(SHEET, filter, payload);
		const row = await sheets.findOne(SHEET, filter);
		if (!row) return null;
		const [menu] = await withCategoryNames([rowToMenu(row)]);
		return menu as unknown as T;
	},

	async deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number }> {
		const count = await sheets.deleteMany(SHEET, filter);
		return { deletedCount: count };
	},

	async insertMany(dataArray: Partial<TMenu>[]): Promise<TMenu[]> {
		return Menus.createMany(dataArray) as unknown as Promise<TMenu[]>;
	},
};

export type TMenu = {
	_id: string;
	name: string;
	restaurantID: string;
	categoryId: string;
	/** Display name resolved from Categories (not stored on Menus sheet). */
	category?: string;
	price: number;
	image: string;
	hidden: boolean;
	stock: number;
	restockDate: string;
};
