import { calculateOvertime } from './overtimeEngine.js';

export function calculateNetPayroll({
  baseSalary,
  workDays = 30,
  absenceDays = 0,
  overtimeHours = 0,
  hourlyRateFactor = 1.5,
  advancesDeduction = 0,
  penalties = 0,
  incentives = 0
}) {
  const standardDays = 30;
  const dayRate = baseSalary / standardDays;
  
  // الاستحقاقات
  const actualWorkEarnings = workDays * dayRate;
  const absenceDeduction = absenceDays * dayRate;
  const overtime = calculateOvertime({ baseSalary, overtimeHours, hourlyRateFactor });
  const grossPay = (baseSalary - absenceDeduction) + overtime.totalOvertimeAmount + incentives;

  // الاستقطاعات
  const totalDeductions = advancesDeduction + penalties;
  
  // صافي المستحق النهائي
  const netPay = grossPay - totalDeductions;

  return {
    dayRate: Number(dayRate.toFixed(2)),
    absenceDeduction: Number(absenceDeduction.toFixed(2)),
    overtimeAmount: overtime.totalOvertimeAmount,
    grossPay: Number(grossPay.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netPay: Number(netPay.toFixed(2))
  };
}
