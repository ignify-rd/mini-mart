import { NextResponse } from "next/server";

import { getRestaurantData } from "#utils/database/helper/account";
import type { TMenu } from "#utils/database/models/menu";
import type { TProfile } from "#utils/database/models/profile";
import { CatchNextResponse } from "#utils/helper/common";
import { STORE_ID } from "#utils/store/config";

export async function GET() {
	try {
		const account = await getRestaurantData(STORE_ID);
		if (!account) throw { status: 404, message: "Không tìm thấy cửa hàng" };

		return NextResponse.json({
			profile: account?.profile as TProfile,
			menus: (account?.menus as TMenu[]) ?? [],
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
