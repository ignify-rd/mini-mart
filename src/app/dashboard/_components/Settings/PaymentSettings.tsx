"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button, Icon, Textfield } from "xtreme-ui";

import { EmptyState, FormField, IconField, LoadingGate, SettingsCard, SplitHeading } from "#components/base";
import { useAdmin } from "#components/context/useContext";
import { getVietQRBankById, VIETQR_BANKS } from "#utils/constants/vietqrBanks";

import "./paymentSettings.scss";

const PaymentSettings = () => {
	const { profile, profileMutate, profileLoading } = useAdmin();

	const [bankId, setBankId] = useState("");
	const [accountNo, setAccountNo] = useState("");
	const [accountName, setAccountName] = useState("");
	const [previewUrl, setPreviewUrl] = useState("");
	const [saving, setSaving] = useState(false);

	const selectedBank = useMemo(() => getVietQRBankById(bankId), [bankId]);

	useEffect(() => {
		if (profile) {
			const p = profile as Record<string, unknown>;
			setBankId((p.bankId as string) || "");
			setAccountNo((p.accountNo as string) || "");
			setAccountName((p.accountName as string) || "");
		}
	}, [profile]);

	useEffect(() => {
		if (bankId && accountNo) {
			const params = new URLSearchParams({ amount: "10000", addInfo: "PREVIEW" });
			if (accountName) params.set("accountName", accountName);
			setPreviewUrl(`https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?${params.toString()}`);
		} else {
			setPreviewUrl("");
		}
	}, [bankId, accountNo, accountName]);

	const handleSave = async () => {
		if (!bankId) {
			toast.warn("Vui lòng chọn ngân hàng");
			return;
		}
		if (!accountNo.trim()) {
			toast.warn("Vui lòng nhập số tài khoản");
			return;
		}

		setSaving(true);
		const req = await fetch("/api/admin/payment/config", {
			method: "POST",
			body: JSON.stringify({ bankId, accountNo: accountNo.trim(), accountName: accountName.trim() }),
		});
		const res = await req.json();
		if (res.status === 200) {
			toast.success("Đã lưu thông tin thanh toán");
			await profileMutate();
		} else {
			toast.error(res.message || "Lỗi khi lưu");
		}
		setSaving(false);
	};

	return (
		<LoadingGate loading={profileLoading} label="Đang tải...">
			<div className="paymentSettings">
				<SettingsCard
					variant="featured"
					className="paymentSettingsCard"
					header={
						<div className="settingsFeaturedHeader">
							<div className="headerIcon">
								<Icon code="f029" type="solid" size={22} />
							</div>
							<SplitHeading
								as="h2"
								title="Cấu hình"
								accent="VietQR"
								accentTone="brand"
								description="Thiết lập tài khoản nhận tiền để khách quét mã QR khi thanh toán."
							/>
						</div>
					}>
					<div className="paymentBody">
						<div className="paymentForm">
							<FormField label="Ngân hàng" htmlFor="bankId" hint={selectedBank ? `Mã ngân hàng: ${selectedBank.id}` : undefined}>
								<IconField icon="f19c">
									<select id="bankId" value={bankId} onChange={(e) => setBankId(e.target.value)}>
										<option value="">Chọn ngân hàng...</option>
										{bankId && !selectedBank && <option value={bankId}>Mã đã lưu ({bankId})</option>}
										{VIETQR_BANKS.map((bank) => (
											<option key={bank.id} value={bank.id}>
												{bank.shortName} — {bank.name} ({bank.id})
											</option>
										))}
									</select>
								</IconField>
							</FormField>

							<FormField label="Số tài khoản" htmlFor="accountNo">
								<Textfield
									id="accountNo"
									placeholder="VD: 1234567890"
									value={accountNo}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNo(e.target.value)}
								/>
							</FormField>

							<FormField label="Chủ tài khoản" htmlFor="accountName" hint="Tên viết hoa, không dấu — hiển thị trên mã QR">
								<Textfield
									id="accountName"
									placeholder="VD: NGUYEN VAN A"
									value={accountName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountName(e.target.value)}
								/>
							</FormField>

							<Button className="saveBtn" label="Lưu cấu hình" type="primary" onClick={handleSave} loading={saving} />
						</div>

						<div className="paymentPreview">
							<div className="previewCard">
								<div className="previewHeader">
									<Icon code="f029" type="solid" size={14} />
									<span>Xem trước mã QR</span>
								</div>
								{previewUrl ? (
									<>
										<div className="qrFrame">
											<img src={previewUrl} alt="Xem trước mã QR" />
										</div>
										<div className="previewMeta">
											{selectedBank && (
												<p>
													<strong>{selectedBank.shortName}</strong> · {accountNo}
												</p>
											)}
											{accountName && <p className="accountName">{accountName}</p>}
											<p className="sampleAmount">Số tiền mẫu: 10.000đ</p>
										</div>
									</>
								) : (
									<EmptyState message="Chọn ngân hàng và nhập số tài khoản để xem trước mã QR" icon="f029" className="previewEmpty" />
								)}
							</div>
						</div>
					</div>
				</SettingsCard>
			</div>
		</LoadingGate>
	);
};

export default PaymentSettings;
