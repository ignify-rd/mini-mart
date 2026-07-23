"use client";

import { Icon } from "xtreme-ui";

type TStoreHeaderProps = {
	storeName: string;
	storeDesc?: string;
	storeAddress?: string;
	coverImage?: string;
	avatarImage?: string;
};

const StoreHeader = ({ storeName, storeDesc, storeAddress, coverImage, avatarImage }: TStoreHeaderProps) => (
	<header className="storeHeader">
		{coverImage && <div className="storeCover" style={{ backgroundImage: `url(${coverImage})` }} />}
		{avatarImage && <div className="storeAvatar" style={{ backgroundImage: `url(${avatarImage})` }} />}
		<div className="storeInfo">
			<h1>{storeName}</h1>
			{storeDesc && <p className="storeDesc">{storeDesc}</p>}
			{storeAddress && (
				<p className="storeAddress">
					<Icon code="f3c5" type="solid" size={12} /> {storeAddress}
				</p>
			)}
		</div>
	</header>
);

export default StoreHeader;
