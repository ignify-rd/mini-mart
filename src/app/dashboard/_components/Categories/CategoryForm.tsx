import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "xtreme-ui";

import { FormField } from "#components/base";
import type { TCategory } from "#utils/database/models/category";

import "./categoryForm.scss";

type TCategoryFormProps = {
	category?: TCategory;
	loading?: boolean;
	onSave: (name: string) => void;
	onCancel: () => void;
};

const CategoryForm = ({ category, loading, onSave, onCancel }: TCategoryFormProps) => {
	const [name, setName] = useState("");
	const isEdit = Boolean(category);

	useEffect(() => {
		setName(category?.name ?? "");
	}, [category]);

	const handleSave = () => {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error("Tên danh mục là bắt buộc");
			return;
		}
		onSave(trimmed);
	};

	return (
		<div className="categoryForm">
			<h3 className="categoryFormTitle">{isEdit ? "Sửa danh mục" : "Thêm danh mục"}</h3>

			<div className="categoryFormBody">
				<FormField label="Tên danh mục" htmlFor="categoryName">
					<input
						id="categoryName"
						className="categoryFormInput"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="VD: Nước, Bánh mì..."
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSave();
						}}
					/>
				</FormField>
			</div>

			<div className="categoryFormActions">
				<Button label="Hủy" type="secondary" onClick={onCancel} disabled={loading} />
				<Button label={isEdit ? "Lưu thay đổi" : "Thêm danh mục"} type="primary" onClick={handleSave} loading={loading} />
			</div>
		</div>
	);
};

export default CategoryForm;
