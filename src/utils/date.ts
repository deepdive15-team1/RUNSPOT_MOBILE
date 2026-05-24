export function formatDisplayDate(isoString: string) {
  const d = new Date(isoString);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(d);
}
