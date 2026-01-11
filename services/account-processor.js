import chalk from "chalk";
import { error, info, warn } from "./helpers.js";

class AccountProcessor {
	constructor(authService, checkInService) {
		this.authService = authService;
		this.checkInService = checkInService;
		this.stats = {
			success: {
				login: 0,
				checkin: 0
			},
			failed: {
				login: 0,
				checkin: 0
			}
		};
	}
	
	async processAccount(credentials, uris) {
		try {
			const loginResult = await this.authService.login(credentials, uris);
			
			if (!loginResult.success) {
				this.stats.failed.login++;
				warn(chalk.yellow(`[×] Login failed for ${credentials.name}: ${loginResult.message}`));
				return;
			}
			
			this.stats.success.login++;
			
			const checkInResult = await this.checkInService.performCheckIn(
				uris.checkin,
				loginResult.access_token
			);
			
			if (!checkInResult.success) {
				this.stats.failed.checkin++;
				warn(chalk.yellow(`[×] ${checkInResult.message} for ${credentials.name}`));
				return;
			}
			
			this.stats.success.checkin++;
			info(chalk.blue(`${checkInResult.message} for ${credentials.name}`));
			
		} catch (err) {
			error(chalk.red(`[!] Unexpected error processing ${credentials.name}:`, err.message));
		}
	}
	
	getStats() {
		return this.stats;
	}
}

export default AccountProcessor;