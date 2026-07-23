import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const bcryptPrefixRegex = /^\$2[aby]\$[0-9]{2}\$/;

export const hashPassword = async (password: string) => {
	if (bcryptPrefixRegex.test(password)) throw "Không thể mã hóa lại mật khẩu đã được mã hóa";
	if (password.length < 6) throw "Mật khẩu phải có ít nhất 6 ký tự";

	return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password?: string, hash?: string) => {
	if (!password || !hash) return false;
	return await bcrypt.compare(password, hash);
};
