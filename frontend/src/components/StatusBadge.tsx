type BadgeKind = "classification" | "status" | "risk" | "score" | "health";

export interface StatusBadgeProps {
  children: string | number;
  value?: string;
  kind?: BadgeKind;
  label?: string;
}

function normalizeClassName(value: string | number) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "_");
}

export function StatusBadge({ children, value, kind = "status", label }: StatusBadgeProps) {
  const badgeValue = value ?? children;
  const normalized = normalizeClassName(badgeValue);

  if (kind === "health") {
    return (
      <span className="health-pill" aria-label={label}>
        {children}
      </span>
    );
  }

  if (kind === "score") {
    return (
      <span className={normalized === "good" ? "score good" : "score"} aria-label={label}>
        {children}
      </span>
    );
  }

  const className = `${kind === "classification" ? "badge" : kind} ${normalized}`;

  return (
    <span className={className} aria-label={label}>
      {children}
    </span>
  );
}
