export const STORE_ID = process.env.STORE_ID ?? process.env.NEXT_PUBLIC_STORE_ID ?? "minimart";
export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Mini Mart";

export type TPaymentInstructions = {
	amount: number;
	reference: string;
	qrImage: string;
	bankId?: string;
	accountNo?: string;
	accountName?: string;
};

export const getPaymentReference = (orderId: string) => `ORDER-${String(orderId).padStart(6, "0")}`;

export const getPaymentInstructions = (
	orderId: string,
	amount: number,
	profile?: { bankId?: string; accountNo?: string; accountName?: string },
): TPaymentInstructions => {
	const reference = getPaymentReference(orderId);
	const bankId = (profile?.bankId || process.env.PAYMENT_BANK_ID) ?? process.env.NEXT_PUBLIC_PAYMENT_BANK_ID;
	const accountNo = (profile?.accountNo || process.env.PAYMENT_ACCOUNT_NO) ?? process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NO;
	const accountName = (profile?.accountName || process.env.PAYMENT_ACCOUNT_NAME) ?? process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME;
	const staticQr = process.env.PAYMENT_QR_IMAGE_URL ?? process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE_URL ?? "/payment-qr.svg";

	if (bankId && accountNo) {
		const params = new URLSearchParams({
			amount: String(Math.round(amount)),
			addInfo: reference,
		});
		if (accountName) params.set("accountName", accountName);

		return {
			amount,
			reference,
			qrImage: `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?${params.toString()}`,
			bankId,
			accountNo,
			accountName,
		};
	}

	return {
		amount,
		reference,
		qrImage: staticQr,
		bankId,
		accountNo,
		accountName,
	};
};
