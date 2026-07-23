import type { ReactNode } from "react";

import SplitHeading from "./SplitHeading";
import "./settingsSectionHeader.scss";

type TSettingsSectionHeaderProps = {
	title: string;
	accent: string;
	actions?: ReactNode;
};

const SettingsSectionHeader = ({ title, accent, actions }: TSettingsSectionHeaderProps) => {
	return (
		<div className="settingsSectionHeader">
			<SplitHeading title={title} accent={accent} className="settingsSectionHeading" />
			{actions && <div className="settingsSectionActions">{actions}</div>}
		</div>
	);
};

export default SettingsSectionHeader;
