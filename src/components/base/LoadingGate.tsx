import type { ReactNode } from "react";
import { Spinner } from "xtreme-ui";

type TLoadingGateProps = {
	loading: boolean;
	label?: string;
	children: ReactNode;
};

const LoadingGate = ({ loading, label = "Đang tải...", children }: TLoadingGateProps) => {
	if (loading) return <Spinner fullpage label={label} />;
	return children;
};

export default LoadingGate;
