import app from "./app";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(`AskLoom backend running on port ${config.port}`);
});
