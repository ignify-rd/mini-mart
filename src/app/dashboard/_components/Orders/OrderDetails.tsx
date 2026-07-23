"use client";

import { usePDF } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { Button } from "xtreme-ui";
import { InvoiceDocument, type TInvoiceProps } from "#components/layout/Invoice";

import "./orderDetails.scss";

const OrderDetails = ({ order, profile }: TInvoiceProps) => {
	const [isClient, setIsClient] = useState(false);
	const [instance, updateInstance] = usePDF({ document: <InvoiceDocument order={order} profile={profile} /> });

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		updateInstance(<InvoiceDocument order={order} profile={profile} />);
	}, [order, profile, updateInstance]);

	const handleDownload = () => {
		if (instance.url) {
			const link = document.createElement("a");
			link.href = instance.url;
			link.download = `HoaDon-${order._id.toString().slice(-6).toUpperCase()}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const handlePrint = () => {
		if (instance.url) {
			const iframe = document.createElement("iframe");
			iframe.style.display = "none";
			iframe.src = instance.url;
			document.body.appendChild(iframe);
			iframe.contentWindow?.focus();
			iframe.contentWindow?.print();
		}
	};

	if (!isClient) return null;

	return (
		<div className="orderDetailsPreview">
			<div className="header">
				<div className="title">
					<h2>Chi tiết đơn hàng</h2>
					<div className="orderId">
						Hoá đơn <span>#{order._id.toString().slice(-6).toUpperCase()}</span>
					</div>
				</div>
				<div className="actions">
					<Button icon="f019" type="primary" className="actionBtn" onClick={handleDownload} disabled={instance.loading || !instance.url} />
					<Button icon="f02f" type="secondary" className="actionBtn" onClick={handlePrint} disabled={instance.loading || !instance.url} />
				</div>
			</div>

			<div className="contentScroll">
				<div className="section customerInfo">
					<div className="infoBlock">
						<span className="label">Ngày</span>
						<span>{new Date(order.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
					</div>

					{order.customerName && (
						<div className="infoBlock">
							<span className="label">Khách hàng</span>
							<span>{order.customerName}</span>
						</div>
					)}
				</div>

				<div className="section itemsList">
					<h3>Sản phẩm</h3>
					<div className="table">
						<div className="row headerRow">
							<span className="col name">Món</span>
							<span className="col qty">SL</span>
							<span className="col price">Đơn giá</span>
							<span className="col total">Thành tiền</span>
						</div>
						{order.products?.map((item, index) => (
							<div key={index} className="row">
								<span className="col name">{(item as Record<string, unknown>).name as string}</span>
								<span className="col qty">x{item.quantity}</span>
								<span className="col price">{item.price?.toLocaleString("vi-VN")}</span>
								<span className="col total">{(item.price * item.quantity).toLocaleString("vi-VN")}</span>
							</div>
						))}
					</div>
				</div>

				<div className="section summary">
					<div className="summaryRow grandTotal">
						<span>Tổng cộng</span>
						<span>{(order.orderTotal || order.paymentAmount || 0).toLocaleString("vi-VN")}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetails;
