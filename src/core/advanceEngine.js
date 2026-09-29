export function calculateAdvanceInstallment({ totalAmount, installmentsCount, paidAmount = 0 }) {
  if (installmentsCount <= 0) throw new Error("عدد الأقساط يجب أن يكون أكبر من صفر");
  
  const monthlyInstallment = Math.round((totalAmount / installmentsCount) * 100) / 100;
  const remainingBalance = Math.max(0, totalAmount - paidAmount);
  const isSettled = remainingBalance === 0;

  return {
    monthlyInstallment,
    remainingBalance,
    isSettled
  };
}
