import { getSheetsClient } from "#utils/sheets/client";

let initialized = false;

/** Initialize Google Sheets client once per process. */
export async function initSheets() {
	if (initialized) return;
	getSheetsClient();
	initialized = true;
}

export default initSheets;
