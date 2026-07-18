export const determineSeason = (date = new Date(), latitude = 38) => {
  const month = date.getMonth() + 1;
  const northern = month >= 3 && month <= 5 ? "spring" : month >= 6 && month <= 8 ? "summer" : month >= 9 && month <= 11 ? "autumn" : "winter";
  return latitude >= 0 ? northern : { spring:"autumn", summer:"winter", autumn:"spring", winter:"summer" }[northern];
};

export const determineDayPhase = (date = new Date(), sunrise, sunset) => {
  const toMinutes = (value, fallback) => { const match=String(value || "").match(/T(\d\d):(\d\d)/); return match ? Number(match[1])*60+Number(match[2]) : fallback; };
  const current=date.getHours()*60+date.getMinutes(), rise=toMinutes(sunrise,420), set=toMinutes(sunset,1140);
  if (current < rise-45 || current >= set+90) return "night";
  if (current < rise) return "dawn";
  if (current < set-90) return "daytime";
  if (current < set) return "golden-hour";
  return "dusk";
};
