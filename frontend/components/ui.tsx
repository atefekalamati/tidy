"use client";

import type { ReactNode, SVGProps } from "react";
import { useT } from "@/lib/i18n";
import type { Member, Priority } from "@/lib/types";
import { labels } from "@/data/seed";

export const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

function Stroke({ width = 2, size = 16, ...props }: SVGProps<SVGSVGElement> & { width?: number; size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

type IconProps = { size?: number; className?: string };

export const BoardIcon = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="5" height="16" rx="1.5" />
    <rect x="10" y="4" width="5" height="10" rx="1.5" />
    <rect x="17" y="4" width="4" height="13" rx="1.5" />
  </Stroke>
);
export const ChatIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </Stroke>
);
export const PlusIcon = (p: IconProps) => (
  <Stroke width={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Stroke>
);
export const CloseIcon = (p: IconProps) => (
  <Stroke width={2.2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Stroke>
);
export const ArrowIcon = ({ className, ...p }: IconProps) => (
  <Stroke width={2.2} className={cx("rtl:-scale-x-100", className)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Stroke>
);
export const ChevronIcon = ({ className, ...p }: IconProps) => (
  <Stroke className={cx("rtl:-scale-x-100", className)} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Stroke>
);
export const TrashIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </Stroke>
);
export const ImageIcon = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 17l-5-5-9 8" />
  </Stroke>
);
export const TaskIcon = (p: IconProps) => (
  <Stroke width={2.2} {...p}>
    <path d="M9 11l3 3 8-8" />
    <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
  </Stroke>
);
export const DotsIcon = ({ size = 16 }: IconProps) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="19" cy="12" r="1.7" />
  </svg>
);
export const EventIcon = ({ path, size = 12 }: { path: string; size?: number }) => (
  <Stroke width={2.2} size={size}>
    <path d={path} />
  </Stroke>
);

export const iconButton = "grid size-9 shrink-0 place-items-center rounded-lg text-secondary transition-colors";

export function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex gap-0.5 rounded-[9px] border border-segment-border bg-segment p-[3px]">
      {children}
    </div>
  );
}

export function SegmentButton({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "h-9 min-w-9 rounded-md px-2.5 text-[12px] font-medium transition-colors",
        active ? "bg-surface-hover text-ink shadow-segment" : "text-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

const avatarSizes = {
  24: "size-6 text-[9.5px]",
  26: "size-[26px] text-[10px]",
  28: "size-7 text-[10.5px]",
  30: "size-[30px] text-[10.5px]",
};

export function Avatar({ member, size = 28, className }: { member: Member; size?: keyof typeof avatarSizes; className?: string }) {
  const { L } = useT();
  return (
    <span
      title={L(member.name)}
      style={{ backgroundColor: `var(--avatar-${member.id})` }}
      className={cx("grid shrink-0 place-items-center rounded-full font-bold text-ink", avatarSizes[size], className)}
    >
      {L(member.initials)}
    </span>
  );
}

export function AvatarStack({ members, size, ring }: { members: Member[]; size: keyof typeof avatarSizes; ring: string }) {
  return (
    <span className="flex items-center ps-1.5">
      {members.map((m) => (
        <Avatar key={m.id} member={m} size={size} className={cx("-ms-1.5 ring-2", ring)} />
      ))}
    </span>
  );
}

export function LabelChip({ id, tall }: { id: string; tall?: boolean }) {
  const { L } = useT();
  const label = labels.find((l) => l.id === id)!;
  return (
    <span
      style={{ color: `var(--label-${id}-fg)`, backgroundColor: `var(--label-${id}-bg)` }}
      className={cx("inline-flex items-center rounded-md px-2 text-[12px] font-medium", tall ? "h-[22px]" : "h-5")}
    >
      {L(label.name)}
    </span>
  );
}

export const priorityColor: Record<Priority, string> = {
  high: "var(--color-priority-high)",
  medium: "var(--color-priority-medium)",
  low: "var(--color-priority-low)",
};

const priorityLevel: Record<Priority, number> = { low: 1, medium: 2, high: 3 };

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useT();
  const color = priorityColor[priority];
  const bar = (level: number) => (priorityLevel[priority] >= level ? color : "var(--color-bar-off)");
  return (
    <span title={t.priorities[priority]} style={{ color }} className="inline-flex items-center gap-[5px] text-[12px]/4 font-medium">
      <svg aria-hidden width="14" height="14" viewBox="0 0 14 14">
        <rect x="1" y="9" width="3" height="4" rx="1" fill={bar(1)} />
        <rect x="5.5" y="5.5" width="3" height="7.5" rx="1" fill={bar(2)} />
        <rect x="10" y="2" width="3" height="11" rx="1" fill={bar(3)} />
      </svg>
      {t.priorities[priority]}
    </span>
  );
}
