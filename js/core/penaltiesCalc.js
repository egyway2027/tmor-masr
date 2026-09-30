/**
 * محرك احتساب الغياب والجزاءات والخصومات المالية
 * كود حسابي خالص لا يحتوي على واجهات أو اتصال بقاعدة البيانات
 */

/**
 * حساب خصم أيام الغياب بالاعتماد على الراتب الأساسي
 * @param {number} baseSalary - الراتب الأساسي
 * @param {number} absenceDays - عدد أيام الغياب بدون أجر
 * @param {number} [standardMonthDays=30] - عدد أيام الشهر المعتمدة لحساب اليومية
 * @returns {number} قيمة خصم الغياب
 */
export function calculateAbsenceDeduction(baseSalary = 0, absenceDays = 0, standardMonthDays = 30) {
  const salary = Math.max(0, Number(baseSalary) || 0);
  const days = Math.max(0, Number(absenceDays) || 0);
  const monthDays = Math.max(1, Number(standardMonthDays) || 30);

  const dayRate = salary / monthDays;
  return Math.round((days * dayRate) * 100) / 100;
}

/**
 * حساب تفصيلي لكافة بنود الخصومات والجزاءات للموظف
 * @param {Object} params
 * @param {number} params.baseSalary - الراتب الأساسي
 * @param {number} [params.absenceDays=0] - أيام الغياب
 * @param {number} [params.delayHours=0] - ساعات التأخير
 * @param {number} [params.directPenalties=0] - جزاءات نقدية مباشرة
 * @param {number} [params.standardMonthDays=30] - أيام الشهر المعتمدة
 * @param {number} [params.dailyWorkHours=8] - ساعات العمل اليومية
 * @returns {Object} تفاصيل الاستقطاعات الإجمالية
 */
export function calculatePenalties({
  baseSalary = 0,
  absenceDays = 0,
  delayHours = 0,
  directPenalties = 0,
  standardMonthDays = 30,
  dailyWorkHours = 8
}) {
  const salary = Math.max(0, Number(baseSalary) || 0);
  const absDays = Math.max(0, Number(absenceDays) || 0);
  const delHours = Math.max(0, Number(delayHours) || 0);
  const direct = Math.max(0, Number(directPenalties) || 0);
  const monthDays = Math.max(1, Number(standardMonthDays) || 30);
  const dayHours = Math.max(1, Number(dailyWorkHours) || 8);

  // حساب أجر اليوم والساعة
  const dayRate = Math.round((salary / monthDays) * 100) / 100;
  const hourRate = Math.round((dayRate / dayHours) * 100) / 100;

  // الخصومات
  const absenceDeduction = Math.round((absDays * dayRate) * 100) / 100;
  const delayDeduction = Math.round((delHours * hourRate) * 100) / 100;
  const directDeduction = Math.round(direct * 100) / 100;

  // إجمالي الاستقطاعات من بند الجزاءات والغياب
  const totalPenaltiesAmount = Math.round((absenceDeduction + delayDeduction + directDeduction) * 100) / 100;

  return {
    dayRate,
    hourRate,
    absenceDays: absDays,
    absenceDeduction,
    delayHours: delHours,
    delayDeduction,
    directPenalties: directDeduction,
    totalPenaltiesAmount
  };
}
