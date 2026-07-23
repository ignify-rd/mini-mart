import type { ReactNode } from "react";

export const metadata = {
	title: "Mini Mart Quản trị",
};

export default function DashboardLayout({ children }: IRootProps) {
	return <>{children}</>;
}

interface IRootProps {
	children?: ReactNode;
}
