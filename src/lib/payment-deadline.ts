const DEFAULT_PAYMENT_DEADLINE_MINUTES = 24 * 60;
const DEFAULT_PAYMENT_DEADLINE_REMINDER_MINUTES = [30, 15, 5];

function parsePositiveMinutes(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const PAYMENT_DEADLINE_MS =
  parsePositiveMinutes(
    process.env.PAYMENT_DEADLINE_MINUTES,
    DEFAULT_PAYMENT_DEADLINE_MINUTES
  ) *
  60 *
  1000;

export function paymentDeadlineReminderMinutesList(): number[] {
  const raw = process.env.PAYMENT_DEADLINE_REMINDER_MINUTES;
  if (!raw) return DEFAULT_PAYMENT_DEADLINE_REMINDER_MINUTES;
  const parsed = raw
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0);
  if (parsed.length === 0) return DEFAULT_PAYMENT_DEADLINE_REMINDER_MINUTES;
  return parsed.slice(0, 3);
}

export function orderPaymentDeadlineAt(createdAt: Date | number): number {
  const createdMs =
    typeof createdAt === "number" ? createdAt : createdAt.getTime();
  return createdMs + PAYMENT_DEADLINE_MS;
}
