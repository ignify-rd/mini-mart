"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";
import { Button, Icon } from "xtreme-ui";

import { FormField, IconField, LoadingGate } from "#components/base";

import "./login.scss";

const REMEMBER_USERNAME_KEY = "orderworder_admin_username";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const session = useSession();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [rememberUsername, setRememberUsername] = useState(true);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

	useEffect(() => {
		const savedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY);
		if (savedUsername) {
			setUsername(savedUsername);
			setRememberUsername(true);
		}
	}, []);

	useEffect(() => {
		if (session.status === "authenticated") {
			router.replace(callbackUrl);
		}
	}, [callbackUrl, router, session.status]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");

		if (!username.trim() || !password.trim()) {
			setError("Vui lòng nhập tên đăng nhập và mật khẩu");
			return;
		}

		setLoading(true);

		try {
			const result = await signIn("restaurant", {
				username: username.trim(),
				password: password.trim(),
				redirect: false,
				callbackUrl,
			});

			if (result?.error) {
				setError("Tên đăng nhập hoặc mật khẩu không đúng");
				setLoading(false);
				return;
			}

			if (rememberUsername) localStorage.setItem(REMEMBER_USERNAME_KEY, username.trim());
			else localStorage.removeItem(REMEMBER_USERNAME_KEY);

			router.replace(callbackUrl);
		} catch {
			setError("Đã có lỗi xảy ra, vui lòng thử lại");
			setLoading(false);
		}
	};

	if (session.status === "loading") {
		return (
			<LoadingGate loading label="Đang kiểm tra đăng nhập...">
				<div className="loginPage" />
			</LoadingGate>
		);
	}

	if (session.status === "authenticated") return null;

	return (
		<div className="loginPage">
			<div className="loginBrand">
				<div className="brandContent">
					<Icon code="f2e7" type="solid" size={48} className="brandIcon" />
					<h1 className="brandName">OrderWorder</h1>
					<p className="brandTagline">Đặt hàng không tiếp xúc &amp; trải nghiệm nhà hàng thông minh</p>
					<div className="brandFeatures">
						<div className="featureItem">
							<Icon code="f00c" type="solid" size={14} />
							<span>Quản lý đơn hàng thông minh</span>
						</div>
						<div className="featureItem">
							<Icon code="f00c" type="solid" size={14} />
							<span>Trợ lý AI hỗ trợ đặt món</span>
						</div>
						<div className="featureItem">
							<Icon code="f00c" type="solid" size={14} />
							<span>Bảng điều khiển quản lý toàn diện</span>
						</div>
					</div>
				</div>
			</div>
			<div className="loginFormWrapper">
				<div className="loginFormContainer">
					<div className="formHeader">
						<h2>Đăng nhập</h2>
						<p>Đăng nhập để quản lý cửa hàng</p>
					</div>
					<form onSubmit={handleSubmit} className="loginForm">
						{error && (
							<div className="formError">
								<Icon code="f06a" type="solid" size={14} />
								<span>{error}</span>
							</div>
						)}
						<FormField label="Tên đăng nhập" htmlFor="username">
							<IconField icon="f007">
								<input
									id="username"
									type="text"
									placeholder="Nhập tên đăng nhập hoặc email"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={loading}
									autoFocus
								/>
							</IconField>
						</FormField>
						<FormField label="Mật khẩu" htmlFor="password">
							<IconField icon="f023">
								<input
									id="password"
									type="password"
									placeholder="Nhập mật khẩu"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={loading}
								/>
							</IconField>
						</FormField>
						<label className="rememberRow">
							<input type="checkbox" checked={rememberUsername} onChange={(e) => setRememberUsername(e.target.checked)} disabled={loading} />
							<span>Ghi nhớ tên đăng nhập</span>
						</label>
						<Button label={loading ? "Đang đăng nhập..." : "Đăng nhập"} type="primary" className="loginSubmit" disabled={loading} onClick={handleSubmit} />
					</form>
					<div className="formFooter">
						<a href="/">Quay lại trang chủ</a>
					</div>
				</div>
			</div>
		</div>
	);
}
