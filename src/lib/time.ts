export function formatLiveClock(date: Date): string {
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${weekday} ${day} ${month}, ${hours}:${minutes}:${seconds}`;
}

export function getBriefingLabel(date: Date): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Morning Briefing";
  if (hour >= 12 && hour < 18) return "Afternoon Briefing";
  if (hour >= 18 && hour < 22) return "Evening Briefing";
  return "Night Briefing";
}
