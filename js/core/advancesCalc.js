/**
 * محرك العمليات الحسابية للسلف والقروض والأقساط
 * لا يتصل بالواجهة ولا بقاعدة البيانات
 */

/**
 * حساب تفاصيل السلفة والقسط الشهري وحالة السداد
 * @param {Object} params
 * @param {number} params.totalAmount - المبلغ الإجمالي للسلفة أو القرض
 * @param {number} params.installmentsCount - عدد الأقساط المقررة
 * @param {number} [params.paidInstallments=0] - عدد الأقساط المسددة حتى تاريخه
 * @param {number} [params.customMonthlyInstallment] - قيمة قسط محددة يدوياً (اختياري)
 * @returns {Object} النتائج الحسابية الدقيقة
 */
export function calculateAdvance({
  totalAmount = 0,
  installmentsCount = 1,
  paidInstallments = 0,
  customMonthlyInstallment = null
}) {
  const total = Number(totalAmount) || 0;
  const count = Math.max(1, parseInt(installmentsCount, 10) || 1);
  const paidCount = Math.max(0, parseInt(paidInstallments, 10) || 0);

  // حساب القسط الشهري (إما آلي بالقسمة أو يدوي إذا تم تحديده)
  let monthlyInstallment = customMonthlyInstallment !== null && customMonthlyInstallment !== undefined
    ? Number(customMonthlyInstallment)
    : Math.round((total / count) * 100) / 100;

  // إجمالي المبالغ المسددة
  const totalPaid = Math.min(total, Math.round((paidCount * monthlyInstallment) * 100) / 100);

  // الرصيد المتبقي
  const remainingBalance = Math.max(0, Math.round((total - totalPaid) * 100) / 100);

  // الأقساط المتبقية
  const remainingInstallments = Math.max(0, count - paidCount);

  // الحالة
  const isSettled = remainingBalance === 0;
  const status = isSettled ? 'مسدد بالكامل' : 'جاري السداد';

  return {
    totalAmount: total,
    installmentsCount: count,
    monthlyInstallment,
    paidInstallments: paidCount,
    remainingInstallments,
    totalPaid,
    remainingBalance,
    isSettled,
    status
  };
}

/**
 * حساب القسط المستحق استقطاعه للموظف في شهر معين
 * @param {Array} employeeAdvances - قائمة السلف النشطة الخاصة بالموظف
 * @returns {number} إجمالي قيمة الخصم للشهر
 */
export function calculateMonthlyAdvanceDeduction(employeeAdvances = []) {
  if (!Array.isArray(employeeAdvances)) return 0;

  return employeeAdvances.reduce((sum, adv) => {
    // يخصم فقط إذا كانت السلفة ما زالت جارية
    if (!adv.isSettled && adv.remainingBalance > 0) {
      // لا يخصم أكثر من الرصيد المتبقي
      const deduction = Math.min(adv.monthlyInstallment, adv.remainingBalance);
      return sum + deduction;
    }
    return sum;
  }, 0);
}
