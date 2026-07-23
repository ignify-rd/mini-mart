import type { Filter, RowData } from "./types";

export function parseValue(value: string): unknown {
	if (value === "" || value === undefined) return undefined;
	const trimmed = value.trim();
	const upper = trimmed.toUpperCase();
	if (upper === "TRUE") return true;
	if (upper === "FALSE") return false;
	try {
		return JSON.parse(trimmed);
	} catch {
		return value;
	}
}

export function serializeValue(value: unknown): string {
	if (value === undefined || value === null) return "";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

export function matchRow(row: RowData, filter: Filter): boolean {
	for (const [key, value] of Object.entries(filter)) {
		if (key === "_id") {
			if (String(row[key]) !== String(value)) return false;
		} else if (row[key] !== value) {
			return false;
		}
	}
	return true;
}
