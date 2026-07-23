import * as sheets from "#utils/sheets/operations";

const SHEET = "Categories";
const HEADERS = ["_id", "name", "restaurantID", "createdAt", "updatedAt"];

async function ensureCategoriesSheet() {
	await sheets.ensureSheet(SHEET, HEADERS);
}

function rowToCategory(row: Record<string, unknown>): TCategory {
	return {
		_id: String(row._id),
		name: row.name as string,
		restaurantID: row.restaurantID as string,
		createdAt: (row.createdAt as string) ?? "",
		updatedAt: (row.updatedAt as string) ?? "",
	};
}

export const Categories = {
	async find<T = TCategory>(filter?: Record<string, unknown>): Promise<T[]> {
		await ensureCategoriesSheet();
		const rows = await sheets.findAll(SHEET, filter);
		return rows.map(rowToCategory) as unknown as T[];
	},

	async findOne<T = TCategory>(filter: Record<string, unknown>): Promise<T | null> {
		await ensureCategoriesSheet();
		const row = await sheets.findOne(SHEET, filter);
		return row ? (rowToCategory(row) as unknown as T) : null;
	},

	async findById<T = TCategory>(id: string): Promise<T | null> {
		return Categories.findOne<T>({ _id: id });
	},

	async findByRestaurant(restaurantID: string): Promise<TCategory[]> {
		const rows = await Categories.find<TCategory>({ restaurantID });
		return rows
			.filter((row) => row.name?.trim())
			.sort((a, b) => a.name.localeCompare(b.name, "vi"));
	},

	async findByName(restaurantID: string, name: string): Promise<TCategory | null> {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return null;

		const rows = await Categories.findByRestaurant(restaurantID);
		return rows.find((row) => row.name.trim().toLowerCase() === normalized) ?? null;
	},

	async create<T = TCategory>(data: Partial<TCategory>): Promise<T> {
		await ensureCategoriesSheet();

		const name = (data.name ?? "").trim();
		if (!name) throw new Error("Category name is required.");
		if (!data.restaurantID) throw new Error("restaurantID is required.");

		const existing = await Categories.findByName(data.restaurantID, name);
		if (existing) throw new Error(`Category '${name}' already exists.`);

		const now = new Date().toISOString();
		const doc = {
			_id: await sheets.getNextId(SHEET),
			name,
			restaurantID: data.restaurantID,
			createdAt: now,
			updatedAt: now,
		};

		const created = await sheets.insertOne(SHEET, doc as unknown as Record<string, unknown>);
		return rowToCategory(created) as unknown as T;
	},

	async update<T = TCategory>(id: string, data: Partial<TCategory> & { restaurantID: string }): Promise<T> {
		await ensureCategoriesSheet();

		const existing = await Categories.findById<TCategory>(id);
		if (!existing) throw new Error("Category not found.");
		if (existing.restaurantID !== data.restaurantID) throw new Error("Category not found.");

		const name = (data.name ?? "").trim();
		if (!name) throw new Error("Category name is required.");

		const duplicate = await Categories.findByName(data.restaurantID, name);
		if (duplicate && String(duplicate._id) !== String(id)) {
			throw new Error(`Category '${name}' already exists.`);
		}

		const updated = await sheets.updateOneById(SHEET, id, {
			name,
			updatedAt: new Date().toISOString(),
		});
		if (!updated) throw new Error("Category not found.");
		return rowToCategory(updated) as unknown as T;
	},

	async deleteById(id: string, restaurantID: string): Promise<{ deletedCount: number }> {
		await ensureCategoriesSheet();

		const existing = await Categories.findById<TCategory>(id);
		if (!existing) throw new Error("Category not found.");
		if (existing.restaurantID !== restaurantID) throw new Error("Category not found.");

		const { Menus } = await import("./menu");
		const menus = await Menus.find({ restaurantID });
		const inUse = menus.some((menu) => String(menu.categoryId) === String(id));
		if (inUse) throw new Error("Không thể xóa danh mục đang được dùng bởi sản phẩm.");

		const count = await sheets.deleteMany(SHEET, { _id: id });
		return { deletedCount: count };
	},

	async deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number }> {
		await ensureCategoriesSheet();
		const count = await sheets.deleteMany(SHEET, filter);
		return { deletedCount: count };
	},
};

export type TCategory = {
	_id: string;
	name: string;
	restaurantID: string;
	createdAt: string;
	updatedAt: string;
};
