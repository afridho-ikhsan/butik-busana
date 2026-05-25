"use client";

import { formatDate } from "@/utils/date-formatter";

function DateLabel({
  date,
  options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  className = "",
}: {
  date: Date | number | null;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  return <p className={className}>{formatDate(new Date(`${date}`), options)}</p>;
}

export default DateLabel;
