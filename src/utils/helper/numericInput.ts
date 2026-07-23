/** Strip leading zeros; lone "0" is kept (e.g. "007" → "7", "0" → "0"). */
export const normalizeIntegerDigits = (digits: string): string => {
	if (digits === "") return "";
	return digits.replace(/^0+(?=\d)/, "") || "0";
};

export const parseIntegerInput = (raw: string): { display: string; value: number } => {
	const digits = raw.replace(/\D/g, "");
	const display = normalizeIntegerDigits(digits);
	return { display, value: display === "" ? 0 : Number(display) };
};

export const parseDecimalInput = (raw: string): { display: string; value: number } => {
	const cleaned = raw.replace(/[^\d.]/g, "");
	if (cleaned === "") return { display: "", value: 0 };

	const dotIndex = cleaned.indexOf(".");
	if (dotIndex === -1) {
		const display = normalizeIntegerDigits(cleaned);
		return { display, value: display === "" ? 0 : Number(display) };
	}

	const intPart = cleaned.slice(0, dotIndex);
	const decPart = cleaned.slice(dotIndex + 1).replace(/\./g, "");
	const displayInt = intPart.replace(/^0+(?=\d)/, "") || (intPart === "" ? "0" : intPart);
	const display = decPart.length > 0 ? `${displayInt}.${decPart}` : `${displayInt}.`;
	const value = decPart.length > 0 ? Number(`${displayInt}.${decPart}`) : Number(displayInt);
	return { display, value };
};
