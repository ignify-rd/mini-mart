import clsx from "clsx";
import type { ReactNode } from "react";
import { Icon } from "xtreme-ui";

import "./emptyState.scss";

type TEmptyStateProps = {
	message: string;
	icon?: string;
	className?: string;
	children?: ReactNode;
};

const EmptyState = ({ message, icon = "f07a", className, children }: TEmptyStateProps) => {
	return (
		<div className={clsx("emptyState", className)}>
			<Icon code={icon} type="solid" size={32} />
			<p>{message}</p>
			{children}
		</div>
	);
};

export default EmptyState;
