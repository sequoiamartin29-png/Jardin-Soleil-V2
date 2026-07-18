export const localDateKey = (date = new Date()) => {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

export const isTaskDueOn = (template, date = new Date()) => {
  const recurrence = template.recurrence || template.repeat || "one-time";
  const day = date.getDay();
  if (recurrence === "daily") return true;
  if (recurrence === "weekdays") return day > 0 && day < 6;
  if (recurrence === "weekly") return day === Number(template.dayOfWeek ?? new Date(template.createdAt || date).getDay());
  if (recurrence === "selected-days") return (template.daysOfWeek || []).map(Number).includes(day);
  if (recurrence === "monthly") return date.getDate() === Number(template.dayOfMonth || 1);
  if (recurrence === "seasonal") return (template.months || []).map(Number).includes(date.getMonth() + 1);
  return false;
};
