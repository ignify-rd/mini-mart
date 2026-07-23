import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { RestockLogs, type TRestockLog } from "#utils/database/models/restockLog";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };

		await initSheets();

		const menuId = new URL(req.url).searchParams.get("menuId");
		const filter: Record<string, unknown> = {};
		if (menuId) filter.menuId = menuId;

		const logs = await RestockLogs.find<TRestockLog>(filter);
		logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return NextResponse.json(logs);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
