import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";
import { Profiles } from "#utils/database/models/profile";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };

		const body = await req.json();
		const { bankId, accountNo, accountName } = body;

		await initSheets();

		const account = await Accounts.findOne<TAccount>({ username: session?.username }, { populate: ["profile"] });
		if (!account) throw { status: 500, message: "Không tìm thấy tài khoản" };

		const profile = account.profile as Record<string, unknown>;
		if (!profile?._id) throw { status: 500, message: "Không tìm thấy hồ sơ" };

		await Profiles.findOneAndUpdate({ _id: profile._id as string }, { bankId, accountNo, accountName });

		return NextResponse.json({ status: 200, message: "Đã lưu cấu hình thanh toán" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}
