import clsx from "clsx";
import type { ReactNode } from "react";

import "./settingsCard.scss";

type TSettingsCardProps = {
	children: ReactNode;
	className?: string;
	variant?: "default" | "featured";
	header?: ReactNode;
};

const SettingsCard = ({ children, className, variant = "default", header }: TSettingsCardProps) => {
	return (
		<div className={clsx("settingsCard", variant, className)}>
			{header}
			<div className="settingsCardBody">{children}</div>
		</div>
	);
};

export default SettingsCard;
