export type TStockLevel = "empty" | "low" | "ok";

export const getStockLevel = (stock: number): TStockLevel => {
	if (stock === 0) return "empty";
	if (stock <= 5) return "low";
	return "ok";
};
