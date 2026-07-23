import { Button } from "xtreme-ui";

type TSettingsActionsProps = {
	onClear: () => void;
	onSave: () => void;
	loading?: boolean;
	saveLabel?: string;
};

const SettingsActions = ({ onClear, onSave, loading, saveLabel = "Áp dụng" }: TSettingsActionsProps) => {
	return (
		<>
			<Button className="clear" type="secondaryDanger" icon="f00d" iconType="solid" disabled={loading} onClick={onClear} />
			<Button className="save" icon="f00c" iconType="solid" label={saveLabel} loading={loading} onClick={onSave} />
		</>
	);
};

export default SettingsActions;
