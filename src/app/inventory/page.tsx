import { InventoryDeepDive } from "@/components/InventoryDeepDive";
import { getInventoryData } from "@/lib/data";

export default function InventoryPage() {
  const inventory = getInventoryData();
  return <InventoryDeepDive data={inventory} />;
}
