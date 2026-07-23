import { useMemo, useState } from "react";

import { toast } from "react-toastify";
import useSWR from "swr";
import { Button } from "xtreme-ui";

import { AdminSearchBar, FormField, LoadingGate } from "#components/base";
import { useAdmin } from "#components/context/useContext";
import Modal from "#components/layout/Modal";
import type { TCategory } from "#utils/database/models/category";
import type { TMenu } from "#utils/database/models/menu";
import { fetcher } from "#utils/helper/common";
import { parseIntegerInput } from "#utils/helper/numericInput";

import MenuEditorItem from "./MenuEditorItem";
import MenuItemForm, { type TMenuFormData } from "./MenuItemForm";
import "./menuEditor.scss";

const getTodayInputDate = () => {
	const today = new Date();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${today.getFullYear()}-${month}-${day}`;
};

const MenuEditor = () => {
	const { menus, profileLoading, profileMutate } = useAdmin();
	const { data: categoryData } = useSWR<{ categories?: TCategory[] }>("/api/admin/categories", fetcher);
	const [modalState, setModalState] = useState("");
	const [editItem, setEditItem] = useState<TMenu>();
	const [saveLoading, setSaveLoading] = useState(false);
	const [restockItem, setRestockItem] = useState<TMenu | null>(null);
	const [importQuantity, setImportQuantity] = useState(0);
	const [importQuantityInput, setImportQuantityInput] = useState("0");
	const [restockDateValue, setRestockDateValue] = useState("");
	const [restockLoading, setRestockLoading] = useState(false);
	const [hideSettingsLoading, setHideSettingsLoading] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const menuCategories = useMemo(() => categoryData?.categories ?? [], [categoryData]);

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

	const onHide = async (itemId: string, hidden: boolean) => {
		setHideSettingsLoading((v) => [...v, itemId]);
		const req = await fetch("/api/admin/menu/hidden", {
			method: "POST",
			body: JSON.stringify({ itemId, hidden }),
		});
		const res = await req.json();

		if (res?.status !== 200) toast.error(res?.message);

		await profileMutate();
		setHideSettingsLoading((v) => v.filter((item) => item !== itemId));
	};
	const onEdit = (item: TMenu) => {
		setEditItem(item);
		setModalState("menuItemEditState");
	};
	const onRestock = (item: TMenu) => {
		setRestockItem(item);
		setImportQuantity(0);
		setImportQuantityInput("0");
		setRestockDateValue(getTodayInputDate());
		setModalState("restock");
	};
	const closeModal = () => {
		setModalState("");
		setEditItem(undefined);
	};

	const onSaveMenuItem = async (data: TMenuFormData) => {
		setSaveLoading(true);
		const isEdit = modalState === "menuItemEditState" && editItem;

		const req = await fetch("/api/admin/menu", {
			method: isEdit ? "PUT" : "POST",
			body: JSON.stringify(isEdit ? { itemId: editItem._id, ...data } : data),
		});
		const res = await req.json();

		if (res?.status !== 200) {
			toast.error(res?.message ?? "Không thể lưu sản phẩm");
		} else {
			toast.success(res?.message ?? "Đã lưu");
			await profileMutate();
			closeModal();
		}
		setSaveLoading(false);
	};

	const onRestockSave = async () => {
		if (!restockItem) return;
		if (importQuantity <= 0) {
			toast.error("Số lượng nhập phải lớn hơn 0");
			return;
		}

		setRestockLoading(true);
		const req = await fetch("/api/admin/menu/restock", {
			method: "POST",
			body: JSON.stringify({
				itemId: restockItem._id,
				quantity: importQuantity,
				restockDate: restockDateValue,
			}),
		});
		const res = await req.json();
		if (res?.status !== 200) toast.error(res?.message ?? "Không thể nhập hàng");
		else {
			const stockAfter = res.stockAfter ?? (restockItem.stock ?? 0) + importQuantity;
			toast.success(`Đã nhập ${importQuantity}, tồn kho mới: ${stockAfter}`);
		}
		await profileMutate();
		setRestockLoading(false);
		setModalState("");
		setRestockItem(null);
	};

	const isFormOpen = modalState === "newState" || modalState === "menuItemEditState";

	return (
		<LoadingGate loading={profileLoading} label="Đang tải thực đơn...">
			<div className="menuEditor">
				<div className="menuItemEditor">
					<div className="menuItemToolbar">
						<AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Tìm sản phẩm theo tên, danh mục, ID..." />
					</div>
					<div className="menuItemContainer">
						{filteredMenus.length === 0 ? (
							<p className="menuItemEmpty">{normalizedQuery ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm"}</p>
						) : (
							filteredMenus.map((item, id) => (
								<MenuEditorItem
									key={id}
									item={item}
									onEdit={onEdit}
									onHide={onHide}
									onRestock={onRestock}
									hideSettingsLoading={hideSettingsLoading.includes(item._id.toString())}
								/>
							))
						)}
					</div>
				</div>
				<Button className={`menuEditorAdd ${modalState ? "active" : ""}`} onClick={() => setModalState("newState")} icon="2b" iconType="solid" />
				<Modal className="modalCompact" open={isFormOpen} setOpen={(v) => !v && closeModal()}>
					<MenuItemForm
						item={modalState === "menuItemEditState" ? editItem : undefined}
						categories={menuCategories}
						loading={saveLoading}
						onSave={onSaveMenuItem}
						onCancel={closeModal}
					/>
				</Modal>
				<Modal
					className="modalCompact"
					open={modalState === "restock"}
					setOpen={(v) => {
						if (!v) {
							setModalState("");
							setRestockItem(null);
						}
					}}>
					<div className="restockModal">
						<h3 className="restockModalTitle">Nhập hàng: {restockItem?.name}</h3>
						<p className="restockModalHint">Tồn kho hiện tại: {restockItem?.stock ?? 0}</p>
						<div className="restockModalBody">
							<FormField label="Số lượng nhập" htmlFor="restockStock">
								<input
									id="restockStock"
									className="restockModalInput"
									type="text"
									inputMode="numeric"
									value={importQuantityInput}
									onChange={(e) => {
										const { display, value } = parseIntegerInput(e.target.value);
										setImportQuantityInput(display);
										setImportQuantity(value);
									}}
									onBlur={() => {
										if (importQuantityInput === "") setImportQuantityInput("0");
									}}
								/>
							</FormField>
							{importQuantity > 0 && (
								<p className="restockModalPreview">
									Tồn kho sau nhập: <strong>{(restockItem?.stock ?? 0) + importQuantity}</strong>
								</p>
							)}
							<FormField label="Ngày nhập" htmlFor="restockDate">
								<input
									id="restockDate"
									className="restockModalInput"
									type="date"
									value={restockDateValue}
									onChange={(e) => setRestockDateValue(e.target.value)}
								/>
							</FormField>
						</div>
						<div className="restockModalActions">
							<Button
								label="Hủy"
								type="secondary"
								onClick={() => {
									setModalState("");
									setRestockItem(null);
								}}
								disabled={restockLoading}
							/>
							<Button label="Lưu" type="primary" onClick={onRestockSave} loading={restockLoading} />
						</div>
					</div>
				</Modal>
			</div>
		</LoadingGate>
	);
};

export default MenuEditor;
