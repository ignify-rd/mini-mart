import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		await initSheets();
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };

		const account = await Accounts.findOne<TAccount>({ username: session?.username }, { populate: ["profile", "menus"] });

		if (!account) throw { status: 500, message: "Không thể tải dữ liệu" };

		return NextResponse.json({
			profile: account.profile,
			menus: account.menus,
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
