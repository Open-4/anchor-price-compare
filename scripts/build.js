if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^\uFEFF/, "");
}
const { execSync } = require("child_process");
// Try db push first (creates tables from schema)
try { execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env: process.env }); } catch (e) {
  console.error("db push failed, continuing:", e.message);
}
execSync("npx prisma generate && next build", { stdio: "inherit", env: process.env });
