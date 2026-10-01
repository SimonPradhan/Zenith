export function formatTaskDueDate(
  value: string | null | undefined,
): {
  label: string;
  tone: "normal" | "warning" | "overdue";
} | null {
  if (!value) return null;

  const dueDate = new Date(value);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);

  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / 86_400_000,
  );

  if (diffDays < 0) {
    return {
      label: `Overdue · ${formatDate(dueDate)}`,
      tone: "overdue",
    };
  }

  if (diffDays === 0) {
    return {
      label: "Due today",
      tone: "warning",
    };
  }

  if (diffDays === 1) {
    return {
      label: "Due tomorrow",
      tone: "warning",
    };
  }

  return {
    label: `Due ${formatDate(dueDate)}`,
    tone: "normal",
  };
}

function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
