import type { ReactNode } from "react";

import "./formField.scss";

type TFormFieldProps = {
	label: string;
	htmlFor?: string;
	hint?: string;
	children: ReactNode;
};

const FormField = ({ label, htmlFor, hint, children }: TFormFieldProps) => {
	return (
		<div className="formField">
			<label htmlFor={htmlFor}>{label}</label>
			{children}
			{hint && <span className="formFieldHint">{hint}</span>}
		</div>
	);
};

export default FormField;
