import { app } from "./app.ts";
import { config } from "./config.ts";

app.listen(config.port);

console.log(
  `[${config.serviceName}] Running on http://localhost:${config.port}`
);
