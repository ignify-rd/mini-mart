import { google, type sheets_v4 } from "googleapis";

let sheetsClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
	if (sheetsClient) return sheetsClient;

	const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const key = process.env.GOOGLE_PRIVATE_KEY;

	if (!email || !key) {
		throw new Error("Missing Google Sheets credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env");
	}

	const auth = new google.auth.JWT({
		email,
		key: key.replace(/\\n/g, "\n"),
		scopes: ["https://www.googleapis.com/auth/spreadsheets"],
	});

	sheetsClient = google.sheets({ version: "v4", auth });
	return sheetsClient;
}

export function getSpreadsheetId(): string {
	const id = process.env.GOOGLE_SHEETS_ID;
	if (!id) throw new Error("Missing GOOGLE_SHEETS_ID in .env");
	return id;
}
