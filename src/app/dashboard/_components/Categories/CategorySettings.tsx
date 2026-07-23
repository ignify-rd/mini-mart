"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { Button } from "xtreme-ui";

import { AdminSearchBar, LoadingGate } from "#components/base";
import Modal from "#components/layout/Modal";
import type { TCategory } from "#utils/database/models/category";
import { fetcher } from "#utils/helper/common";

import CategoryForm from "./CategoryForm";
import "./categorySettings.scss";

const CategorySettings = () => {
	const { data, isLoading, mutate } = useSWR<{ categories?: TCategory[] }>("/api/admin/categories", fetcher);
	const categories = data?.categories ?? [];

	const [modalState, setModalState] = useState("");
	const [editCategory, setEditCategory] = useState<TCategory>();
	const [saveLoading, setSaveLoading] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredCategories = useMemo(() => {
		if (!normalizedQuery) return categories;
		return categories.filter((category) => category.name.toLowerCase().includes(normalizedQuery) || String(category._id).includes(normalizedQuery));
	}, [categories, normalizedQuery]);

	const closeModal = () => {
		setModalState("");
		setEditCategory(undefined);
	};

	const onEdit = (category: TCategory) => {
		setEditCategory(category);
		setModalState("categoryEditState");
	};

	const onSave = async (name: string) => {
		const isEdit = modalState === "categoryEditState" && editCategory;

		setSaveLoading(true);
		const req = await fetch("/api/admin/categories", {
			method: isEdit ? "PUT" : "POST",
			body: JSON.stringify(isEdit ? { categoryId: editCategory._id, name } : { name }),
		});
		const res = await req.json();

		if (res?.status !== 200) {
			toast.error(res?.message ?? "Không thể lưu danh mục");
		} else {
			toast.success(res?.message ?? "Đã lưu");
			await mutate();
			closeModal();
		}
		setSaveLoading(false);
	};

	const onDelete = async (category: TCategory) => {
		if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;

		setDeletingId(String(category._id));
		const req = await fetch("/api/admin/categories", {
			method: "DELETE",
			body: JSON.stringify({ categoryId: category._id }),
		});
		const res = await req.json();

		if (res?.status !== 200) {
			toast.error(res?.message ?? "Không thể xóa danh mục");
		} else {
			toast.success(res?.message ?? "Đã xóa");
			if (editCategory && String(editCategory._id) === String(category._id)) closeModal();
			await mutate();
		}
		setDeletingId(null);
	};

	const isFormOpen = modalState === "newState" || modalState === "categoryEditState";

	return (
		<LoadingGate loading={isLoading} label="Đang tải danh mục...">
			<div className="categorySettings">
				<div className="categorySettingsList">
					<div className="categorySettingsListHeader">
						<h3 className="categorySettingsTitle">
							Danh sách ({filteredCategories.length}
							{normalizedQuery ? `/${categories.length}` : ""})
						</h3>
						<AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Tìm danh mục..." />
					</div>
					{categories.length === 0 ? (
						<p className="categorySettingsEmpty">Chưa có danh mục nào. Thêm danh mục để gắn vào sản phẩm.</p>
					) : filteredCategories.length === 0 ? (
						<p className="categorySettingsEmpty">Không tìm thấy danh mục phù hợp</p>
					) : (
						<ul className="categorySettingsItems">
							{filteredCategories.map((category) => (
								<li key={category._id} className="categorySettingsItem">
									<div className="categorySettingsItemInfo">
										<span className="categorySettingsItemId">#{category._id}</span>
										<span className="categorySettingsItemName">{category.name}</span>
									</div>
									<div className="categorySettingsItemActions">
										<Button label="Sửa" type="secondary" size="mini" onClick={() => onEdit(category)} disabled={saveLoading || Boolean(deletingId)} />
										<Button
											label="Xóa"
											type="secondary"
											size="mini"
											onClick={() => onDelete(category)}
											loading={deletingId === String(category._id)}
											disabled={saveLoading || (deletingId !== null && deletingId !== String(category._id))}
										/>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<Button className={`categorySettingsAdd ${modalState ? "active" : ""}`} onClick={() => setModalState("newState")} icon="2b" iconType="solid" />

				<Modal className="modalCompact" open={isFormOpen} setOpen={(v) => !v && closeModal()}>
					<CategoryForm category={modalState === "categoryEditState" ? editCategory : undefined} loading={saveLoading} onSave={onSave} onCancel={closeModal} />
				</Modal>
			</div>
		</LoadingGate>
	);
};

export default CategorySettings;
