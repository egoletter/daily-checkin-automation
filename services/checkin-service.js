import axios from "axios";
import { info } from "./helpers.js";

class CheckInService {
	constructor(config) {
		this.config = config;
	}
	
	async performCheckIn(checkinUri, accessToken) {
		try {
			info("[~] Trying to check in...");
			
			const payload = { id: 22 };
			const { data: response } = await axios.post(checkinUri, payload, {
					headers: {
						...this.config.headers,
						"Authorization": `Bearer ${accessToken}`,
						"Content-Type": "application/json"
					}
				});
				
			if (response.code !== 0) {
				return {
					success: false,
					message: `Check-in failed: ${response.msg || "Unknown error"}`
				};
			}
			
			return {
				success: true,
				message: "[✓] Daily check in successful"
			};
		} catch (error) {
			return {
				success: false,
				message: `Check-in error: ${error.message}`
			};
		}
	}
}

export default CheckInService;
