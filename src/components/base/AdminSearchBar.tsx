"use client";

import { Icon } from "xtreme-ui";

import "./adminSearchBar.scss";

type TAdminSearchBarProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

const AdminSearchBar = ({ value, onChange, placeholder = "Tìm kiếm...", className }: TAdminSearchBarProps) => {
	return (
		<div className={`adminSearchBar ${className ?? ""}`.trim()}>
			<Icon className="adminSearchIcon" code="f002" type="solid" size={14} />
			<input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
			{value && (
				<button type="button" className="adminSearchClear" onClick={() => onChange("")} aria-label="Xóa tìm kiếm">
					<Icon code="f00d" type="solid" size={12} />
				</button>
			)}
		</div>
	);
};

export default AdminSearchBar;
