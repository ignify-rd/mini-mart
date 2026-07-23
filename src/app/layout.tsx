import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Gliff, themeController } from "xtreme-ui";
import { GlobalProvider } from "#components/context";
import { montserrat } from "#utils/helper/fontHelper";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "#utils/seo/constants";
import { DEFAULT_THEME_COLOR } from "#utils/styles/theme";
import "./globals.scss";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		template: `%s | ${SITE_NAME}`,
		default: `${SITE_NAME} — Đặt hàng không tiếp xúc & trải nghiệm nhà hàng thông minh`,
	},
	description: SITE_DESCRIPTION,
	keywords: [...SITE_KEYWORDS],
	openGraph: {
		type: "website",
		locale: "vi_VN",
		siteName: SITE_NAME,
	},
	twitter: { card: "summary_large_image" },
	robots: {
		index: true,
		follow: true,
		"max-image-preview": "large",
		"max-snippet": -1,
		"max-video-preview": -1,
	},
};

const themeBootScript = themeController({
	scheme: "light",
	color: DEFAULT_THEME_COLOR,
	defScheme: "light",
	defColor: DEFAULT_THEME_COLOR,
});

export default function RootLayout({ children }: IRootProps) {
	return (
		<html lang="vi" className={montserrat.variable} data-theme-scheme="light" suppressHydrationWarning>
			<head>
				{/* Force calm brand color before paint (overrides old localStorage red/saffron) */}
				<script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
				<Gliff next />
			</head>
			<body>
				<GlobalProvider>{children}</GlobalProvider>
			</body>
		</html>
	);
}

interface IRootProps {
	children?: ReactNode;
}
