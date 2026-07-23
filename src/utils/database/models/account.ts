import { hashPassword } from "#utils/helper/passwordHelper";
import * as sheets from "#utils/sheets/operations";

import type { TMenu } from "./menu";
import type { TProfile } from "./profile";

const SHEET = "Accounts";

function rowToAccount(row: Record<string, unknown>): TAccount {
	return {
		_id: String(row._id),
		username: row.username as string,
		email: row.email as string,
		password: row.password as string,
		verified: Boolean(row.verified),
		accountActive: Boolean(row.accountActive),
		subscriptionActive: Boolean(row.subscriptionActive),
		profile: row.profile as TProfile,
		/** Populated from Menus by restaurantID — not stored on Accounts sheet. */
		menus: [],
	};
}

interface PopulatePath {
	path: string;
	match?: Record<string, unknown>;
}

type PopulateOption = string | PopulatePath;

interface FindOptions {
	populate?: PopulateOption[];
	select?: string;
}

async function applyPopulate<T extends Record<string, unknown>>(doc: T, options?: FindOptions): Promise<T> {
	if (!options?.populate) return doc;

	let result = { ...doc };

	for (const opt of options.populate) {
		const path = typeof opt === "string" ? opt : opt.path;
		const match = typeof opt === "string" ? undefined : opt.match;

		const targets: Record<string, string> = {
			profile: "Profiles",
			menus: "Menus",
			"products.product": "Menus",
		};

		const targetSheet = targets[path];
		if (!targetSheet) continue;

		const isArray = ["menus"].includes(path);

		if (path === "menus") {
			const restaurantID = (doc.username as string) ?? (doc.restaurantID as string);
			const { hydrateMenus } = await import("./menu");
			const menuRows = restaurantID ? await sheets.findAll("Menus", { restaurantID }) : [];
			result = { ...result, menus: await hydrateMenus(menuRows) } as unknown as T;
			continue;
		}

		const ids = (isArray ? ((doc[path] as unknown as unknown[]) ?? []) : doc[path] ? [doc[path]] : []).map(String);

		if (targetSheet === "Profiles" && !isArray && ids.length > 0) {
			const { Profiles } = await import("./profile");
			const profile = await Profiles.findById(ids[0]);
			if (profile) {
				result = { ...result, [path]: profile } as unknown as T;
				continue;
			}
		}

		const allRows = await sheets.findAll(targetSheet);
		let matched = allRows.filter((r) => ids.includes(String(r._id)));

		if (match) {
			matched = matched.filter((r) => {
				for (const [k, v] of Object.entries(match)) {
					if (r[k] !== v) return false;
				}
				return true;
			});
		}

		const pathParts = path.split(".");
		if (pathParts.length === 2) {
			const [parent, child] = pathParts;
			const r = result as unknown as Record<string, unknown>;
			const parentArr = r[parent] as Record<string, unknown>[] | undefined;
			if (parentArr) {
				r[parent] = parentArr.map((item) => {
					const productId = item[child];
					const menuRow = allRows.find((row) => String(row._id) === String(productId));
					return { ...item, [child]: menuRow ?? productId };
				});
			}
		} else {
			result = { ...result, [path]: isArray ? matched : matched[0] } as unknown as T;
		}
	}

	if (options.select) {
		const fields = options.select.split(" ");
		result = Object.fromEntries(Object.entries(result).filter(([k]) => fields.includes(k))) as unknown as T;
	}

	return result;
}

export const Accounts = {
	async findOne<T = TAccount>(filter: Record<string, unknown>, options?: FindOptions): Promise<T | null> {
		const row = await sheets.findOne(SHEET, filter);
		if (!row) return null;
		const doc = rowToAccount(row) as unknown as T;
		return applyPopulate(doc as unknown as Record<string, unknown>, options) as unknown as Promise<T>;
	},

	async find<T = TAccount>(filter?: Record<string, unknown>, options?: FindOptions): Promise<T[]> {
		const rows = await sheets.findAll(SHEET, filter);
		const docs = rows.map(rowToAccount) as unknown as T[];
		return Promise.all(docs.map((d) => applyPopulate(d as unknown as Record<string, unknown>, options) as unknown as Promise<T>));
	},

	async findById<T = TAccount>(id: string, options?: FindOptions): Promise<T | null> {
		return Accounts.findOne<T>({ _id: id }, options);
	},

	async create<T = TAccount>(data: Partial<TAccount>): Promise<T> {
		const doc = {
			_id: await sheets.getNextId(SHEET),
			username: data.username ?? "",
			email: data.email ?? "",
			password: data.password ? await hashPassword(data.password) : "",
			verified: data.verified ?? false,
			accountActive: data.accountActive ?? true,
			subscriptionActive: data.subscriptionActive ?? true,
			profile: data.profile ?? "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		return (await sheets.insertOne(SHEET, doc as unknown as Record<string, unknown>)) as unknown as T;
	},

	async save(account: Partial<TAccount> & { _id?: string }): Promise<TAccount> {
		if (account._id) {
			const updateData = { ...account } as Record<string, unknown>;
			if (updateData.password) {
				updateData.password = await hashPassword(updateData.password as string);
			}
			updateData.updatedAt = new Date().toISOString();
			await sheets.updateOneById(SHEET, account._id, updateData as unknown as Record<string, unknown>);
			return (await sheets.findById(SHEET, account._id)) as unknown as TAccount;
		}
		return Accounts.create(account);
	},

	async findOneAndUpdate<T = TAccount>(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<T | null> {
		const existing = await sheets.findOne(SHEET, filter);
		if (!existing) return null;

		const resolved = { ...update };

		if (typeof resolved.password === "string" && resolved.password) {
			resolved.password = await hashPassword(resolved.password);
		}

		resolved.updatedAt = new Date().toISOString();

		await sheets.updateOne(SHEET, filter, resolved);
		return (await sheets.findOne(SHEET, filter)) as unknown as T;
	},

	async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<void> {
		await Accounts.findOneAndUpdate(filter, update);
	},

	async deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number }> {
		const count = await sheets.deleteMany(SHEET, filter);
		return { deletedCount: count };
	},
};

export type TAccount = {
	_id: string;
	username: string;
	email: string;
	password: string;
	verified: boolean;
	accountActive: boolean;
	subscriptionActive: boolean;
	profile: TProfile | string;
	/** Runtime-only: menus loaded from Menus sheet by restaurantID (= username). */
	menus: TMenu[];
};
