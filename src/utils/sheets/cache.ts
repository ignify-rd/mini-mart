import { getSheetsClient, getSpreadsheetId } from "./client";
import { parseValue } from "./parse";
import type { SheetData } from "./types";

type CacheEntry = { data: SheetData; expiresAt: number };

const SHEET_CACHE_TTL_MS = 20_000;
const cache: Record<string, CacheEntry> = {};
const loadingLocks: Record<string, Promise<SheetData> | undefined> = {};

function getCachedSheet(sheetName: string): SheetData | null {
	const entry = cache[sheetName];
	if (!entry || entry.expiresAt <= Date.now()) return null;
	return entry.data;
}

function setCachedSheet(sheetName: string, data: SheetData) {
	cache[sheetName] = { data, expiresAt: Date.now() + SHEET_CACHE_TTL_MS };
}

export function invalidateSheetCache(sheetName: string) {
	delete cache[sheetName];
}

async function fetchSheetFromGoogle(sheetName: string, attempt = 0): Promise<SheetData> {
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();

	try {
		const res = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range: `${sheetName}!A:ZZ`,
		});

		const values = res.data.values ?? [];
		if (values.length < 1) {
			return { headers: [], rows: [] };
		}

		const headers = values[0] as string[];
		const rows = values.slice(1).map((row) => {
			const obj: SheetData["rows"][number] = {};
			headers.forEach((header, i) => {
				obj[header] = parseValue(row[i] ?? "");
			});
			return obj;
		});

		return { headers, rows };
	} catch (error) {
		const status = (error as { code?: number; status?: number }).code ?? (error as { status?: number }).status;
		const stale = getCachedSheet(sheetName);
		if (status === 429 && stale) return stale;
		if (status === 429 && attempt < 2) {
			await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
			return fetchSheetFromGoogle(sheetName, attempt + 1);
		}
		throw error;
	}
}

/** Reads from cache when fresh; dedupes concurrent fetches for the same sheet. */
export async function loadSheet(sheetName: string, options?: { force?: boolean }): Promise<SheetData> {
	if (!options?.force) {
		const cached = getCachedSheet(sheetName);
		if (cached) return cached;
	}

	const existingLock = loadingLocks[sheetName];
	if (existingLock) {
		return existingLock;
	}

	const promise = fetchSheetFromGoogle(sheetName)
		.then((data) => {
			setCachedSheet(sheetName, data);
			return data;
		})
		.finally(() => {
			delete loadingLocks[sheetName];
		});

	loadingLocks[sheetName] = promise;
	return promise;
}

/** Invalidate cached sheet data after writes or when callers need a forced refresh. */
export function clearCache(sheetName?: string) {
	if (sheetName) {
		invalidateSheetCache(sheetName);
		return;
	}
	for (const key of Object.keys(cache)) {
		delete cache[key];
	}
}
