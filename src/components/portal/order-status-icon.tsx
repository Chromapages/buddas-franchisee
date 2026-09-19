import { AlertCircle, CheckCircle2, Clock3, FileText, Package, Truck, XCircle } from "lucide-react";
import type { OperationalStatusIcon } from "@/src/features/portal/order-status-presentation";

export const OrderStatusIcon = ({ icon, className }: { icon: OperationalStatusIcon; className?: string }) => {
  const Icon = icon === "document"
    ? FileText
    : icon === "package"
      ? Package
      : icon === "truck"
        ? Truck
        : icon === "check"
          ? CheckCircle2
          : icon === "cancel"
            ? XCircle
            : icon === "alert"
              ? AlertCircle
              : Clock3;
  return <Icon className={className} aria-hidden="true" />;
};
