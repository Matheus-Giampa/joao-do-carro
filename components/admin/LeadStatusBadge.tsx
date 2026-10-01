import { LEAD_STATUS_LABEL, LEAD_STATUS_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold ring-1", LEAD_STATUS_STYLE[status])}>
      {LEAD_STATUS_LABEL[status]}
    </span>
  );
}
