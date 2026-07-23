import { DashboardProvider } from "#components/context";
import NavSideBar from "#components/layout/NavSideBar";

import PageContainer from "./_components/PageContainer";
import "./dashboard.scss";

const navItems = [
	{ label: "Đơn hàng", icon: "f0ce", value: "orders" },
	{ label: "Tồn kho", icon: "f468", value: "inventory" },
	{ label: "Danh mục", icon: "f02d", value: "categories" },
	{ label: "Thực đơn", icon: "e43b", value: "menu" },
	{ label: "Cài đặt", icon: "f013", value: "settings" },
];

export async function generateMetadata({ searchParams }: IMetaDataProps) {
	const s = await searchParams;
	const tabLabels: Record<string, string> = {
		orders: "Đơn hàng",
		inventory: "Tồn kho",
		menu: "Thực đơn",
		categories: "Danh mục",
		settings: "Cài đặt",
	};
	return {
		title: `Mini Mart${s.tab ? ` • ${tabLabels[s.tab] || s.tab}` : ""}`,
	};
}

const Dashboard = () => {
	return (
		<DashboardProvider>
			<div className="dashboard">
				<NavSideBar navItems={navItems} defaultTab="orders" foot />
				<PageContainer />
			</div>
		</DashboardProvider>
	);
};

export default Dashboard;

interface IMetaDataProps {
	params: {
		restaurant: string;
	};
	searchParams: {
		tab?: string;
		[key: string]: string | undefined;
	};
}
