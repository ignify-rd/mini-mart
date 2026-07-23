import noop from "lodash/noop";
import pick from "lodash/pick";
import { createContext, type ReactNode, useState } from "react";
import { toast } from "react-toastify";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder } from "#utils/database/models/order";
import type { TPaymentInstructions } from "#utils/store/config";

const OrderDefault: TOrderInitialType = {
	order: undefined,
	pendingCheckout: undefined,
	placeOrder: () => new Promise(noop),
	placingOrder: false,
	confirmPayment: () => new Promise(noop),
	confirmingPayment: false,
	clearCheckout: noop,
	resetOrder: noop,
	loginOpen: false,
	setLoginOpen: noop,
};

export const OrderContext = createContext(OrderDefault);
export const OrderProvider = ({ children }: TOrderProviderProps) => {
	const [pendingCheckout, setPendingCheckout] = useState<TPendingCheckout>();
	const [order, setOrder] = useState<TCheckoutOrder>();
	const [placingOrder, setPlacingOrder] = useState(false);
	const [confirmingPayment, setConfirmingPayment] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);

	const placeOrder = async (products: Array<TMenuCustom>, customerName: string) => {
		setPlacingOrder(true);
		const req = await fetch("/api/order/checkout", {
			method: "POST",
			body: JSON.stringify({
				products: products.map((product) => pick(product, ["_id", "quantity"])),
				customerName,
			}),
		});
		const res = await req.json();

		if (!req.ok) toast.error(res?.message);
		if (req.ok && res?.checkout) setPendingCheckout(res.checkout);
		setPlacingOrder(false);
	};

	const confirmPayment = async () => {
		if (!pendingCheckout) return;
		setConfirmingPayment(true);
		const req = await fetch("/api/order/payment/confirm", {
			method: "POST",
			body: JSON.stringify({
				products: pendingCheckout.products,
				customerName: pendingCheckout.customerName,
				paymentReference: pendingCheckout.paymentReference,
			}),
		});
		const res = await req.json();

		if (!req.ok) toast.error(res?.message);
		if (req.ok && res?.order) {
			setOrder(res.order);
			setPendingCheckout(undefined);
		}
		setConfirmingPayment(false);
	};

	const clearCheckout = () => setPendingCheckout(undefined);
	const resetOrder = () => {
		setOrder(undefined);
		setPendingCheckout(undefined);
	};

	return (
		<OrderContext.Provider
			value={{
				order,
				pendingCheckout,
				placeOrder,
				placingOrder,
				confirmPayment,
				confirmingPayment,
				clearCheckout,
				resetOrder,
				loginOpen,
				setLoginOpen,
			}}>
			{children}
		</OrderContext.Provider>
	);
};

export type TOrderProviderProps = {
	children?: ReactNode;
};

export type TPendingCheckout = {
	products: Array<{ _id: string; quantity: number }>;
	customerName: string;
	orderTotal: number;
	paymentReference: string;
	paymentAmount: number;
	payment?: TPaymentInstructions;
	displayProducts?: Array<Record<string, unknown>>;
};

export type TOrderInitialType = {
	order?: TCheckoutOrder;
	pendingCheckout?: TPendingCheckout;
	placeOrder: (products: Array<TMenuCustom>, customerName: string) => Promise<void>;
	placingOrder: boolean;
	confirmPayment: () => Promise<void>;
	confirmingPayment: boolean;
	clearCheckout: () => void;
	resetOrder: () => void;
	loginOpen: boolean;
	setLoginOpen: (open: boolean) => void;
};

type TMenuCustom = TMenu & { quantity: number };
type TCheckoutOrder = TOrder & { payment?: TPaymentInstructions };
