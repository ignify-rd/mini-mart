import { useInView } from "react-intersection-observer";
import { Button, Icon, useScreenType } from "xtreme-ui";

import { StockBadge } from "#components/base";
import type { TMenu } from "#utils/database/models/menu";

import "./menuEditorItem.scss";

const MenuEditorItem = (props: TMenuEditorItemProps) => {
	const { item, onEdit, onHide, onRestock, hideSettingsLoading = false } = props;
	const { isMobile } = useScreenType();
	const [itemRef, inView] = useInView({ threshold: 0 });

	return (
		<div className="menuEditorItem" ref={itemRef}>
			{inView && (
				<>
					<div className="menuItemPicture">{!item.image ? <Icon code="e43b" /> : <span className="image" style={{ background: `url(${item.image})` }} />}</div>
					<div className="menuItemData">
						<h5 className="menuItemTitle">{item.name}</h5>
						<p className="menuItemPrice rupee">{item.price.toLocaleString("vi-VN")}</p>
					</div>
					<StockBadge stock={item.stock} className="menuItemStock" restockDate={item.restockDate} />
					<div className="menuItemOptions">
						<Button
							icon={item.hidden ? "f070" : "f06e"}
							iconType="solid"
							size="mini"
							type={item.hidden ? "secondary" : "primary"}
							label={isMobile ? undefined : item.hidden ? "Đang ẩn" : "Đang hiện"}
							loading={hideSettingsLoading}
							onClick={() => onHide(item._id.toString(), !item.hidden)}
						/>
						<Button icon="e1bc" iconType="solid" size="mini" type="secondary" label="Nhập hàng" onClick={() => onRestock(item)} />
						<Button icon="f304" iconType="solid" size="mini" type="primary" onClick={() => onEdit(item)} />
					</div>
				</>
			)}
		</div>
	);
};

export default MenuEditorItem;

type TMenuEditorItemProps = {
	item: TMenu;
	onEdit: (item: TMenu) => void;
	onHide: (id: string, hidden: boolean) => void;
	onRestock: (item: TMenu) => void;
	hideSettingsLoading: boolean;
};
