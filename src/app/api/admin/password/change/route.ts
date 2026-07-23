import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import initSheets from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { verifyPassword } from "#utils/helper/passwordHelper";

export async function POST(req: Request) {
	try {
		await initSheets();
		const session = await getServerSession(authOptions);
		const { password, newPassword } = await req.json();

		if (!session) throw { status: 401, message: "Yêu cầu xác thực" };
		if (!password) throw { status: 400, message: "Vui lòng nhập mật khẩu" };
		if (!newPassword) throw { status: 400, message: "Vui lòng nhập mật khẩu mới" };

		const account = await Accounts.findOne<TAccount>({ username: session?.username });

		if (!account) throw { status: 500, message: "Đã có lỗi xảy ra" };

		const valid = await verifyPassword(password, account.password);

		if (valid) {
			await Accounts.findOneAndUpdate({ username: session?.username }, { password: newPassword });
			return NextResponse.json({ status: 200, message: "Đổi mật khẩu thành công" });
		}

		return NextResponse.json({ status: 403, message: "Mật khẩu không đúng" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
