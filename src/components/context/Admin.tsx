import noop from "lodash/noop";
import { createContext, type ReactNode } from "react";
import useSWR from "swr";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder } from "#utils/database/models/order";
import type { TProfile } from "#utils/database/models/profile";
import { fetcher } from "#utils/helper/common";

const AdminDefault: TAdminInitialType = {
	profile: undefined,
	menus: [],
	profileLoading: false,
	profileMutate: () => new Promise(noop),
	orders: [],
	orderLoading: false,
};

const sortByDate = (a: { updatedAt: string | number | Date }, b: { updatedAt: string | number | Date }) =>
	new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

export const AdminContext = createContext(AdminDefault);
export const AdminProvider = ({ children }: TAdminProviderProps) => {
	const {
		data: adminData,
		isLoading: profileLoading,
		mutate: profileMutate,
	} = useSWR("/api/admin", fetcher, {
		dedupingInterval: 10000,
		revalidateOnFocus: false,
	});
	const { data: orderData, isLoading: orderLoading } = useSWR("/api/admin/order", fetcher, {
		refreshInterval: 20000,
		dedupingInterval: 10000,
		revalidateOnFocus: false,
	});

	const profile = adminData?.profile as TProfile | undefined;
	const menus = (Array.isArray(adminData?.menus) ? adminData.menus : []) as TMenu[];
	const orders = (Array.isArray(orderData) ? orderData : []).slice().sort(sortByDate);

	return (
		<AdminContext.Provider
			value={{
				profile,
				menus,
				profileLoading,
				profileMutate,
				orders,
				orderLoading,
			}}>
			{children}
		</AdminContext.Provider>
	);
};

export type TAdminProviderProps = {
	children?: ReactNode;
};

export type TAdminInitialType = {
	profile?: TProfile;
	menus: TMenu[];
	profileLoading: boolean;
	profileMutate: () => Promise<void>;
	orders: TOrder[];
	orderLoading: boolean;
};
