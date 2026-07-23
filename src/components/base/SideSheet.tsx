import clsx from "clsx";
import type { ReactNode } from "react";
import { Button, Icon } from "xtreme-ui";

import { SplitHeading } from "#components/base";

import "./sideSheet.scss";

const SideSheet = (props: SideSheetProps) => {
	const { children, className, title, open, setOpen } = props;
	const classList = clsx("sideSheet", open && "sideSheetOpen", className);

	return (
		<div className={classList}>
			<div className="backdrop" onClick={() => setOpen(false)} />
			<div className="sideContainer">
				<div className="sheetHeader">
					<SplitHeading title={title[0]} accent={title[1]} className="sheetTitle" />
					<Button icon="f00d" iconType="solid" size="mini" onClick={() => setOpen(false)} />
				</div>
				<div className="sheetContent">{children}</div>
			</div>
		</div>
	);
};

export default SideSheet;

type SideSheetProps = {
	children: ReactNode;
	className?: string;
	title: string[];
	open: boolean;
	setOpen: (open: boolean) => void;
};
