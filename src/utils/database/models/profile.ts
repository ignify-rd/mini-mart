import * as sheets from "#utils/sheets/operations";
import { Accounts, type TAccount } from "./account";

const SHEET = "Profiles";

function rowToProfile(row: Record<string, unknown>): TProfile {
	return {
		_id: String(row._id),
		name: row.name as string,
		restaurantID: row.restaurantID as string,
		description: row.description as string,
		address: row.address as string,
		categories: (row.categories ?? []) as string[],
		avatar: row.avatar as string,
		cover: row.cover as string,
		photos: (row.photos ?? []) as string[],
		bankId: (row.bankId as string) ?? "",
		accountNo: (row.accountNo as string) ?? "",
		accountName: (row.accountName as string) ?? "",
	};
}

export const Profiles = {
	async findOne<T = TProfile>(filter: Record<string, unknown>, options?: { select?: string }): Promise<T | null> {
		const row = await sheets.findOne(SHEET, filter);
		if (!row) return null;
		const doc = rowToProfile(row) as unknown as T;
		if (options?.select) {
			const fields = options.select.split(" ");
			return Object.fromEntries(Object.entries(doc as Record<string, unknown>).filter(([k]) => fields.includes(k))) as unknown as T;
		}
		return doc;
	},

	async find<T = TProfile>(filter?: Record<string, unknown>, options?: { select?: string }): Promise<T[]> {
		const rows = await sheets.findAll(SHEET, filter);
		return rows.map((row) => {
			const doc = rowToProfile(row) as unknown as T;
			if (options?.select) {
				const fields = options.select.split(" ");
				return Object.fromEntries(Object.entries(doc as Record<string, unknown>).filter(([k]) => fields.includes(k))) as unknown as T;
			}
			return doc;
		});
	},

	async findById<T = TProfile>(id: string): Promise<T | null> {
		return Profiles.findOne<T>({ _id: id });
	},

	async create<T = TProfile>(data: Partial<TProfile>): Promise<T> {
		const account = await Accounts.findOne<TAccount>({ username: data.restaurantID });
		if (!account) throw new Error(`The associated account with username '${data.restaurantID}' does not exist.`);

		const categories = Array.from(new Set((data.categories ?? []).map((c) => c.toLowerCase())));

		const doc = {
			_id: await sheets.getNextId(SHEET),
			name: data.name ?? "",
			restaurantID: data.restaurantID ?? "",
			description: data.description ?? "",
			address: data.address ?? "",
			categories: categories,
			avatar: data.avatar ?? "",
			cover: data.cover ?? "",
			photos: data.photos ?? [],
			bankId: data.bankId ?? "",
			accountNo: data.accountNo ?? "",
			accountName: data.accountName ?? "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const created = await sheets.insertOne(SHEET, doc as unknown as Record<string, unknown>);

		await Accounts.updateOne({ username: data.restaurantID }, { profile: String(created._id) });

		return created as unknown as T;
	},

	async save(profile: Partial<TProfile> & { _id?: string; restaurantID?: string }): Promise<TProfile> {
		if (profile._id) {
			if (profile.categories) {
				profile.categories = Array.from(new Set(profile.categories.map((c) => c.toLowerCase())));
			}
			(profile as unknown as Record<string, unknown>).updatedAt = new Date().toISOString();
			await sheets.updateOneById(SHEET, profile._id, profile as unknown as Record<string, unknown>);
			return (await sheets.findById(SHEET, profile._id)) as unknown as TProfile;
		}
		return Profiles.create(profile);
	},

	async findOneAndUpdate<T = TProfile>(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<T | null> {
		const resolved = { ...update, updatedAt: new Date().toISOString() };
		await sheets.updateOne(SHEET, filter, resolved);
		const row = await sheets.findOne(SHEET, filter);
		return row ? (rowToProfile(row) as unknown as T) : null;
	},

	async deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number }> {
		const count = await sheets.deleteMany(SHEET, filter);
		return { deletedCount: count };
	},
};

export type TProfile = {
	_id: string;
	name: string;
	restaurantID: string;
	description: string;
	address: string;
	avatar: string;
	cover: string;
	photos: string[];
	categories: string[];
	bankId: string;
	accountNo: string;
	accountName: string;
};
