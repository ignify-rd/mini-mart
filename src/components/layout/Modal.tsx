"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "xtreme-ui";

import "./modal.scss";

const Modal = (props: TModal) => {
	const { children, open, setOpen, closeIcon = "e59b", className } = props;
	const [mounted, setMounted] = useState(false);
	const classList = clsx("modal", open && "open", className);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	if (!mounted) return null;

	return createPortal(
		<div className={classList} aria-hidden={!open}>
			<div className="backdrop" onClick={() => setOpen(false)} />
			<div className="modalPane" role="dialog" aria-modal="true">
				{children}
				{closeIcon && <Button className="closeModal" size="mini" icon={closeIcon} onClick={() => setOpen(false)} />}
			</div>
		</div>,
		document.body,
	);
};

export default Modal;

type TModal = {
	open: boolean;
	closeIcon?: string;
	className?: string;
	setOpen: (open: boolean) => void;
	children: ReactNode;
};
