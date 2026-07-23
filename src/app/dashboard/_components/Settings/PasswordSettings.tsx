import type { ChangeEvent } from "react";
import { useState } from "react";

import { toast } from "react-toastify";
import { Button, Spinner, Textfield } from "xtreme-ui";

import { SettingsActions, SettingsCard, SettingsSectionHeader } from "#components/base";

import "./passwordSettings.scss";

const PasswordSettings = () => {
	const [loading, setLoading] = useState(false);

	const [passwordShake, setPasswordShake] = useState(false);
	const [confPasswordShake, setConfPasswordShake] = useState(false);

	const [authenticated, setAuthenticated] = useState(false);

	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newConfPassword, setNewConfPassword] = useState("");

	const onClear = () => {
		setAuthenticated(false);
		setPassword("");
		setNewPassword("");
		setNewConfPassword("");
	};
	const onSave = async () => {
		if (!authenticated) {
			toast.error("Không thể đổi mật khẩu");
			return onClear();
		}
		if (!newPassword) {
			return toast.warn("Vui lòng nhập mật khẩu mới");
		}
		if (!newConfPassword) {
			return toast.warn("Vui lòng xác nhận mật khẩu mới");
		}
		if (newPassword !== newConfPassword) {
			setConfPasswordShake(true);
			setTimeout(() => setConfPasswordShake(false), 600);
			return toast.warn("Mật khẩu mới và xác nhận phải khớp");
		}

		setLoading(true);

		const req = await fetch("/api/admin/password/change", {
			method: "POST",
			body: JSON.stringify({ password, newPassword }),
		});
		const res = await req.json();

		if (res?.status === 200) toast.success(res?.message);
		else toast.error(res?.message);

		setAuthenticated(false);
		setPassword("");
		setNewPassword("");
		setNewConfPassword("");
		setLoading(false);
	};
	const onPasswordKeyPress = async () => {
		if (!authenticated) {
			if (!password.trim()) {
				toast.warn("Vui lòng nhập mật khẩu hiện tại");
				return;
			}

			setLoading(true);
			const req = await fetch("/api/admin/password/check", {
				method: "POST",
				body: JSON.stringify({ password }),
			});
			const res = await req.json();

			if (res?.status === 200) setAuthenticated(true);
			else {
				setPasswordShake(true);
				setTimeout(() => setPasswordShake(false), 600);
				toast.error(res?.message);
			}
			setLoading(false);
		}
	};
	const onNewPasswordKeyPress = () => {
		if (authenticated) onSave();
	};
	return (
		<SettingsCard className="passwordSettings">
			<SettingsSectionHeader
				title="Đổi"
				accent="mật khẩu"
				actions={
					authenticated ? (
						<SettingsActions onClear={onClear} onSave={onSave} loading={loading} saveLabel="Đổi mật khẩu" />
					) : (
						<Button label="Tiếp tục" icon="f054" iconType="solid" loading={loading} disabled={!password.trim()} onClick={onPasswordKeyPress} />
					)
				}
			/>
			<div className="passwordFields">
				{loading ? (
					<Spinner className="spinner" label="Đang xác thực..." fullpage />
				) : !authenticated ? (
					<Textfield
						className={`password ${passwordShake ? "shake" : ""}`}
						placeholder="Nhập mật khẩu hiện tại"
						type="password"
						onEnterKey={onPasswordKeyPress}
						value={password}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
					/>
				) : (
					<>
						<Textfield
							className={`newPassword ${passwordShake ? "shake" : ""}`}
							placeholder="Nhập mật khẩu mới"
							type="password"
							onEnterKey={onNewPasswordKeyPress}
							value={newPassword}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
						/>

						<Textfield
							className={`newConfPassword ${confPasswordShake ? "shake" : ""}`}
							placeholder="Xác nhận mật khẩu mới"
							type="password"
							onEnterKey={onNewPasswordKeyPress}
							value={newConfPassword}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setNewConfPassword(e.target.value)}
						/>
					</>
				)}
			</div>
		</SettingsCard>
	);
};

export default PasswordSettings;
