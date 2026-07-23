import clsx from "clsx";

import type { TOrder } from "#utils/database/models/order";

import "./ordersCard.scss";

const OrdersCard = (props: TOrdersCard) => {
	const { data, active, activate } = props;
	const customerName = data?.customerName || "Khách";

	return (
		<div
			className={clsx("ordersCard", active && "active")}
			onClick={() => {
				activate(data._id.toString());
			}}>
			<div className="content">
				<p className="name">{customerName}</p>
				{!data?.products?.length ? <p className="noContent">Chưa có đơn hàng</p> : <p className="total rupee">{data?.orderTotal.toLocaleString("vi-VN")}</p>}
			</div>
		</div>
	);
};

export default OrdersCard;

type TOrdersCard = {
	data: TOrder;
	active?: boolean;
	activate: (id: string) => void;
};
