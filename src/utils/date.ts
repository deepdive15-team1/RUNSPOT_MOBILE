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

export function formatDate(dateStr: string) {
  if (!dateStr) return "";

  const dateObj = new Date(dateStr);
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[dateObj.getDay()];

  return `${month}.${date} (${dayName})`;
}
