export type TVietQRBank = {
	id: string;
	name: string;
	shortName: string;
};

export const VIETQR_BANKS: TVietQRBank[] = [
	{ id: "970416", name: "Ngân hàng TMCP Á Châu", shortName: "ACB" },
	{ id: "970405", name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn", shortName: "Agribank" },
	{ id: "970418", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", shortName: "BIDV" },
	{ id: "970438", name: "Ngân hàng TMCP Bảo Việt", shortName: "BaoViet Bank" },
	{ id: "970444", name: "Ngân hàng Thương mại TNHH MTV Xây dựng", shortName: "CBBank" },
	{ id: "970446", name: "Ngân hàng Hợp tác xã Việt Nam", shortName: "COOPBANK" },
	{ id: "970406", name: "Ngân hàng TMCP Đông Á", shortName: "DongA Bank" },
	{ id: "970431", name: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam", shortName: "Eximbank" },
	{ id: "970408", name: "Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu", shortName: "GPBank" },
	{ id: "970437", name: "Ngân hàng TMCP Phát triển TP.HCM", shortName: "HDBank" },
	{ id: "970452", name: "Ngân hàng TMCP Kiên Long", shortName: "KienLongBank" },
	{ id: "970449", name: "Ngân hàng TMCP Bưu Điện Liên Việt", shortName: "LienVietPostBank" },
	{ id: "970422", name: "Ngân hàng TMCP Quân đội", shortName: "MB Bank" },
	{ id: "970426", name: "Ngân hàng TMCP Hàng Hải", shortName: "MSB" },
	{ id: "970419", name: "Ngân hàng TMCP Quốc Dân", shortName: "NCB" },
	{ id: "970414", name: "Ngân hàng Thương mại TNHH MTV Đại Dương", shortName: "OceanBank" },
	{ id: "970448", name: "Ngân hàng TMCP Phương Đông", shortName: "OCB" },
	{ id: "970403", name: "Ngân hàng TMCP Sài Gòn Thương Tín", shortName: "Sacombank" },
	{ id: "970429", name: "Ngân hàng TMCP Sài Gòn", shortName: "SCB" },
	{ id: "970440", name: "Ngân hàng TMCP Đông Nam Á", shortName: "SeABank" },
	{ id: "970443", name: "Ngân hàng TMCP Sài Gòn - Hà Nội", shortName: "SHB" },
	{ id: "970407", name: "Ngân hàng TMCP Kỹ thương Việt Nam", shortName: "Techcombank" },
	{ id: "970423", name: "Ngân hàng TMCP Tiên Phong", shortName: "TPBank" },
	{ id: "970432", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", shortName: "VPBank" },
	{ id: "970427", name: "Ngân hàng TMCP Việt Á", shortName: "VietABank" },
	{ id: "970433", name: "Ngân hàng TMCP Việt Nam Thương Tín", shortName: "VietBank" },
	{ id: "970436", name: "Ngân hàng TMCP Ngoại thương Việt Nam", shortName: "Vietcombank" },
	{ id: "970454", name: "Ngân hàng TMCP Bản Việt", shortName: "VietCapitalBank" },
	{ id: "970415", name: "Ngân hàng TMCP Công thương Việt Nam", shortName: "VietinBank" },
	{ id: "970441", name: "Ngân hàng TMCP Quốc tế Việt Nam", shortName: "VIB" },
].sort((a, b) => a.shortName.localeCompare(b.shortName, "vi"));

export const getVietQRBankById = (bankId: string) => VIETQR_BANKS.find((bank) => bank.id === bankId);
