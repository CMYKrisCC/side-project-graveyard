import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("sweep stale visitors", { minutes: 5 }, internal.visitors.sweep, {});

export default crons;
