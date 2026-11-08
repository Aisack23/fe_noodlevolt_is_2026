import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { getStockStatus, type InventoryItem } from "@/lib/api/inventory";

type InventoryTableProps = {
  items: InventoryItem[];
};

const headers = ["Insumo", "Unidad", "Stock actual", "Stock mínimo", "Estado"];

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="h-11 bg-background">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 text-sm font-normal text-text-secondary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="h-14 border-b border-border">
              <th scope="row" className="w-2/5 px-4 text-sm font-normal text-brown">
                {item.name}
              </th>
              <td className="px-4 text-sm text-brown">{item.unit}</td>
              <td className="px-4 text-sm text-brown">{item.currentStock}</td>
              <td className="px-4 text-sm text-brown">{item.minimumStock}</td>
              <td className="px-4">
                <BadgeEstado estado={getStockStatus(item)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}