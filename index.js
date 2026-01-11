import App from "./services/app.js";
import { config } from "./config.js";

const app = new App(config);
app.run().catch(console.error);