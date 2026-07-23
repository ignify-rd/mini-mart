import { invalidateSheetCache, loadSheet } from "./cache";
import { getSheetsClient, getSpreadsheetId } from "./client";
import { matchRow, parseValue, serializeValue } from "./parse";
import type { Filter, RowData } from "./types";

export { clearCache, loadSheet } from "./cache";
export type { Filter, RowData, SheetData } from "./types";

export async function findAll(sheetName: string, filter?: Filter): Promise<RowData[]> {
	const { rows } = await loadSheet(sheetName);
	if (!filter || Object.keys(filter).length === 0) return [...rows];
	return rows.filter((row) => matchRow(row, filter));
}

export async function findOne(sheetName: string, filter: Filter): Promise<RowData | null> {
	const results = await findAll(sheetName, filter);
	return results[0] ?? null;
}

export async function findById(sheetName: string, id: string): Promise<RowData | null> {
	return findOne(sheetName, { _id: id });
}

export async function getNextId(sheetName: string): Promise<string> {
	const rows = await findAll(sheetName);
	let max = 0;
	for (const row of rows) {
		const id = Number(row._id);
		if (!Number.isNaN(id) && id > max) max = id;
	}
	return String(max + 1);
}

export async function getNextIds(sheetName: string, count: number): Promise<string[]> {
	const rows = await findAll(sheetName);
	let max = 0;
	for (const row of rows) {
		const id = Number(row._id);
		if (!Number.isNaN(id) && id > max) max = id;
	}
	return Array.from({ length: count }, (_, i) => String(max + 1 + i));
}

async function ensureHeaders(sheetName: string, data: RowData): Promise<string[]> {
	const { headers } = await loadSheet(sheetName);
	if (headers.length > 0) return headers;

	const newHeaders = ["_id", ...Object.keys(data)];
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: `${sheetName}!A1`,
		valueInputOption: "RAW",
		requestBody: { values: [newHeaders] },
	});

	invalidateSheetCache(sheetName);
	return newHeaders;
}

/** Append missing columns to an existing sheet header row. */
export async function ensureColumns(sheetName: string, requiredHeaders: string[]): Promise<string[]> {
	const { headers } = await loadSheet(sheetName);
	if (headers.length === 0) {
		const sheets = getSheetsClient();
		const spreadsheetId = getSpreadsheetId();

		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range: `${sheetName}!A1`,
			valueInputOption: "RAW",
			requestBody: { values: [requiredHeaders] },
		});
		invalidateSheetCache(sheetName);
		return requiredHeaders;
	}

	const missing = requiredHeaders.filter((header) => !headers.includes(header));
	if (missing.length === 0) return headers;

	const newHeaders = [...headers, ...missing];
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: `${sheetName}!A1`,
		valueInputOption: "RAW",
		requestBody: { values: [newHeaders] },
	});

	invalidateSheetCache(sheetName);
	return newHeaders;
}

function buildRowValues(headers: string[], data: RowData): string[] {
	return headers.map((h) => {
		if (h === "_id") return String(data._id ?? "");
		return serializeValue(data[h]);
	});
}

function rowValuesToDoc(headers: string[], row: string[]): RowData {
	return Object.fromEntries(headers.map((h, i) => [h, parseValue(row[i])]));
}

export async function insertOne(sheetName: string, data: RowData): Promise<RowData> {
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();
	const headers = await ensureHeaders(sheetName, data);
	const payload = data._id == null || data._id === "" ? { ...data, _id: await getNextId(sheetName) } : { ...data, _id: String(data._id) };
	const row = buildRowValues(headers, payload);

	await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: `${sheetName}!A:ZZ`,
		valueInputOption: "RAW",
		insertDataOption: "INSERT_ROWS",
		requestBody: { values: [row] },
	});

	invalidateSheetCache(sheetName);
	return rowValuesToDoc(headers, row);
}

export async function updateOne(sheetName: string, filter: Filter, data: Partial<RowData>): Promise<RowData | null> {
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();
	const { headers, rows } = await loadSheet(sheetName);

	const idx = rows.findIndex((r) => matchRow(r, filter));
	if (idx === -1) return null;

	const rowNum = idx + 2;
	const updated = { ...rows[idx], ...data };
	const rowValues = headers.map((h) => serializeValue(updated[h]));

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: `${sheetName}!A${rowNum}`,
		valueInputOption: "RAW",
		requestBody: { values: [rowValues] },
	});

	invalidateSheetCache(sheetName);
	return updated;
}

export async function updateOneById(sheetName: string, id: string, data: Partial<RowData>): Promise<RowData | null> {
	return updateOne(sheetName, { _id: id }, data);
}

export async function setField(sheetName: string, id: string, field: string, value: unknown): Promise<void> {
	await updateOneById(sheetName, id, { [field]: value });
}

export async function deleteMany(sheetName: string, filter: Filter): Promise<number> {
	const { rows } = await loadSheet(sheetName);

	const toDelete = rows.map((r, i) => ({ row: i + 2, match: matchRow(r, filter) })).filter((x) => x.match);
	if (toDelete.length === 0) return 0;

	toDelete.sort((a, b) => b.row - a.row);

	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();
	const meta = await sheets.spreadsheets.get({ spreadsheetId });
	const sheetId = meta.data.sheets?.find((s) => s.properties?.title === sheetName)?.properties?.sheetId;
	if (sheetId == null) throw new Error(`Sheet "${sheetName}" not found`);

	await sheets.spreadsheets.batchUpdate({
		spreadsheetId,
		requestBody: {
			requests: toDelete.map(({ row }) => ({
				deleteDimension: {
					range: {
						sheetId,
						dimension: "ROWS",
						startIndex: row - 1,
						endIndex: row,
					},
				},
			})),
		},
	});

	invalidateSheetCache(sheetName);
	return toDelete.length;
}

export async function insertMany(sheetName: string, dataArray: RowData[]): Promise<RowData[]> {
	if (dataArray.length === 0) return [];
	if (dataArray.length === 1) return [await insertOne(sheetName, dataArray[0])];

	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();
	const headers = await ensureHeaders(sheetName, dataArray[0]);
	const generatedIds = await getNextIds(sheetName, dataArray.filter((data) => data._id == null || data._id === "").length);

	let nextIndex = 0;
	const values = dataArray.map((data) => {
		const id = data._id == null || data._id === "" ? generatedIds[nextIndex++] : String(data._id);
		return buildRowValues(headers, { ...data, _id: id });
	});

	await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: `${sheetName}!A:ZZ`,
		valueInputOption: "RAW",
		insertDataOption: "INSERT_ROWS",
		requestBody: { values },
	});

	invalidateSheetCache(sheetName);
	return values.map((row) => rowValuesToDoc(headers, row));
}

export async function populateDoc<T extends RowData>(doc: T, field: string, targetSheet: string): Promise<T & Record<string, unknown>> {
	if (!doc[field]) return { ...doc, [field]: undefined };

	const ids = (Array.isArray(doc[field]) ? (doc[field] as unknown[]) : [doc[field]]).map(String);
	const referenced = await findAll(targetSheet);
	const matched = referenced.filter((r) => ids.includes(String(r._id)));
	const result = Array.isArray(doc[field]) ? matched : matched[0];

	return { ...doc, [field]: result };
}

export async function count(sheetName: string, filter?: Filter): Promise<number> {
	const results = await findAll(sheetName, filter);
	return results.length;
}

export async function getSheetNames(): Promise<string[]> {
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();
	const res = await sheets.spreadsheets.get({ spreadsheetId });
	return res.data.sheets?.map((s) => s.properties?.title ?? "") ?? [];
}

export async function ensureSheet(sheetName: string, headers: string[]): Promise<void> {
	const sheets = getSheetsClient();
	const spreadsheetId = getSpreadsheetId();
	const existing = await getSheetNames();

	if (existing.includes(sheetName)) return;

	await sheets.spreadsheets.batchUpdate({
		spreadsheetId,
		requestBody: {
			requests: [
				{
					addSheet: {
						properties: { title: sheetName },
					},
				},
			],
		},
	});

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: `${sheetName}!A1`,
		valueInputOption: "RAW",
		requestBody: { values: [headers] },
	});
}
