import { useSearchParams } from "next/navigation.js";
import type { UIEvent } from "react";
import PaymentSettings from "./PaymentSettings";
import SettingsAccount from "./SettingsAccount";
import "./settings.scss";

const Settings = (props: TSettingsProps) => {
	const { onScroll } = props;
	const queryParams = useSearchParams();
	const subTab = queryParams.get("subTab") ?? "";

	return (
		<div className="settings" onScroll={onScroll}>
			{
				{
					account: <SettingsAccount />,
					payment: <PaymentSettings />,
				}[subTab]
			}
		</div>
	);
};

export default Settings;

export type TSettingsProps = {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
