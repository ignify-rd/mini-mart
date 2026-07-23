"use client";

import { Button, Icon } from "xtreme-ui";

import QuantityButton from "#components/base/QuantityButton";
import type { TMenu } from "#utils/database/models/menu";

type TCartItem = TMenu & { quantity: number };

type TCartSheetProps = {
	items: TCartItem[];
	total: number;
	customerName: string;
	nameError: string;
	placingOrder: boolean;
	onClose: () => void;
	onCustomerNameChange: (value: string) => void;
	onUpdateQuantity: (id: string, delta: number) => void;
	onCheckout: () => void;
};

const CartSheet = ({
	items,
	total,
	customerName,
	nameError,
	placingOrder,
	onClose,
	onCustomerNameChange,
	onUpdateQuantity,
	onCheckout,
}: TCartSheetProps) => (
	<div className="cartOverlay" onClick={onClose}>
		<div className="cartSheet" onClick={(e) => e.stopPropagation()}>
			<h2>Giỏ hàng</h2>
			{items.length === 0 ? (
				<p className="emptyCart">Giỏ hàng trống</p>
			) : (
				<div className="cartItems">
					{items.map((item) => (
						<div key={item._id} className="cartItem">
							<div className="cartItemInfo">
								<p className="cartItemName">{item.name}</p>
								<p className="cartItemPrice">{(item.price * item.quantity).toLocaleString("vi-VN")}</p>
							</div>
							<QuantityButton
								quantity={item.quantity}
								increaseQuantity={() => onUpdateQuantity(item._id, 1)}
								decreaseQuantity={() => onUpdateQuantity(item._id, -1)}
							/>
						</div>
					))}
				</div>
			)}
			<div className="cartFooter">
				<div className="nameInput">
					<input
						type="text"
						placeholder="Nhập tên của bạn"
						value={customerName}
						onChange={(e) => onCustomerNameChange(e.target.value)}
						className={nameError ? "error" : ""}
					/>
					{nameError && <p className="errorText">{nameError}</p>}
				</div>
				<div className="cartTotalRow">
					<span>Tổng cộng</span>
					<span>{total.toLocaleString("vi-VN")}</span>
				</div>
				<Button
					label={placingOrder ? "Đang xử lý..." : "Đặt hàng"}
					type="primary"
					disabled={items.length === 0 || placingOrder}
					onClick={onCheckout}
				/>
			</div>
		</div>
	</div>
);

export default CartSheet;

type TCartBarProps = {
	count: number;
	total: number;
	onClick: () => void;
};

export const CartBar = ({ count, total, onClick }: TCartBarProps) => (
	<div className="cartBar" onClick={onClick}>
		<span>
			{count} sản phẩm
		</span>
		<span className="cartTotal">{total.toLocaleString("vi-VN")}</span>
		<Icon code="f07a" type="solid" />
	</div>
);
