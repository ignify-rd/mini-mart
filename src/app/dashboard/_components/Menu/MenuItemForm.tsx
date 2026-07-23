import { useEffect, useState } from "react";
import { Button } from "xtreme-ui";

import { FormField } from "#components/base";
import type { TCategory } from "#utils/database/models/category";
import type { TMenu } from "#utils/database/models/menu";
import { parseDecimalInput, parseIntegerInput } from "#utils/helper/numericInput";

import "./menuItemForm.scss";

type TMenuItemFormProps = {
	item?: TMenu;
	categories: TCategory[];
	loading?: boolean;
	onSave: (data: TMenuFormData) => void;
	onCancel: () => void;
};

export type TMenuFormData = {
	name: string;
	categoryId: string;
	price: number;
	image: string;
	hidden: boolean;
	stock: number;
};

const emptyForm: TMenuFormData = {
	name: "",
	categoryId: "",
	price: 0,
	image: "",
	hidden: false,
	stock: 0,
};

const MenuItemForm = ({ item, categories, loading, onSave, onCancel }: TMenuItemFormProps) => {
	const [form, setForm] = useState<TMenuFormData>(emptyForm);
	const [priceInput, setPriceInput] = useState("0");
	const [stockInput, setStockInput] = useState("0");
	const isEdit = Boolean(item);

	const categoryOptions = (() => {
		const list = [...categories];
		if (item?.categoryId && !list.some((cat) => String(cat._id) === String(item.categoryId))) {
			list.unshift({
				_id: String(item.categoryId),
				name: item.category || `Danh mục #${item.categoryId}`,
				restaurantID: item.restaurantID,
				createdAt: "",
				updatedAt: "",
			});
		}
		return list;
	})();

	useEffect(() => {
		if (item) {
			const matched =
				categories.find((cat) => String(cat._id) === String(item.categoryId)) ??
				categories.find((cat) => cat.name.toLowerCase() === (item.category ?? "").toLowerCase());
			setForm({
				name: item.name,
				categoryId: matched ? String(matched._id) : String(item.categoryId ?? ""),
				price: item.price,
				image: item.image ?? "",
				hidden: item.hidden,
				stock: item.stock ?? 0,
			});
			setPriceInput(String(item.price));
			setStockInput(String(item.stock ?? 0));
		} else {
			setForm({ ...emptyForm, categoryId: categories[0] ? String(categories[0]._id) : "" });
			setPriceInput("0");
			setStockInput("0");
		}
	}, [item, categories]);

	const setField = <K extends keyof TMenuFormData>(key: K, value: TMenuFormData[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="menuItemForm">
			<h3 className="menuItemFormTitle">{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>

			<div className="menuItemFormBody">
				<FormField label="Tên sản phẩm" htmlFor="menuName">
					<input id="menuName" className="menuItemInput" type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} />
				</FormField>

				<FormField label="Danh mục" htmlFor="menuCategory">
					<select
						id="menuCategory"
						className="menuItemSelect"
						value={form.categoryId}
						onChange={(e) => setField("categoryId", e.target.value)}
						disabled={categoryOptions.length === 0}>
						{categoryOptions.length === 0 ? (
							<option value="">Chưa có danh mục</option>
						) : (
							categoryOptions.map((cat) => (
								<option key={cat._id} value={String(cat._id)}>
									{cat.name}
								</option>
							))
						)}
					</select>
				</FormField>

				<div className="menuItemFormRow">
					<FormField label="Giá" htmlFor="menuPrice">
						<input
							id="menuPrice"
							className="menuItemInput"
							type="text"
							inputMode="decimal"
							value={priceInput}
							onChange={(e) => {
								const { display, value } = parseDecimalInput(e.target.value);
								setPriceInput(display);
								setField("price", value);
							}}
							onBlur={() => {
								if (priceInput === "" || priceInput === ".") setPriceInput("0");
							}}
						/>
					</FormField>
					<FormField label="Tồn kho" htmlFor="menuStock">
						<input
							id="menuStock"
							className="menuItemInput"
							type="text"
							inputMode="numeric"
							value={stockInput}
							onChange={(e) => {
								const { display, value } = parseIntegerInput(e.target.value);
								setStockInput(display);
								setField("stock", value);
							}}
							onBlur={() => {
								if (stockInput === "") setStockInput("0");
							}}
						/>
					</FormField>
				</div>

				<FormField label="Hiển thị" htmlFor="menuHidden">
					<select
						id="menuHidden"
						className="menuItemSelect"
						value={form.hidden ? "hidden" : "visible"}
						onChange={(e) => setField("hidden", e.target.value === "hidden")}>
						<option value="visible">Hiện trên menu</option>
						<option value="hidden">Ẩn khỏi menu</option>
					</select>
				</FormField>

				<FormField label="Ảnh (URL)" htmlFor="menuImage">
					<input
						id="menuImage"
						className="menuItemInput"
						type="url"
						value={form.image}
						onChange={(e) => setField("image", e.target.value)}
						placeholder="https://..."
					/>
				</FormField>
			</div>

			<div className="menuItemFormActions">
				<Button label="Hủy" type="secondary" onClick={onCancel} disabled={loading} />
				<Button
					label={isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
					type="primary"
					onClick={() => onSave(form)}
					loading={loading}
					disabled={!form.categoryId || categoryOptions.length === 0}
				/>
			</div>
		</div>
	);
};

export default MenuItemForm;
