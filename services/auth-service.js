import axios from "axios";
import chalk from "chalk";
import { error, info, warn } from "./helpers.js";

class AuthService {
	constructor(config, captchaService) {
		this.config = config;
		this.captchaService = captchaService;
	}
	
	async login(credentials, uris, maxRetries = 5) {
		const { area, password, name } = credentials;
		
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				info("\n[~] Getting captcha...");
				
				const captchaResult = await this.captchaService.getCaptcha(uris.captcha);
				if (!captchaResult.success) {
					warn(chalk.yellow(`[×] ${captchaResult.message}`));
					continue;
				}
				
				info(`[✓] ${captchaResult.message}`);
				
				const {
					data: {
						captcha_key: captchaKey,
						captcha_image_content: imageContent
					}
				} = captchaResult;
				
				info("[~] Extracting captcha...");
				const extractionResult = await this.captchaService.extractCaptcha(imageContent);
				
				if (!extractionResult.success) {
					warn(`${chalk.blue("[×]")} ${chalk.yellow(extractionResult.message)}`);
					continue;
				}
				
				info(`[✓] ${extractionResult.message}`);
				
				const payload = this.buildLoginPayload({
					area,
					name,
					password,
					captchaCode: extractionResult.captchaCode,
					captchaKey
				});
				
				info("[~] Trying to login...");
				
				const loginResult = await this.attemptLogin(payload, uris.auth);
				
				if (loginResult.success) {
					info(chalk.green("[✓] Login successful"));
					return loginResult;
				}
				
				if (this.shouldRetryLogin(loginResult.code) && attempt < maxRetries) {
					warn(`\n${chalk.blue("[!]")} Captcha verification failed => ${chalk.yellow(loginResult.message)}.\n${chalk.blue("[!]")} Retrying... (Attempt ${chalk.cyan(attempt)}/${chalk.cyan(maxRetries)})\n`);
					await this.delay(1000 * attempt);
					continue;
				}
				
				return loginResult;
				
			} catch (err) {
				if (attempt === maxRetries) {
					return {
						success: false,
						message: err.message || "Login failed after all retries",
						access_token: null,
						code: err.code
					};
				}
			}
		}
		
		return {
			success: false,
			message: "Login failed after all retries",
			access_token: null,
			code: null
		};
	}
	
	buildLoginPayload({ area, name, password, captchaCode, captchaKey }) {
		return {
			area,
			password,
			name,
			captcha_code: captchaCode,
			captcha_key: captchaKey
		};
	}
	
	async attemptLogin(payload, authUri) {
		try {
			const { data: response } = await axios.post(authUri, payload, {
				headers: {
					...this.config.headers,
					"Authorization": null,
					"Content-Type": "application/json"
				}
			});
				
			if (response.code !== 0) {
				throw {
					code: response.code,
					success: false,
					message: `Login failed: ${response.msg || "Unknown error"}`,
					access_token: null
				};
			}
			
			return {
				code: response.code,
				success: true,
				message: "Login successful",
				access_token: response.data.access_token
			};
		} catch (err) {
			return {
				code: err.code,
				success: false,
				message: err.message || "Login request failed",
				access_token: null
			};
		}
	}
	
	shouldRetryLogin(code) {
		return code >= 30002 && code <= 30003;
	}
	
	async delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

export default AuthService;