import type { UIEvent } from "react";

import MenuEditor from "./MenuEditor";

import "./menu.scss";

const Menu = ({ onScroll }: TMenuProps) => {
	return (
		<div className="menuPage" onScroll={onScroll}>
			<MenuEditor />
		</div>
	);
};

export default Menu;

export type TMenuProps = {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
