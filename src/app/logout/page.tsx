"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { Spinner } from "xtreme-ui";

export default function Logout() {
	const router = useRouter();
	const session = useSession();

	useEffect(() => {
		if (session.status === "loading") return;

		if (session.status === "authenticated") {
			signOut({ redirect: false }).then(() => {
				router.replace("/login");
			});
			return;
		}

		router.replace("/login");
	}, [router, session.status]);

	return <Spinner fullpage label="Đang đăng xuất..." />;
}
