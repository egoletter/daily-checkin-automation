import AuthService from "./auth-service.js";
import AccountProcessor from "./account-processor.js";
import CaptchaService from "./captcha-service.js";
import CheckInService from "./checkin-service.js";
import { error, info } from "./helpers.js";

import chalk from "chalk";
import fs from "fs/promises";
import readlineSync from "readline-sync";

class Application {
	constructor(config) {
		this.config = config;
		this.captchaService = new CaptchaService(config);
		this.authService = new AuthService(config, this.captchaService);
		this.checkInService = new CheckInService(config);
		this.processor = new AccountProcessor(this.authService, this.checkInService);
	}
	
	async loadAccounts(filePath) {
		try {
			await fs.access(filePath, fs.constants.F_OK);
			const content = await fs.readFile(filePath, "utf8");
			
			return content
				.split("\n")
				.map(line => line.trim())
				.filter(line => line.length > 0)
				.map(account => ({
					name: account,
					password: account
				}));
				
		} catch (err) {
			if (err.code === "ENOENT") {
				throw new Error(`File ${chalk.italic.bold(filePath)} not found`);
			}
			throw err;
		}
	}
	
	async processAccounts(filePath) {
		try {
			const accounts = await this.loadAccounts(filePath);
			const uris = {
				captcha: this.config.target.base_url + this.config.target.captcha_uri,
				auth: this.config.target.base_url + this.config.target.auth_uri,
				checkin: this.config.target.base_url + this.config.target.checkin_uri
			};
			
			info(`\n> Processing ${chalk.cyan(String(accounts.length))} accounts...\n`);
			
			await Promise.all(accounts.map(async (account) => {
				account.area ?? (account.area = this.config.target.account_area.toString());
				await this.processor.processAccount(account, uris, this.config.maxRetries);
				await this.authService.delay(500);
			}));
			
			info(`\n`);
			info(`> Successful logins: ${chalk.green(String(this.processor.getStats().success.login))}`);
			info(`> Failed logins: ${chalk.red(String(this.processor.getStats().failed.login))}`);
			info(`> Successful check-ins: ${chalk.green(String(this.processor.getStats().success.checkin))}`);
			info(`> Failed check-ins: ${chalk.red(String(this.processor.getStats().failed.checkin))}`);
			
		} catch (err) {
			throw err;
		}
	}
	
	async run() {
		try {
			const filePath = process.argv[2] || readlineSync.question("Enter filename.txt: ");
			
			if (!filePath) {
				throw new Error("No file specified");
			}
			
			await this.processAccounts(filePath);
		} catch (err) {
			error(chalk.red(`${chalk.bold("[!]")} An error occurred: ${err.message}`));
			process.exit(1);
		}
	}
}

export default Application;