import UpgradeClient from "./UpgradeClient";

export default function UpgradePage() {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
  return <UpgradeClient paypalClientId={paypalClientId} />;
}
