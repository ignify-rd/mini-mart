import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE, SITE_NAME, SITE_TAGLINE } from "#utils/seo/constants";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OgImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #fff5ee 0%, #fce4d6 100%)",
				padding: "60px 80px",
			}}>
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px" }}>
				<div
					style={{
						padding: "10px 24px",
						background: "linear-gradient(135deg, #e46b36 0%, #f09819 100%)",
						borderRadius: "99px",
						display: "flex",
						alignItems: "center",
						marginTop: "-75px",
						boxShadow: "0 8px 16px -4px rgba(228, 107, 54, 0.3)",
					}}>
					<span style={{ fontSize: "16px", fontWeight: 700, color: "white", letterSpacing: "1.5px", textTransform: "uppercase" }}>Quick & Easy Ordering</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
					<h1 style={{ fontSize: "96px", fontWeight: 900, color: "#1a1a1a", margin: 0, lineHeight: 1, letterSpacing: "-4px", display: "flex" }}>
						Order<span style={{ color: "#e46b36" }}>Worder</span>
					</h1>
				</div>
				<p
					style={{
						fontSize: "28px",
						color: "#525252",
						margin: "-16px 0",
						maxWidth: "700px",
						textAlign: "center",
						fontWeight: 500,
						lineHeight: 1.4,
						letterSpacing: "-0.5px",
					}}>
					{SITE_TAGLINE}
				</p>
			</div>
		</div>,
		{ ...size },
	);
}
