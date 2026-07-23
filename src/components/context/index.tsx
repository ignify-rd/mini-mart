"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode, Suspense } from "react";
import { XProvider } from "xtreme-ui";
import ThemeLock from "#components/base/ThemeLock";
import { ToastManager } from "#components/base/ToastManager";

import { AdminProvider } from "./Admin";
import { OrderProvider } from "./Order";
import { RestaurantProvider } from "./Restaurant";

const SESSION_REFETCH_SECONDS = 5 * 60;

export const GlobalProvider = ({ children }: ProviderProps) => {
	return (
		<XProvider>
			<ThemeLock />
			<SessionProvider refetchInterval={SESSION_REFETCH_SECONDS} refetchOnWindowFocus>
				<Suspense>{children}</Suspense>
			</SessionProvider>
		</XProvider>
	);
};

export const CustomerProvider = ({ children }: ProviderProps) => {
	return (
		<RestaurantProvider>
			<ToastManager />
			<OrderProvider>{children}</OrderProvider>
		</RestaurantProvider>
	);
};

export const DashboardProvider = ({ children }: ProviderProps) => {
	return (
		<AdminProvider>
			<ToastManager />
			{children}
		</AdminProvider>
	);
};
interface ProviderProps {
	children?: ReactNode;
}
