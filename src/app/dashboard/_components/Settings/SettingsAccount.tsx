import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Avatar, Button } from "xtreme-ui";

import { LoadingGate, SplitHeading } from "#components/base";
import { useAdmin } from "#components/context/useContext";
import { splitStringByFirstWord } from "#utils/helper/common";

import PasswordSettings from "./PasswordSettings";
import "./settingsAccount.scss";

const SettingsAccount = () => {
	const router = useRouter();
	const { profile } = useAdmin();
	const session = useSession();
	const [restaurantName, setRestaurantName] = useState<string[]>([]);

	useEffect(() => {
		if (profile?.name) setRestaurantName(splitStringByFirstWord(profile?.name) ?? []);
	}, [profile?.name]);

	return (
		<LoadingGate loading={session.status === "loading" || !profile} label="Đang tải tài khoản...">
			<div className="settingsAccount">
				<div className="profileSettingsCard">
					{profile?.avatar && <Avatar className="avatar" src={profile?.avatar} />}
					<div className="restaurantDetails">
						<SplitHeading title={restaurantName[0] ?? ""} accent={restaurantName[1] ?? ""} className="restaurantName" />
						<h6 className="address">{profile?.address}</h6>
					</div>
					<Button className="logout" icon="f011" onClick={() => router.push("/logout")} />
				</div>
				<PasswordSettings />
			</div>
		</LoadingGate>
	);
};

export default SettingsAccount;
