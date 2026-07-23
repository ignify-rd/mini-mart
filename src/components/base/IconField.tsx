import clsx from "clsx";
import type { ReactNode } from "react";
import { Icon } from "xtreme-ui";

import "./iconField.scss";

type TIconFieldProps = {
	icon: string;
	children: ReactNode;
	className?: string;
};

const IconField = ({ icon, children, className }: TIconFieldProps) => {
	return (
		<div className={clsx("iconField", className)}>
			<Icon code={icon} type="solid" size={14} className="iconFieldGlyph" />
			{children}
		</div>
	);
};

export default IconField;
