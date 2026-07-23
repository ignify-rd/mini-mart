"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Icon, Spinner } from "xtreme-ui";

import { AdminSearchBar, LoadingGate, StockBadge } from "#components/base";
import { useAdmin } from "#components/context/useContext";
import type { TRestockLog } from "#utils/database/models/restockLog";
import { fetcher } from "#utils/helper/common";
import { getStockLevel } from "#utils/helper/stockHelper";

import "./inventory.scss";

const Inventory = () => {
	const { menus, profileLoading } = useAdmin();
	const { data: restockLogs, isLoading: logsLoading } = useSWR<TRestockLog[]>("/api/admin/restock-logs", fetcher, { refreshInterval: 10000 });

	const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredMenus = useMemo(() => {
		if (!normalizedQuery) return menus;
		return menus.filter(
			(item) =>
				item.name.toLowerCase().includes(normalizedQuery) ||
				(item.category ?? "").toLowerCase().includes(normalizedQuery) ||
				String(item._id).includes(normalizedQuery),
		);
	}, [menus, normalizedQuery]);

	const menuLogs = expandedMenu ? (restockLogs || []).filter((log) => String(log.menuId) === String(expandedMenu)) : [];

	return (
		<LoadingGate loading={profileLoading} label="Đang tải tồn kho...">
			<div className="inventory">
				<AdminSearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Tìm theo tên, danh mục, ID..."
					className="inventorySearch"
				/>
				<div className="menuStockList">
					{filteredMenus.length === 0 ? (
						<p className="inventoryEmpty">{normalizedQuery ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm"}</p>
					) : (
						filteredMenus.map((item) => (
							<div
								key={item._id}
								className={`stockCard ${getStockLevel(item.stock)} ${expandedMenu === item._id ? "expanded" : ""}`}
								onClick={() => setExpandedMenu(expandedMenu === item._id ? null : item._id)}>
								<div className="stockCardMain">
									{item.image && <div className="itemImage" style={{ backgroundImage: `url(${item.image})` }} />}
									<div className="itemInfo">
										<p className="itemName">{item.name}</p>
										<p className="itemCategory">{item.category}</p>
									</div>
									<StockBadge stock={item.stock} />
									<Icon code={expandedMenu === item._id ? "f068" : "f067"} type="solid" size={16} />
								</div>

								{expandedMenu === item._id && (
									<div className="restockHistory">
										<h4>Lịch sử nhập hàng</h4>
										{logsLoading ? (
											<Spinner label="Đang tải..." />
										) : menuLogs.length === 0 ? (
											<p className="noLogs">Chưa có lịch nhập hàng</p>
										) : (
											<div className="logsTable">
												<div className="logRow header">
													<span className="date">Ngày</span>
													<span className="qty">SL nhập</span>
													<span className="before">Trước</span>
													<span className="after">Sau</span>
													<span className="by">Người nhập</span>
												</div>
												{menuLogs.map((log) => (
													<div key={log._id} className="logRow">
														<span className="date">{new Date(log.createdAt).toLocaleDateString("vi-VN")}</span>
														<span className="qty">+{log.quantity}</span>
														<span className="before">{log.stockBefore}</span>
														<span className="after">{log.stockAfter}</span>
														<span className="by">{log.createdBy}</span>
													</div>
												))}
											</div>
										)}
									</div>
								)}
							</div>
						))
					)}
				</div>
			</div>
		</LoadingGate>
	);
};

export default Inventory;
