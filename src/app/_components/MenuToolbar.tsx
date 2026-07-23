"use client";

import clsx from "clsx";
import { Icon } from "xtreme-ui";

type TMenuToolbarProps = {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	categories: string[];
	activeCategory: string;
	onSelectCategory: (category: string) => void;
	categoryCounts: Record<string, number>;
	allCount: number;
};

const MenuToolbar = ({ searchQuery, onSearchChange, categories, activeCategory, onSelectCategory, categoryCounts, allCount }: TMenuToolbarProps) => (
	<div className="menuToolbar">
		<div className="menuSearch">
			<Icon className="menuSearchIcon" code="f002" type="solid" size={14} />
			<input type="search" placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} aria-label="Tìm sản phẩm" />
			{searchQuery && (
				<button type="button" className="menuSearchClear" onClick={() => onSearchChange("")} aria-label="Xóa tìm kiếm">
					<Icon code="f00d" type="solid" size={12} />
				</button>
			)}
		</div>
		<div className="categoryChips">
			<button type="button" className={clsx("categoryChip", !activeCategory && "active")} onClick={() => onSelectCategory("")}>
				Tất cả
				<span className="chipCount">{allCount}</span>
			</button>
			{categories.map((cat) => (
				<button key={cat} type="button" className={clsx("categoryChip", activeCategory === cat && "active")} onClick={() => onSelectCategory(cat)}>
					{cat}
					<span className="chipCount">{categoryCounts[cat] ?? 0}</span>
				</button>
			))}
		</div>
	</div>
);

export default MenuToolbar;
