"use client";

import { useEffect } from "react";
import { useXTheme } from "xtreme-ui";

import { DEFAULT_THEME_COLOR } from "#utils/styles/theme";

/** Keep xtreme-ui theme locked to app default (theme picker removed). */
const ThemeLock = () => {
	const { themeColor, setThemeColor, themeScheme, setThemeScheme } = useXTheme();

	useEffect(() => {
		if (themeScheme !== "light") setThemeScheme("light");
		const same =
			themeColor?.h === DEFAULT_THEME_COLOR.h &&
			themeColor?.s === DEFAULT_THEME_COLOR.s &&
			themeColor?.l === DEFAULT_THEME_COLOR.l;
		if (!same) setThemeColor({ ...DEFAULT_THEME_COLOR });
	}, [themeColor, themeScheme, setThemeColor, setThemeScheme]);

	return null;
};

export default ThemeLock;
