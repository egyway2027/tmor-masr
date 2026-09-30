/**
 * المحرك التجميعي لحساب رواتب الموظفين وصافي المستحقات
 * ينسق العمليات بين محركات الإضافي والجزاءات والسلف
 */

import { calculateOvertime } from './overtimeCalc.js';
import { calculatePenalties } from './penaltiesCalc.js';

/**
 * احتساب استحقاقات واستقطاعات وصافي راتب الموظف للشهر
 * @param {Object} params
 * @param {number} params.baseSalary - الراتب الأساسي الشهري
 * @param {number} [params.workDays=30] - أيام العمل الفعلية
 * @param {number} [params.absenceDays=0] - أيام الغياب بدون أجر
 * @param {number} [params.overtimeDays=0] - الأيام الإضافية
 * @param {number} [params.overtimeHours=0] - ساعات العمل الإضافي
 * @param {number} [params.hourlyFactor=1.0] - معامل أجر الساعة الإضافية
 * @param {number} [params.incentives=0] - حوافز ومكافآت
 * @param {number} [params.advanceDeduction=0] - قسط السلفة المستقطع للشهر
 * @param {number} [params.directPenalties=0] - جزاءات وخصومات نقدية مباشرة
 * @param {number} [params.delayHours=0] - ساعات التأخير
 * @param {number} [params.standardMonthDays=30] - أيام الشهر المعتمدة لحساب اليومية
 * @param {number} [params.dailyWorkHours=8] - ساعات العمل اليومية
 * @returns {Object} كشف الحساب المالي المفصل للموظف
 */
export function calculateEmployeePayroll({
  baseSalary = 0,
  workDays = 30,
  absenceDays = 0,
  overtimeDays = 0,
  overtimeHours = 0,
  hourlyFactor = 1.0,
  incentives = 0,
  advanceDeduction = 0,
  directPenalties = 0,
  delayHours = 0,
  standardMonthDays = 30,
  dailyWorkHours = 8
}) {
  const salary = Math.max(0, Number(baseSalary) || 0);
  const bonus = Math.max(0, Number(incentives) || 0);
  const loanDeduction = Math.max(0, Number(advanceDeduction) || 0);
  const monthDays = Math.max(1, Number(standardMonthDays) || 30);
  const dayHours = Math.max(1, Number(dailyWorkHours) || 8);

  // 1. حساب أجر اليوم والساعة
  const dayRate = Math.round((salary / monthDays) * 100) / 100;
  const hourRate = Math.round((dayRate / dayHours) * 100) / 100;

  // 2. استدعاء محرك الإضافي
  const overtimeResult = calculateOvertime({
    baseSalary: salary,
    overtimeDays,
    overtimeHours,
    hourlyFactor,
    standardMonthDays: monthDays,
    dailyWorkHours: dayHours
  });

  // 3. استدعاء محرك الجزاءات والغياب
  const penaltyResult = calculatePenalties({
    baseSalary: salary,
    absenceDays,
    delayHours,
    directPenalties,
    standardMonthDays: monthDays,
    dailyWorkHours: dayHours
  });

  // 4. إجمالي الاستحقاقات (الأجر الأساسي - خصم الغياب + أجر الإضافي + الحوافز)
  // أو (أيام العمل الفعلية * أجر اليوم + أجر الإضافي + الحوافز)
  const earnedBase = Math.round((salary - penaltyResult.absenceDeduction) * 100) / 100;
  const grossPay = Math.round((earnedBase + overtimeResult.totalOvertimeAmount + bonus) * 100) / 100;

  // 5. إجمالي الاستقطاعات (قسط السلفة + الجزاءات النقدية والتأخيرات)
  const totalPenaltiesAndDelays = Math.round((penaltyResult.directPenalties + penaltyResult.delayDeduction) * 100) / 100;
  const totalDeductions = Math.round((loanDeduction + totalPenaltiesAndDelays) * 100) / 100;

  // 6. صافي الأجر المستحق النهائي
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  return {
    baseSalary: salary,
    dayRate,
    hourRate,
    workDays: Number(workDays) || 0,
    absenceDays: penaltyResult.absenceDays,
    absenceDeduction: penaltyResult.absenceDeduction,
    overtimeDays: overtimeResult.overtimeDays,
    daysOvertimeAmount: overtimeResult.daysAmount,
    overtimeHours: overtimeResult.overtimeHours,
    hoursOvertimeAmount: overtimeResult.hoursAmount,
    totalOvertimeAmount: overtimeResult.totalOvertimeAmount,
    incentives: bonus,
    grossPay,
    advanceDeduction: loanDeduction,
    penaltiesDeduction: totalPenaltiesAndDelays,
    totalDeductions,
    netPay
  };
}

/**
 * تجميع إجماليات كشف الرواتب لشهر كامل (مسير الرواتب العام)
 * @param {Array<Object>} payrollRecords - مصفوفة بسجلات رواتب الموظفين المحسوبة
 * @returns {Object} المؤشرات المالية الإجمالية للشهر
 */
export function aggregateMonthlyPayroll(payrollRecords = []) {
  return payrollRecords.reduce(
    (acc, record) => {
      acc.totalEmployees += 1;
      acc.totalBaseSalaries += record.baseSalary || 0;
      acc.totalGrossPay += record.grossPay || 0;
      acc.totalOvertime += record.totalOvertimeAmount || 0;
      acc.totalIncentives += record.incentives || 0;
      acc.totalAdvances += record.advanceDeduction || 0;
      acc.totalPenalties += record.penaltiesDeduction || 0;
      acc.totalDeductions += record.totalDeductions || 0;
      acc.totalNetPay += record.netPay || 0;
      return acc;
    },
    {
      totalEmployees: 0,
      totalBaseSalaries: 0,
      totalGrossPay: 0,
      totalOvertime: 0,
      totalIncentives: 0,
      totalAdvances: 0,
      totalPenalties: 0,
      totalDeductions: 0,
      totalNetPay: 0
    }
  );
}
