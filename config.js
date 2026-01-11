import dotenv from "dotenv";

dotenv.config();

export const config = {
	target: {
		base_url: process.env.BASE_URL,
		captcha_uri: process.env.CAPTCHA_URI,
		auth_uri: process.env.AUTH_URI,
		checkin_uri: process.env.CHECKIN_URI,
		account_area: process.env.AREA
	},
	headers: {
		"Accept": "application/json, text/plain, */*",
		"accept-language": "id"
	},
	maxRetries: 5
};