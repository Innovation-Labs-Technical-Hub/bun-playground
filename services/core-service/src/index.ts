import { app } from "./app.ts";
import { config } from "./config.ts";

export default {
  port: config.port,
  fetch: app.fetch,
};

console.log(
  `[${config.serviceName}] Running on http://localhost:${config.port}`
);
