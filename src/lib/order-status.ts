export const STATUS_LABELS: Record<string, string> = {
  received: "Order received",
  confirmed: "Confirmed by Leemah",
  preparing: "Being prepared",
  ready: "Ready for collection or delivery",
  completed: "Completed",
};

export const ORDER_STATUSES = Object.keys(STATUS_LABELS);

export type TimelineStep = {
  status: string;
  label: string;
  at: string | null;
  complete: boolean;
};

export function buildTimeline(existing: TimelineStep[] | null | undefined, status: string, now: string): TimelineStep[] {
  const statusIndex = ORDER_STATUSES.indexOf(status);
  const existingSteps = Array.isArray(existing) ? existing : [];

  return ORDER_STATUSES.map((item, index) => {
    const current = existingSteps.find((step) => step.status === item);
    const complete = index <= statusIndex;
    return {
      status: item,
      label: STATUS_LABELS[item],
      at: complete ? current?.at || now : null,
      complete,
    };
  });
}
