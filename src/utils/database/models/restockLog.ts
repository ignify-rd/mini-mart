import * as sheets from "#utils/sheets/operations";

const SHEET = "RestockLogs";

function rowToRestockLog(row: Record<string, unknown>): TRestockLog {
	return {
		_id: String(row._id),
		menuId: String(row.menuId ?? ""),
		menuName: row.menuName as string,
		quantity: Number(row.quantity),
		stockBefore: Number(row.stockBefore),
		stockAfter: Number(row.stockAfter),
		note: (row.note as string) ?? "",
		createdBy: (row.createdBy as string) ?? "",
		createdAt: (row.createdAt as string) ?? "",
	};
}

export const RestockLogs = {
	async find<T = TRestockLog>(filter?: Record<string, unknown>): Promise<T[]> {
		const rows = await sheets.findAll(SHEET, filter);
		return rows.map(rowToRestockLog) as unknown as T[];
	},

	async findOne<T = TRestockLog>(filter: Record<string, unknown>): Promise<T | null> {
		const row = await sheets.findOne(SHEET, filter);
		return row ? (rowToRestockLog(row) as unknown as T) : null;
	},

	async create<T = TRestockLog>(data: Partial<TRestockLog>): Promise<T> {
		const doc = {
			_id: await sheets.getNextId(SHEET),
			menuId: data.menuId ?? "",
			menuName: data.menuName ?? "",
			quantity: data.quantity ?? 0,
			stockBefore: data.stockBefore ?? 0,
			stockAfter: data.stockAfter ?? 0,
			note: data.note ?? "",
			createdBy: data.createdBy ?? "",
			createdAt: new Date().toISOString(),
		};
		const created = await sheets.insertOne(SHEET, doc as unknown as Record<string, unknown>);
		return rowToRestockLog(created) as unknown as T;
	},

	async deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number }> {
		const count = await sheets.deleteMany(SHEET, filter);
		return { deletedCount: count };
	},
};

export type TRestockLog = {
	_id: string;
	menuId: string;
	menuName: string;
	quantity: number;
	stockBefore: number;
	stockAfter: number;
	note: string;
	createdBy: string;
	createdAt: string;
};
