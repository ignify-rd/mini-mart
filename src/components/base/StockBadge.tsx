import clsx from "clsx";

import { getStockLevel } from "#utils/helper/stockHelper";

import "./stockBadge.scss";

type TStockBadgeProps = {
	stock: number;
	className?: string;
	label?: string;
	restockDate?: string;
};

const StockBadge = ({ stock, className, label = "tồn kho", restockDate }: TStockBadgeProps) => {
	return (
		<div className={clsx("stockBadge", getStockLevel(stock), className)}>
			<span className="stockCount">{stock}</span>
			<span className="stockLabel">{label}</span>
			{restockDate && <span className="restockDate">Kế tiếp: {restockDate}</span>}
		</div>
	);
};

export default StockBadge;
