import axios from "axios";
import Tesseract from "tesseract.js";

class CaptchaService {
	constructor(config) {
		this.config = config;
	}
	
	async getCaptcha(uri) {
		try {
			const { data: response } = await axios.get(uri, {
				headers: this.config.headers
			});
				
			if (response.code !== 0) {
				throw new Error("Cannot get captcha");
			}
			
			return {
				success: true,
				message: "Captcha successfully obtained",
				data: response.data
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || "Failed to get captcha",
				data: null
			};
		}
	}
	
	async extractCaptcha(imageContent) {
		if (!imageContent) {
			return {
				success: false,
				message: "Cannot find captcha_image_content",
				captchaCode: null
			};
		}
		
		try {
			const { data: { text } } = await Tesseract.recognize(
				imageContent, "eng", {
					tessedit_pageseg_mode: "8",
					tessedit_char_whitelist: this.strascii,
					tessedit_ocr_engine_mode: "3"
				}
			);
			
			const cleanedText = text.replace(/[\s\n\r]/g, "");
			
			return {
				success: true,
				message: "Captcha extracted",
				captchaCode: cleanedText
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to extract captcha: ${error.message}`,
				captchaCode: null
			};
		}
	}
	
	get strascii() {
		return String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
	}
}

export default CaptchaService;