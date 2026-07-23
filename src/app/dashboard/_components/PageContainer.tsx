"use client";

import { useSession } from "next-auth/react";
import { type UIEvent, useEffect, useState } from "react";
import { Spinner } from "xtreme-ui";

import { useQueryParams } from "#utils/hooks/useQueryParams";
import Categories from "./Categories/Categories";
import Inventory from "./Inventory/Inventory";
import Menu from "./Menu/Menu";
import NavTopBar from "./Orders/NavTopBar";
import Orders from "./Orders/Orders";
import Settings from "./Settings/Settings";

export default function PageContainer() {
	const session = useSession();
	const [floatHeader, setFloatHeader] = useState(false);
	const queryParams = useQueryParams();
	const tab = queryParams.get("tab") ?? "";
	const tabLabels: Record<string, string> = {
		orders: "Đơn hàng",
		inventory: "Tồn kho",
		menu: "Thực đơn",
		categories: "Danh mục",
		settings: "Cài đặt",
	};

	const onScroll = (event: UIEvent<HTMLDivElement>) => {
		if ((event.target as HTMLDivElement).scrollTop >= 1) return setFloatHeader(true);
		return setFloatHeader(false);
	};

	useEffect(() => {
		if (session.status !== "unauthenticated") return;
		queryParams.router.replace("/login?callbackUrl=/dashboard");
	}, [queryParams.router, session.status]);

	if (session.status === "loading") {
		return <Spinner fullpage label="Đang kiểm tra đăng nhập..." />;
	}

	if (session.status === "unauthenticated") return null;

	return (
		<div className={`dashboardViewport ${floatHeader ? "floatHeader" : ""}`}>
			<div className="dashboardHeader">
				<h1 className="dashboardHeading">{tabLabels[tab] || tab}</h1>
				<NavTopBar />
			</div>
			<div className="dashboardContent">
				{
					{
						orders: <Orders onScroll={onScroll} />,
						inventory: <Inventory />,
						menu: <Menu onScroll={onScroll} />,
						categories: <Categories onScroll={onScroll} />,
						settings: <Settings onScroll={onScroll} />,
					}[tab]
				}
			</div>
		</div>
	);
}
