export function calculateOvertime({ 
  baseSalary, 
  overtimeHours = 0, 
  hourlyRateFactor = 1.5, 
  standardMonthDays = 30, 
  workHoursPerDay = 8,
  overtimeDays = 0 
}) {
  const dayRate = baseSalary / standardMonthDays;
  const hourRate = dayRate / workHoursPerDay;

  const hoursOvertimeAmount = overtimeHours * (hourRate * hourlyRateFactor);
  const daysOvertimeAmount = overtimeDays * dayRate;

  return {
    dayRate: Number(dayRate.toFixed(2)),
    hourRate: Number(hourRate.toFixed(2)),
    totalOvertimeAmount: Number((hoursOvertimeAmount + daysOvertimeAmount).toFixed(2))
  };
}
