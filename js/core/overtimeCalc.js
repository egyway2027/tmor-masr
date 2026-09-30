/**
 * محرك احتساب أجر العمل الإضافي (ساعات وأيام)
 * مستقل تماماً عن الواجهات وقواعد البيانات
 */

/**
 * حساب أجر اليوم والساعة وقيمة العمل الإضافي الإجمالية
 * @param {Object} params
 * @param {number} params.baseSalary - الراتب الأساسي الشهري
 * @param {number} [params.overtimeDays=0] - عدد الأيام الإضافية
 * @param {number} [params.overtimeHours=0] - عدد ساعات الإضافي
 * @param {number} [params.hourlyFactor=1.0] - معامل أجر الساعة الإضافية
 * @param {number} [params.standardMonthDays=30] - عدد أيام الشهر المعتمدة لحساب اليومية
 * @param {number} [params.dailyWorkHours=8] - عدد ساعات العمل اليومية
 * @returns {Object} تفاصيل الحساب المالي الدقيق
 */
export function calculateOvertime({
  baseSalary = 0,
  overtimeDays = 0,
  overtimeHours = 0,
  hourlyFactor = 1.0,
  standardMonthDays = 30,
  dailyWorkHours = 8
}) {
  const salary = Math.max(0, Number(baseSalary) || 0);
  const daysCount = Math.max(0, Number(overtimeDays) || 0);
  const hoursCount = Math.max(0, Number(overtimeHours) || 0);
  const factor = Math.max(0, Number(hourlyFactor) || 1.0);
  const monthDays = Math.max(1, Number(standardMonthDays) || 30);
  const dayHours = Math.max(1, Number(dailyWorkHours) || 8);

  // حساب أجر اليوم وأجر الساعة
  const dayRate = Math.round((salary / monthDays) * 100) / 100;
  const hourRate = Math.round((dayRate / dayHours) * 100) / 100;

  // احتساب قيمة الأيام الإضافية
  const daysAmount = Math.round((daysCount * dayRate) * 100) / 100;

  // احتساب قيمة الساعات الإضافية
  const hoursAmount = Math.round((hoursCount * hourRate * factor) * 100) / 100;

  // إجمالي الإضافي المستحق
  const totalOvertimeAmount = Math.round((daysAmount + hoursAmount) * 100) / 100;

  return {
    baseSalary: salary,
    dayRate,
    hourRate,
    overtimeDays: daysCount,
    daysAmount,
    overtimeHours: hoursCount,
    hoursAmount,
    hourlyFactor: factor,
    totalOvertimeAmount
  };
}

/**
 * دالة مساعدة لحساب إجمالي أجر اليوميات العمالية المباشرة (مثل عمالة المصنع)
 * @param {number} workerCount - عدد العمال
 * @param {number} rate - أجر العامل
 * @returns {number}
 */
export function calculateDirectLaborAmount(workerCount = 0, rate = 0) {
  const count = Math.max(0, Number(workerCount) || 0);
  const unitRate = Math.max(0, Number(rate) || 0);
  return Math.round((count * unitRate) * 100) / 100;
}
