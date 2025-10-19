import { createServer } from "./server";
import { connectToDatabase } from "./config/database";
import { env } from "./config/env";

const start = async () => {
  try {
    await connectToDatabase();
    const app = createServer();
    app.listen(env.PORT, () => {
      console.log(`🚀 API server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server", error);
    process.exit(1);
  }
};

void start();
