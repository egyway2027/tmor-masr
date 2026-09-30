/**
 * شاشة كشف وتصفية الرواتب الشهرية (Payroll Module)
 * تدمج بيانات الحضور والسلف مع محرك الرواتب لاستخراج الصافي
 */

import { store } from '../data/store.js';
import { calculateEmployeePayroll, aggregateMonthlyPayroll } from '../core/payrollCalc.js';

/**
 * بناء وعرض كشف الرواتب الشهري وحساب المستحقات آلياً
 * @param {Function} refreshApp - دالة إعادة تصيير الواجهة
 * @param {string} [selectedMonth] - الشهر المختار للتصفية
 * @returns {string} كود HTML للشاشة
 */
export function renderPayrollView(refreshApp, selectedMonth = null) {
  const currentMonth = selectedMonth || new Date().toISOString().slice(0, 7);
  
  const employees = store.getAll('employees');
  const allAttendance = store.getAll('attendance');
  const allAdvances = store.getAll('advances');

  // تصفية بيانات الحضور للشهر المحدد
  const monthAttendance = allAttendance.filter(att => att.month === currentMonth);

  // احتساب استحقاقات واستقطاعات كل موظف مسجل
  const payrollRows = employees.map(emp => {
    // 1. جلب بيانات حضور الموظف للشهر (إن وجدت)
    const att = monthAttendance.find(a => a.empCode === emp.code) || {
      workDays: 30,
      absenceDays: 0,
      overtimeHours: 0,
      overtimeDays: 0,
      incentives: 0,
      penalties: 0
    };

    // 2. فحص السلف النشطة غير المسددة لحساب قسط الشهر
    const activeAdvance = allAdvances.find(adv => adv.empCode === emp.code && !adv.isSettled);
    const advanceDeduction = activeAdvance ? Math.min(activeAdvance.monthlyInstallment, activeAdvance.remainingBalance) : 0;

    // 3. تمرير المتغيرات إلى المحرك الحسابي الصرف
    const calc = calculateEmployeePayroll({
      baseSalary: emp.baseSalary,
      workDays: att.workDays,
      absenceDays: att.absenceDays,
      overtimeDays: att.overtimeDays,
      overtimeHours: att.overtimeHours,
      incentives: att.incentives,
      advanceDeduction: advanceDeduction,
      directPenalties: att.penalties
    });

    return {
      empCode: emp.code,
      empName: emp.name,
      jobTitle: emp.jobTitle,
      department: emp.department,
      paymentMethod: emp.paymentMethod,
      paymentAccount: emp.paymentAccount,
      advanceId: activeAdvance ? activeAdvance.id : null,
      ...calc
    };
  });

  // تجميع الإحصائيات الإجمالية للشهر
  const totals = aggregateMonthlyPayroll(payrollRows);

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة والتحكم في الشهر -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">كشف الرواتب ومسير الأجور</h2>
          <p class="text-sm text-slate-500 mt-1">تصفية آلية شاملة للأجور، الإضافي، أقساط السلف، والجزاءات</p>
        </div>
        
        <div class="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
          <label class="text-xs font-bold text-slate-600 mr-2">شهر التصفية:</label>
          <input 
            type="month" 
            id="payrollMonthSelector" 
            value="${currentMonth}" 
            class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-slate-700"
          />
        </div>
      </div>

      <!-- بطاقات المؤشرات الإجمالية للشهر -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs text-slate-500 block font-semibold">إجمالي الأساسي</span>
          <span class="text-xl font-black text-slate-800 font-mono mt-1 block">
            ${totals.totalBaseSalaries.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs text-slate-500 block font-semibold">إجمالي الإضافي والحوافز</span>
          <span class="text-xl font-black text-emerald-600 font-mono mt-1 block">
            ${(totals.totalOvertime + totals.totalIncentives).toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs text-slate-500 block font-semibold">إجمالي الاستقطاعات والسلف</span>
          <span class="text-xl font-black text-rose-600 font-mono mt-1 block">
            ${totals.totalDeductions.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-emerald-600 p-4 rounded-xl shadow-md text-white">
          <span class="text-xs text-emerald-100 block font-semibold">صافي الرواتب المستحقة</span>
          <span class="text-xl font-black font-mono mt-1 block">
            ${totals.totalNetPay.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
      </div>

      <!-- جدول تفصيلي لمسير الرواتب -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-sm">بيان مرتبات العاملين لشهر (${currentMonth})</h3>
          <button 
            id="printPayrollBtn" 
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>طباعة المسير</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">الكود</th>
                <th class="py-3 px-3">اسم المستفيد</th>
                <th class="py-3 px-3">الوظيفة</th>
                <th class="py-3 px-3">الأساسي</th>
                <th class="py-3 px-3">أجر اليوم</th>
                <th class="py-3 px-3">خصم غياب</th>
                <th class="py-3 px-3">إضافي</th>
                <th class="py-3 px-3">حوافز</th>
                <th class="py-3 px-3">إجمالي الأجر</th>
                <th class="py-3 px-3">قسط سلفة</th>
                <th class="py-3 px-3">جزاءات</th>
                <th class="py-3 px-3 text-emerald-800 bg-emerald-50">صافي المرتب</th>
                <th class="py-3 px-3">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${payrollRows.length === 0 ? `
                <tr>
                  <td colspan="13" class="text-center py-12 text-slate-400 font-medium">
                    لا يوجد موظفون مدرجون لتصفية رواتبهم.
                  </td>
                </tr>
              ` : payrollRows.map(row => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-3 font-mono font-bold text-slate-700">${row.empCode}</td>
                  <td class="py-3 px-3 font-bold text-slate-800">${row.empName}</td>
                  <td class="py-3 px-3 text-slate-500">${row.jobTitle}</td>
                  <td class="py-3 px-3 font-mono">${row.baseSalary.toLocaleString('ar-EG')}</td>
                  <td class="py-3 px-3 font-mono text-slate-500">${row.dayRate}</td>
                  <td class="py-3 px-3 font-mono ${row.absenceDeduction > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}">
                    ${row.absenceDeduction > 0 ? `-${row.absenceDeduction}` : '0'}
                  </td>
                  <td class="py-3 px-3 font-mono ${row.totalOvertimeAmount > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
                    ${row.totalOvertimeAmount > 0 ? `+${row.totalOvertimeAmount}` : '0'}
                  </td>
                  <td class="py-3 px-3 font-mono ${row.incentives > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
                    ${row.incentives > 0 ? `+${row.incentives}` : '0'}
                  </td>
                  <td class="py-3 px-3 font-mono font-semibold text-slate-700">${row.grossPay.toLocaleString('ar-EG')}</td>
                  <td class="py-3 px-3 font-mono ${row.advanceDeduction > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}">
                    ${row.advanceDeduction > 0 ? `-${row.advanceDeduction}` : '0'}
                  </td>
                  <td class="py-3 px-3 font-mono ${row.penaltiesDeduction > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}">
                    ${row.penaltiesDeduction > 0 ? `-${row.penaltiesDeduction}` : '0'}
                  </td>
                  <td class="py-3 px-3 font-mono font-black text-sm text-emerald-700 bg-emerald-50/60">
                    ${row.netPay.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-3 px-3 text-[11px] text-slate-600">
                    <span>${row.paymentMethod || 'نقدي'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // ربط أحداث تغيير الشهر والطباعة
  setTimeout(() => {
    // 1. تغيير شهر التصفية وإعادة العرض فوراً
    const selector = document.getElementById('payrollMonthSelector');
    if (selector) {
      selector.onchange = (e) => {
        const newMonth = e.target.value;
        const contentContainer = document.getElementById('content-root');
        contentContainer.innerHTML = renderPayrollView(refreshApp, newMonth);
      };
    }

    // 2. زر الطباعة
    const printBtn = document.getElementById('printPayrollBtn');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }
  }, 0);

  return html;
}
