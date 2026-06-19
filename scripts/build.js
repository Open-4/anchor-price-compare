// Strip BOM from env vars (PowerShell pipe bug)
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^\uFEFF/, "");
}
if (process.env.PAYPAL_CLIENT_ID) {
  process.env.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID.replace(/^\uFEFF/, "");
}
if (process.env.PAYPAL_CLIENT_SECRET) {
  process.env.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET.replace(/^\uFEFF/, "");
}
const { execSync } = require("child_process");
const steps = ["npx prisma migrate deploy","npx prisma generate","next build"];
for (const cmd of steps) {
  try { execSync(cmd, { stdio: "inherit", env: process.env }); }
  catch (e) { process.exit(e.status || 1); }
}
