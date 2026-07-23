import type { UIEvent } from "react";

import { LoadingGate } from "#components/base";
import { useAdmin } from "#components/context/useContext";

import OrderHistory from "./OrderHistory";
import "./orders.scss";

const Orders = (props: TOrdersProps) => {
	const { onScroll } = props;
	const { orderLoading } = useAdmin();

	return (
		<LoadingGate loading={orderLoading} label="Đang tải đơn hàng...">
			<OrderHistory onScroll={onScroll} />
		</LoadingGate>
	);
};

export default Orders;

export type TOrdersProps = {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
