/**
 * المحرك الحسابي لعمالة المصنع والمقاولين (Pure Labor Calculation Engine)
 * مستقل تماماً عن الواجهات وقواعد البيانات
 */

/**
 * 1. حساب الفارق الزمني بالدقائق والساعات بين وقتين مع دعم عبور منتصف الليل
 * @param {string} startTime - وقت البداية (صيغة "HH:MM")
 * @param {string} endTime - وقت النهاية (صيغة "HH:MM")
 * @returns {Object} إجمالي الدقائق، عدد الساعات الصحيحة، والدقائق المتبقية
 */
export function calculateShiftMinutes(startTime, endTime) {
  if (!startTime || !endTime) {
    return { totalMinutes: 0, hours: 0, minutes: 0, decimalHours: 0, text: '0 س' };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startTotalMinutes = (startH * 60) + startM;
  let endTotalMinutes = (endH * 60) + endM;

  // إذا كان وقت الانصراف أقل من وقت الحضور (عبور منتصف الليل للشفت الليلي)
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // إضافة 1440 دقيقة (24 ساعة)
  }

  const diffMinutes = endTotalMinutes - startTotalMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const decimalHours = Math.round((diffMinutes / 60) * 10000) / 10000;

  return {
    totalMinutes: diffMinutes,
    hours,
    minutes,
    decimalHours,
    text: minutes > 0 ? `${hours} ساعة و ${minutes} دقيقة` : `${hours} ساعة`
  };
}

/**
 * 2. حساب أجر الشفت الواحد للعمالة الرجالي (نهاري أو ليلي)
 * @param {Object} params
 * @param {number} params.totalMinutes - عدد دقائق الوردية
 * @param {number} params.workerCount - عدد العمال
 * @param {number} [params.hourlyRate=75] - سعر الساعة (افتراضي 75 ج)
 * @returns {Object} أجر الفرد وإجمالي الوردية
 */
export function calculateMenShift({ totalMinutes = 0, workerCount = 0, hourlyRate = 75 }) {
  const count = Math.max(0, parseInt(workerCount, 10) || 0);
  const ratePerHour = Math.max(0, Number(hourlyRate) || 75);
  
  // سعر الدقيقة = سعر الساعة ÷ 60 دقيقة
  const ratePerMinute = ratePerHour / 60;

  // أجر الفرد بالدقيقة
  const perWorkerWage = Math.round((totalMinutes * ratePerMinute) * 100) / 100;

  // إجمالي الوردية لكافة العمال
  const shiftTotal = Math.round((perWorkerWage * count) * 100) / 100;

  return {
    hourlyRate: ratePerHour,
    ratePerMinute,
    totalMinutes,
    perWorkerWage,
    workerCount: count,
    shiftTotal
  };
}

/**
 * 3. تجميع اليومية الكاملة للرجال (شفت نهاري + شفت ليلي - الجزاءات)
 */
export function calculateMenDaySummary({ dayShift, nightShift, penalties = 0 }) {
  const penaltyAmount = Math.max(0, Number(penalties) || 0);

  const totalWorkers = dayShift.workerCount + nightShift.workerCount;
  const totalGross = Math.round((dayShift.shiftTotal + nightShift.shiftTotal) * 100) / 100;
  const netTotal = Math.max(0, Math.round((totalGross - penaltyAmount) * 100) / 100);

  return {
    dayShift,
    nightShift,
    totalWorkers,
    totalGross,
    penalties: penaltyAmount,
    netTotal
  };
}

/**
 * 4. حساب يومية عمالة السيدات (شفت موحد + 8 ساعات أساسي + إضافي بالدقيقة + 150 ج نقل)
 * @param {Object} params
 * @param {number} params.totalMinutes - إجمالي دقائق الوردية
 * @param {number} params.workerCount - عدد العاملات
 * @param {number} [params.baseDayRate=450] - أجر اليوم الأساسي عن 8 ساعات
 * @param {number} [params.standardHours=8] - عدد الساعات الأساسية
 * @param {number} [params.transportRate=150] - بدل النقل لكل عاملة
 * @param {number} [params.penalties=0] - الجزاءات
 */
export function calculateWomenDayShift({
  totalMinutes = 0,
  workerCount = 0,
  baseDayRate = 450,
  standardHours = 8,
  transportRate = 150,
  penalties = 0
}) {
  const count = Math.max(0, parseInt(workerCount, 10) || 0);
  const baseRate = Math.max(0, Number(baseDayRate) || 450);
  const stdHours = Math.max(1, Number(standardHours) || 8);
  const transRate = Math.max(0, Number(transportRate) || 150);
  const penaltyAmount = Math.max(0, Number(penalties) || 0);

  const standardMinutes = stdHours * 60; // 480 دقيقة
  const minuteRate = (baseRate / stdHours) / 60; // 0.9375 ج لكل دقيقة

  // تقسيم الدقائق إلى أساسي وإضافي
  const regularMinutes = Math.min(totalMinutes, standardMinutes);
  const overtimeMinutes = Math.max(0, totalMinutes - standardMinutes);

  // أجر الأساسي للفرد
  const regularWagePerWorker = totalMinutes >= standardMinutes
    ? baseRate
    : Math.round((regularMinutes * minuteRate) * 100) / 100;

  // أجر الإضافي للفرد
  const overtimeWagePerWorker = Math.round((overtimeMinutes * minuteRate) * 100) / 100;

  // إجمالي نصيب العاملة الواحدة في اليوم (شامل النقل)
  const totalPerWorker = Math.round((regularWagePerWorker + overtimeWagePerWorker + transRate) * 100) / 100;

  // الإجماليات لكافة العاملات
  const totalRegularWage = Math.round((regularWagePerWorker * count) * 100) / 100;
  const totalOvertimeWage = Math.round((overtimeWagePerWorker * count) * 100) / 100;
  const totalTransport = Math.round((transRate * count) * 100) / 100;

  const totalGross = Math.round((totalPerWorker * count) * 100) / 100;
  const netTotal = Math.max(0, Math.round((totalGross - penaltyAmount) * 100) / 100);

  return {
    workerCount: count,
    totalMinutes,
    regularMinutes,
    overtimeMinutes,
    baseRate,
    minuteRate,
    regularWagePerWorker,
    overtimeWagePerWorker,
    transportPerWorker: transRate,
    totalPerWorker,
    totalRegularWage,
    totalOvertimeWage,
    totalTransport,
    totalGross,
    penalties: penaltyAmount,
    netTotal
  };
}

/**
 * 5. حساب مستخلصات أعمال المقاولين (الكمية × السعر - المسدد = المتبقي)
 */
export function calculateContractorEntry({ quantity = 0, unitPrice = 0, paidAmount = 0 }) {
  const qty = Math.max(0, Number(quantity) || 0);
  const price = Math.max(0, Number(unitPrice) || 0);
  const paid = Math.max(0, Number(paidAmount) || 0);

  const totalAmount = Math.round((qty * price) * 100) / 100;
  const remaining = Math.round((totalAmount - paid) * 100) / 100;

  return {
    quantity: qty,
    unitPrice: price,
    totalAmount,
    paidAmount: paid,
    remaining
  };
}
