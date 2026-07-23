import type { UIEvent } from "react";

import CategorySettings from "./CategorySettings";

import "./categories.scss";

const Categories = ({ onScroll }: TCategoriesProps) => {
	return (
		<div className="categoriesPage" onScroll={onScroll}>
			<CategorySettings />
		</div>
	);
};

export default Categories;

export type TCategoriesProps = {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
