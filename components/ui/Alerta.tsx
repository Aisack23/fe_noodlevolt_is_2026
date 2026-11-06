import type { ReactNode } from "react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertaTono = "info" | "success" | "warning" | "danger";

const tonos: Record<AlertaTono, { box: string; icon: string; Icon: LucideIcon }> = {
  info: { box: "border-info bg-info/12", icon: "text-info", Icon: Info },
  success: { box: "border-success bg-success/12", icon: "text-success", Icon: CircleCheck },
  warning: { box: "border-warning bg-warning/12", icon: "text-warning", Icon: TriangleAlert },
  danger: { box: "border-danger bg-danger/12", icon: "text-danger", Icon: CircleAlert },
};

type AlertaProps = {
  tono?: AlertaTono;
  children: ReactNode;
  className?: string;
};


export function Alerta({ tono = "danger", children, className }: AlertaProps) {
  const { box, icon, Icon } = tonos[tono];

  return (
    <div
      role={tono === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-3 rounded-control border p-4 text-base font-semibold text-brown",
        box,
        className,
      )}
    >
      <Icon aria-hidden className={cn("size-6 shrink-0", icon)} />
      <p>{children}</p>
    </div>
  );
}