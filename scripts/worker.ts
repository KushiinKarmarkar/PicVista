import { startBullWorker } from "../src/lib/jobs/bull";

startBullWorker();
console.log("[picvista] BullMQ worker started (REDIS_URL required)");
