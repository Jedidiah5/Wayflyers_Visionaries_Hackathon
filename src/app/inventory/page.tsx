import { INVENTORY_DATA } from "@/lib/data";
import { InventoryDeepDive } from "@/components/InventoryDeepDive";

export default function InventoryPage() {
  return <InventoryDeepDive data={INVENTORY_DATA} productFocus="ARCH LOGO TEE" />;
}
