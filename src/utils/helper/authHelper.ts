import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import initSheets from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";
import { isEmailValid } from "./common";
import { verifyPassword } from "./passwordHelper";

const SESSION_MAX_AGE = 90 * 24 * 60 * 60;

export const authOptions: AuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
	},
	providers: [
		CredentialsProvider({
			id: "restaurant",
			name: "restaurant",
			credentials: {
				username: { label: "Tên đăng nhập", type: "text", placeholder: "Nhập tên đăng nhập hoặc email" },
				password: { label: "Mật khẩu", type: "password", placeholder: "Nhập mật khẩu" },
			},
			async authorize(cred) {
				if (!cred?.username) throw new Error("Vui lòng nhập tên đăng nhập");
				if (!cred?.password) throw new Error("Vui lòng nhập mật khẩu");

				await initSheets();
				const credential = isEmailValid(cred?.username) ? { email: cred?.username } : { username: cred?.username };
				const account = await Accounts.findOne<TAccount>(credential, { populate: ["profile"] });

				if (!account) throw new Error("Không tìm thấy tài khoản.");
				if (!(await verifyPassword(cred?.password, account.password))) throw new Error("Thông tin đăng nhập không đúng");

				return {
					id: account._id.toString(),
					role: "admin",
					_doc: account as unknown as Record<string, unknown>,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: SESSION_MAX_AGE,
		updateAge: 24 * 60 * 60,
	},
	jwt: {
		maxAge: SESSION_MAX_AGE,
	},
	callbacks: {
		async session({ session, token }) {
			session = {
				...session,
				...token?.user,
			};
			delete session.user;
			return session;
		},
		async jwt({ token, user, account }) {
			if (account?.provider === "restaurant" && user) {
				token.user = {
					role: user?.role,
					...Object.fromEntries(
						["email", "accountActive", "subscriptionActive", "username", "verified"]
							.filter((k) => (user._doc as Record<string, unknown>)?.[k] !== undefined)
							.map((k) => [k, (user._doc as Record<string, unknown>)[k]]),
					),
				};
			}
			return token;
		},
	},
};
