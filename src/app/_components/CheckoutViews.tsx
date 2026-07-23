"use client";

import { Button, Icon } from "xtreme-ui";

type TOrderSuccessProps = {
	customerName?: string;
	onBackToMenu: () => void;
};

export const OrderSuccess = ({ customerName, onBackToMenu }: TOrderSuccessProps) => (
	<div className="homepage">
		<div className="orderStatus">
			<Icon code="f00c" type="solid" size={48} />
			<h2>Đặt hàng thành công!</h2>
			<p>Cảm ơn {customerName}!</p>
			<Button label="Quay lại menu" onClick={onBackToMenu} />
		</div>
	</div>
);

type TPaymentViewProps = {
	orderTotal: number;
	paymentReference?: string;
	qrImage?: string;
	confirmingPayment: boolean;
	onConfirm: () => void;
	onBack: () => void;
};

export const PaymentView = ({
	orderTotal,
	paymentReference,
	qrImage,
	confirmingPayment,
	onConfirm,
	onBack,
}: TPaymentViewProps) => (
	<div className="homepage">
		<div className="paymentView">
			<h2>Quét mã QR thanh toán</h2>
			<p className="orderTotal">{orderTotal.toLocaleString("vi-VN")}</p>
			{qrImage && <img src={qrImage} alt="Mã QR thanh toán" className="qrImage" />}
			<p className="paymentRef">Mã giao dịch: {paymentReference}</p>
			<div className="paymentActions">
				<Button
					label={confirmingPayment ? "Đang xử lý..." : "Đã thanh toán"}
					type="primary"
					disabled={confirmingPayment}
					onClick={onConfirm}
				/>
				<Button label="Quay lại" type="secondary" disabled={confirmingPayment} onClick={onBack} />
			</div>
		</div>
	</div>
);
