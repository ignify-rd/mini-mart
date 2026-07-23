import initSheets from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";

export async function getRestaurantData(username: string) {
	await initSheets();
	return Accounts.findOne<TAccount>({ username }, { populate: ["profile", "menus"] });
}
