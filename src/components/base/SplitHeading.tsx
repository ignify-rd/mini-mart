import clsx from "clsx";
import type { ReactNode } from "react";

import "./splitHeading.scss";

type TSplitHeadingProps = {
	title: string;
	accent: string;
	as?: "h1" | "h2" | "h3";
	className?: string;
	description?: ReactNode;
	accentTone?: "default" | "brand";
};

const SplitHeading = ({ title, accent, as: Tag = "h1", className, description, accentTone = "default" }: TSplitHeadingProps) => {
	return (
		<div className={clsx("splitHeading", className)}>
			<Tag className={clsx("splitHeadingTitle", accentTone === "brand" && "brandAccent")}>
				{title} <span>{accent}</span>
			</Tag>
			{description && <p className="splitHeadingDescription">{description}</p>}
		</div>
	);
};

export default SplitHeading;
