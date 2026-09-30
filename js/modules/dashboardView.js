/**
 * شاشة لوحة المعلومات والتحليلات (Dashboard Module)
 * مسؤولة عن عرض ملخص الأداء المالي، كتلة الأجور، والمؤشرات التشغيلية
 */

import { store } from '../data/store.js';
import { calculateEmployeePayroll, aggregateMonthlyPayroll } from '../core/payrollCalc.js';

/**
 * بناء وعرض لوحة التحكم الرئيسية
 * @param {Function} refreshApp - دالة إعادة تصيير الواجهة
 * @param {Function} onNavigate - دالة التنقل بين الشاشات
 * @returns {string} كود HTML للوحة التحكم
 */
export function renderDashboardView(refreshApp, onNavigate) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const employees = store.getAll('employees');
  const attendance = store.getAll('attendance').filter(a => a.month === currentMonth);
  const advances = store.getAll('advances');
  const laborRecords = store.getAll('factory_labor');
  const contractors = store.getAll('contractors');

  // احتساب كتلة الأجور للشهر الجاري
  const currentMonthPayroll = employees.map(emp => {
    const att = attendance.find(a => a.empCode === emp.code) || {
      workDays: 30,
      absenceDays: 0,
      overtimeHours: 0,
      overtimeDays: 0,
      incentives: 0,
      penalties: 0
    };

    const activeAdv = advances.find(adv => adv.empCode === emp.code && !adv.isSettled);
    const advDeduction = activeAdv ? Math.min(activeAdv.monthlyInstallment, activeAdv.remainingBalance) : 0;

    return calculateEmployeePayroll({
      baseSalary: emp.baseSalary,
      workDays: att.workDays,
      absenceDays: att.absenceDays,
      overtimeDays: att.overtimeDays,
      overtimeHours: att.overtimeHours,
      incentives: att.incentives,
      advanceDeduction: advDeduction,
      directPenalties: att.penalties
    });
  });

  const payrollTotals = aggregateMonthlyPayroll(currentMonthPayroll);

  // إجمالي السلف المتبقية
  const totalRemainingAdvances = advances.reduce((sum, adv) => sum + (adv.remainingBalance || 0), 0);

  // إجمالي تكلفة عمالة المصنع
  const totalLaborCost = laborRecords.reduce((sum, lab) => sum + (lab.netTotal || 0), 0);

  // مستحقات المقاولين المتبقية
  const totalContractorsDebt = contractors.reduce((sum, c) => sum + (c.remaining || 0), 0);

  // توزيع الموظفين حسب الأقسام
  const deptCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || 'غير محدد';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      
      <!-- ترويسة اللوحة -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">لوحة المؤشرات والرقابة المالية</h2>
          <p class="text-sm text-slate-500 mt-1">نظرة عامة على الرواتب، السلف، عمالة المصنع لشهر (${currentMonth})</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            النظام جاهز ومحدث
          </span>
        </div>
      </div>

      <!-- شبكة المؤشرات المالية الرئيسية -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- بطاقة كتلة الرواتب -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">كتلة الأجور الصافية</span>
            <div class="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-black font-mono text-slate-900">${payrollTotals.totalNetPay.toLocaleString('ar-EG')} ج.م</h3>
            <p class="text-xs text-slate-400 mt-1">لعدد ${employees.length} موظف مسجل</p>
          </div>
        </div>

        <!-- بطاقة أرصدة السلف المتبقية -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">السلف المتبقية للتحصيل</span>
            <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-black font-mono text-amber-600">${totalRemainingAdvances.toLocaleString('ar-EG')} ج.م</h3>
            <p class="text-xs text-slate-400 mt-1">تستقطع تلقائياً على دفعات شهرية</p>
          </div>
        </div>

        <!-- بطاقة يوميات عمالة المصنع -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">تكلفة عمالة المصنع</span>
            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-black font-mono text-indigo-700">${totalLaborCost.toLocaleString('ar-EG')} ج.م</h3>
            <p class="text-xs text-slate-400 mt-1">إجمالي ورديات المصنع المسجلة</p>
          </div>
        </div>

        <!-- بطاقة متبقي المقاولين -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">مستحقات المقاولين</span>
            <div class="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-black font-mono text-rose-600">${totalContractorsDebt.toLocaleString('ar-EG')} ج.م</h3>
            <p class="text-xs text-slate-400 mt-1">رصيد متبقي تحت السداد</p>
          </div>
        </div>

      </div>

      <!-- توزيع العمالة والوصول السريع -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- توزيع الموظفين حسب الأقسام -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>توزيع القوى العاملة حسب المواقع والأقسام</span>
            <span class="text-xs font-normal text-slate-400">إجمالي: ${employees.length} موظف</span>
          </h3>

          ${Object.keys(deptCounts).length === 0 ? `
            <div class="text-center py-10 text-slate-400 text-sm">لا توجد بيانات موظفين مسجلة حتى الآن.</div>
          ` : `
            <div class="space-y-3">
              ${Object.entries(deptCounts).map(([dept, count]) => {
                const percentage = Math.round((count / employees.length) * 100);
                return `
                  <div>
                    <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>${dept}</span>
                      <span>${count} موظف (${percentage}%)</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div class="bg-emerald-500 h-2.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- أزرار الاختصارات السريعة للتنقل -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 class="text-base font-bold text-slate-800 mb-4">اختصارات التشغيل السريع</h3>
          
          <div class="space-y-2.5">
            <button data-goto="employees" class="quick-nav-btn w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-bold transition">
              <span>إدارة وتسجيل الموظفين</span>
              <span class="text-emerald-600 font-mono">←</span>
            </button>
            <button data-goto="attendance" class="quick-nav-btn w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 text-xs font-bold transition">
              <span>إدخال الحضور والغياب والإضافي</span>
              <span class="text-blue-600 font-mono">←</span>
            </button>
            <button data-goto="payroll" class="quick-nav-btn w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-bold transition">
              <span>تصفية واستخراج كشف الرواتب</span>
              <span class="text-emerald-600 font-mono">←</span>
            </button>
            <button data-goto="factory-labor" class="quick-nav-btn w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-slate-700 text-xs font-bold transition">
              <span>تسجيل يوميات عمالة المصنع</span>
              <span class="text-indigo-600 font-mono">←</span>
            </button>
            <button data-goto="transfers" class="quick-nav-btn w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-slate-700 text-xs font-bold transition">
              <span>مسير التحويلات البنكية والمحافظ</span>
              <span class="text-purple-600 font-mono">←</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `;

  // ربط أزرار التنقل السريع
  setTimeout(() => {
    document.querySelectorAll('.quick-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-goto');
        if (typeof onNavigate === 'function') {
          onNavigate(target);
        }
      };
    });
  }, 0);

  return html;
}
