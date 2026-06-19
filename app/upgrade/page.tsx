import UpgradeClient from "./UpgradeClient";

export const dynamic = "force-dynamic";

export default function UpgradePage() {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
  return <UpgradeClient paypalClientId={paypalClientId} />;
}
