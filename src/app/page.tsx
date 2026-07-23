"use client";

import { useContext, useMemo, useState } from "react";
import { Button, Icon } from "xtreme-ui";

import { CustomerProvider } from "#components/context";
import { OrderContext } from "#components/context/Order";
import { RestaurantContext } from "#components/context/Restaurant";
import ItemCard from "#components/layout/ItemCard";
import type { TMenu } from "#utils/database/models/menu";
import { getMenuCategoryKey, getUniqueMenuCategories } from "#utils/helper/menuCategories";
import { STORE_NAME } from "#utils/store/config";

import CartSheet, { CartBar } from "./_components/CartSheet";
import { OrderSuccess, PaymentView } from "./_components/CheckoutViews";
import MenuToolbar from "./_components/MenuToolbar";
import StoreHeader from "./_components/StoreHeader";
import "./homepage.scss";

export default function Homepage() {
	return (
		<CustomerProvider>
			<MenuPage />
		</CustomerProvider>
	);
}

function MenuPage() {
	const { restaurant, loading } = useContext(RestaurantContext);
	const { order, pendingCheckout, placeOrder, placingOrder, confirmPayment, confirmingPayment, clearCheckout, resetOrder } =
		useContext(OrderContext);
	const [cart, setCart] = useState<Record<string, number>>({});
	const [showCart, setShowCart] = useState(false);
	const [customerName, setCustomerName] = useState("");
	const [nameError, setNameError] = useState("");
	const [activeCategory, setActiveCategory] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const menus = (restaurant?.menus ?? []) as TMenu[];
	const profile = restaurant?.profile as Record<string, unknown> | undefined;
	const storeName = (profile?.name as string) || STORE_NAME;
	const storeDesc = profile?.description as string | undefined;
	const storeAddress = profile?.address as string | undefined;
	const coverImage = profile?.cover as string | undefined;
	const avatarImage = profile?.avatar as string | undefined;

	const visibleMenus = useMemo(() => menus.filter((m) => !m.hidden && m.stock > 0), [menus]);
	const categories = useMemo(() => getUniqueMenuCategories(visibleMenus), [visibleMenus]);
	const normalizedQuery = searchQuery.trim().toLowerCase();

	const filteredMenus = useMemo(() => {
		let items = visibleMenus;
		if (normalizedQuery) {
			items = items.filter(
				(m) => m.name.toLowerCase().includes(normalizedQuery) || (m.category ?? "").toLowerCase().includes(normalizedQuery),
			);
		}
		if (activeCategory) {
			const activeCategoryKey = getMenuCategoryKey(activeCategory);
			items = items.filter((m) => getMenuCategoryKey(m.category ?? "") === activeCategoryKey);
		}
		return items;
	}, [visibleMenus, normalizedQuery, activeCategory]);

	const displayCategories = useMemo(() => getUniqueMenuCategories(filteredMenus), [filteredMenus]);

	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		const source = normalizedQuery
			? visibleMenus.filter(
					(m) => m.name.toLowerCase().includes(normalizedQuery) || (m.category ?? "").toLowerCase().includes(normalizedQuery),
				)
			: visibleMenus;

		for (const item of source) {
			const category =
				categories.find((cat) => getMenuCategoryKey(cat) === getMenuCategoryKey(item.category ?? "")) ??
				(item.category ?? "").trim();
			if (!category) continue;
			counts[category] = (counts[category] ?? 0) + 1;
		}
		return counts;
	}, [visibleMenus, normalizedQuery, categories]);

	const handleCategorySelect = (cat: string) => {
		setActiveCategory(cat);
		if (cat) {
			requestAnimationFrame(() => {
				document.getElementById(`category-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
			});
		}
	};

	const cartItems = useMemo(() => {
		return Object.entries(cart)
			.map(([id, qty]) => {
				const item = menus.find((m) => m._id === id);
				return item ? { ...item, quantity: qty } : null;
			})
			.filter(Boolean) as (TMenu & { quantity: number })[];
	}, [cart, menus]);

	const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
	const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

	const updateQuantity = (id: string, delta: number) => {
		setCart((prev) => {
			const next = (prev[id] ?? 0) + delta;
			if (next <= 0) {
				const { [id]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [id]: next };
		});
	};

	const handleCheckout = async () => {
		if (!customerName.trim()) {
			setNameError("Vui lòng nhập tên của bạn");
			return;
		}
		setNameError("");
		await placeOrder(cartItems, customerName.trim());
	};

	if (order) {
		return (
			<OrderSuccess
				customerName={order.customerName}
				onBackToMenu={() => {
					resetOrder();
					setCart({});
					setShowCart(false);
				}}
			/>
		);
	}

	if (pendingCheckout) {
		return (
			<PaymentView
				orderTotal={pendingCheckout.orderTotal}
				paymentReference={pendingCheckout.paymentReference}
				qrImage={pendingCheckout.payment?.qrImage}
				confirmingPayment={confirmingPayment}
				onConfirm={confirmPayment}
				onBack={() => {
					clearCheckout();
					setShowCart(true);
				}}
			/>
		);
	}

	return (
		<div className="homepage">
			<StoreHeader
				storeName={storeName}
				storeDesc={storeDesc}
				storeAddress={storeAddress}
				coverImage={coverImage}
				avatarImage={avatarImage}
			/>

			{!loading && categories.length > 0 && (
				<MenuToolbar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					categories={categories}
					activeCategory={activeCategory}
					onSelectCategory={handleCategorySelect}
					categoryCounts={categoryCounts}
					allCount={normalizedQuery ? filteredMenus.length : visibleMenus.length}
				/>
			)}

			{loading ? (
				<div className="loading">Đang tải thực đơn...</div>
			) : displayCategories.length === 0 ? (
				<div className="menuEmpty">
					<Icon code="f002" type="solid" size={32} />
					<p>Không tìm thấy sản phẩm phù hợp</p>
					{(searchQuery || activeCategory) && (
						<Button
							label="Xóa bộ lọc"
							type="secondary"
							size="mini"
							onClick={() => {
								setSearchQuery("");
								setActiveCategory("");
							}}
						/>
					)}
				</div>
			) : (
				<div className="menuGrid">
					{displayCategories.map((cat) => (
						<section id={`category-${cat}`} key={cat} className="categorySection">
							<h2 className="categoryTitle">{cat}</h2>
							<div className="itemsGrid">
								{filteredMenus
									.filter((m) => getMenuCategoryKey(m.category ?? "") === getMenuCategoryKey(cat))
									.map((item) => (
										<ItemCard
											key={item._id}
											item={{ ...item, quantity: cart[item._id] ?? 0 }}
											increaseQuantity={() => updateQuantity(item._id, 1)}
											decreaseQuantity={() => updateQuantity(item._id, -1)}
										/>
									))}
							</div>
						</section>
					))}
				</div>
			)}

			{cartCount > 0 && !showCart && <CartBar count={cartCount} total={cartTotal} onClick={() => setShowCart(true)} />}

			{showCart && (
				<CartSheet
					items={cartItems}
					total={cartTotal}
					customerName={customerName}
					nameError={nameError}
					placingOrder={placingOrder}
					onClose={() => setShowCart(false)}
					onCustomerNameChange={(value) => {
						setCustomerName(value);
						setNameError("");
					}}
					onUpdateQuantity={updateQuantity}
					onCheckout={handleCheckout}
				/>
			)}
		</div>
	);
}
