import "next-auth";

type AuthUser = Partial<{
	role: "admin";
	_id: string;
	username: string;
	email: string;
	accountActive: boolean;
	subscriptionActive: boolean;
	verified: boolean;
}>;

declare module "next-auth" {
	interface User {
		role: "admin";
		_doc: AuthUser;
	}

	interface Session extends AuthUser {
		expires: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		user: AuthUser;
	}
}
