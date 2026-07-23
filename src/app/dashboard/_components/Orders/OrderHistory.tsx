import { type UIEvent, useEffect, useMemo, useState } from "react";

import { AdminSearchBar } from "#components/base";
import SideSheet from "#components/base/SideSheet";
import { useAdmin } from "#components/context/useContext";
import NoContent from "#components/layout/NoContent";
import type { TOrder } from "#utils/database/models/order";

import OrderDetails from "./OrderDetails";
import OrdersCard from "./OrdersCard";

const OrderHistory = (props: TOrderHistoryProps) => {
	const { onScroll } = props;
	const { orders = [], profile } = useAdmin();

	const [activeCardID, setActiveCardID] = useState<string>();
	const [activeCardData, setActiveCardData] = useState<TOrder & { _id: string; createdAt: string | Date }>();
	const [sideSheetOpen, setSideSheetOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredOrders = useMemo(() => {
		if (!normalizedQuery) return orders;
		return orders.filter((order) => {
			const customerName = (order.customerName ?? "").toLowerCase();
			const orderId = String(order._id).toLowerCase();
			const paymentReference = (order.paymentReference ?? "").toLowerCase();
			const total = String(order.orderTotal ?? "");
			return (
				customerName.includes(normalizedQuery) ||
				orderId.includes(normalizedQuery) ||
				paymentReference.includes(normalizedQuery) ||
				total.includes(normalizedQuery)
			);
		});
	}, [orders, normalizedQuery]);

	useEffect(() => {
		if (filteredOrders.length === 0) {
			setActiveCardID(undefined);
			setActiveCardData(undefined);
			return;
		}

		const stillVisible = filteredOrders.some(({ _id }) => _id.toString() === activeCardID);
		if (!stillVisible) {
			setActiveCardID(filteredOrders[0]?._id.toString());
			setActiveCardData(filteredOrders[0] as TOrder & { _id: string; createdAt: string | Date });
		}
	}, [activeCardID, filteredOrders]);

	return (
		<div className="orders">
			{orders.length === 0 ? (
				<NoContent label="Chưa có đơn hàng" animationName="GhostNoContent" />
			) : (
				<div className="ordersContent">
					<div className="list" onScroll={onScroll}>
						<div className="ordersSearchWrap">
							<AdminSearchBar
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder="Tìm theo tên khách, mã đơn, tham chiếu..."
							/>
						</div>
						{filteredOrders.length === 0 ? (
							<p className="ordersSearchEmpty">Không tìm thấy đơn hàng phù hợp</p>
						) : (
							filteredOrders.map((data, i) => (
								<OrdersCard
									key={i}
									data={data}
									active={activeCardID === data._id.toString()}
									activate={(orderID) => {
										setActiveCardID(orderID);
										setActiveCardData(
											filteredOrders.find((order) => order._id.toString() === orderID) as TOrder & {
												_id: string;
												createdAt: string | Date;
											},
										);
										if (window.matchMedia("(width <= 750px)").matches) {
											setSideSheetOpen(true);
										}
									}}
								/>
							))
						)}
					</div>
					<div className="details">
						{!activeCardData ? (
							<NoContent label={normalizedQuery ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng"} animationName="GhostNoContent" size={200} />
						) : (
							<OrderDetails order={activeCardData} profile={profile} />
						)}
					</div>
				</div>
			)}
			<SideSheet title={["Chi tiết đơn hàng"]} open={sideSheetOpen} setOpen={setSideSheetOpen}>
				{activeCardData && <OrderDetails order={activeCardData} profile={profile} />}
			</SideSheet>
		</div>
	);
};

export default OrderHistory;

export type TOrderHistoryProps = {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
