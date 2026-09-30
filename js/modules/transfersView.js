/**
 * شاشة كشوف التحويلات والمسيرات البنكية والمحافظ (Transfers Module)
 * مسؤولة عن تصنيف مبالغ الدفع حسب وسيلة التحويل وتجهيز الكشوف للمراجعة
 */

import { store } from '../data/store.js';
import { calculateEmployeePayroll } from '../core/payrollCalc.js';

/**
 * بناء وعرض شاشة التحويلات
 * @param {Function} refreshApp - دالة إعادة تصيير الواجهة
 * @param {string} [selectedMonth] - الشهر المستهدف
 * @returns {string} كود HTML للشاشة
 */
export function renderTransfersView(refreshApp, selectedMonth = null) {
  const currentMonth = selectedMonth || new Date().toISOString().slice(0, 7);

  const employees = store.getAll('employees');
  const attendance = store.getAll('attendance').filter(a => a.month === currentMonth);
  const advances = store.getAll('advances');
  const manualTransfers = store.getAll('manual_transfers').filter(t => t.month === currentMonth);

  // تجميع تحويلات مرتبات الموظفين آلياً
  const payrollTransfers = employees.map(emp => {
    const att = attendance.find(a => a.empCode === emp.code) || {
      workDays: 30,
      absenceDays: 0,
      overtimeHours: 0,
      overtimeDays: 0,
      incentives: 0,
      penalties: 0
    };

    const activeAdvance = advances.find(adv => adv.empCode === emp.code && !adv.isSettled);
    const advanceDeduction = activeAdvance ? Math.min(activeAdvance.monthlyInstallment, activeAdvance.remainingBalance) : 0;

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
      id: `emp_${emp.id}`,
      type: 'راتب موظف',
      recipient: emp.name,
      code: emp.code,
      channel: emp.paymentMethod || 'نقدي (خزينة)',
      account: emp.paymentAccount || '-',
      amount: calc.netPay,
      status: 'معتمد للمسير'
    };
  });

  // دمج التحويلات اليدوية (مقاولين، موردين، دفعات خاصة)
  const formattedManualTransfers = manualTransfers.map(item => ({
    id: item.id,
    type: item.type || 'تحويل مقاول / خارجي',
    recipient: item.recipient,
    code: 'خارجي',
    channel: item.channel,
    account: item.account,
    amount: Number(item.amount) || 0,
    status: item.status || 'معتمد'
  }));

  const allTransfers = [...payrollTransfers, ...formattedManualTransfers];

  // تجميع الإجماليات حسب وسيلة التحويل
  const totalsByChannel = allTransfers.reduce((acc, row) => {
    acc[row.channel] = (acc[row.channel] || 0) + row.amount;
    acc.totalAll += row.amount;
    return acc;
  }, { totalAll: 0 });

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة والتحكم بالشهر -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">كشوف ومسيرات التحويلات</h2>
          <p class="text-sm text-slate-500 mt-1">تجميع استحقاقات المرتبات ومستخلصات المقاولين وتصنيفها حسب جهة الصرف</p>
        </div>

        <div class="flex items-center gap-3">
          <input 
            type="month" 
            id="transferMonthSelector" 
            value="${currentMonth}" 
            class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none font-semibold text-slate-700 bg-white shadow-sm"
          />
          <button 
            id="printTransferSheetBtn" 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>طباعة المسير البنكي</span>
          </button>
        </div>
      </div>

      <!-- بطاقات الإجماليات حسب وسيلة التحويل -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="bg-emerald-600 text-white p-3.5 rounded-xl shadow-sm">
          <span class="text-[11px] block font-semibold text-emerald-100">إجمالي المطلوب سداده</span>
          <span class="text-lg font-black font-mono mt-1 block">
            ${totalsByChannel.totalAll.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-[11px] block font-semibold text-slate-500">انستا باي (InstaPay)</span>
          <span class="text-lg font-bold font-mono text-purple-700 mt-1 block">
            ${(totalsByChannel['انستا باي'] || 0).toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-[11px] block font-semibold text-slate-500">فودافون كاش</span>
          <span class="text-lg font-bold font-mono text-rose-600 mt-1 block">
            ${(totalsByChannel['فودافون كاش'] || 0).toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-[11px] block font-semibold text-slate-500">تحويلات بنكية</span>
          <span class="text-lg font-bold font-mono text-blue-700 mt-1 block">
            ${(totalsByChannel['تحويل بنكي'] || 0).toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-[11px] block font-semibold text-slate-500">صرف خزينة (كاش)</span>
          <span class="text-lg font-bold font-mono text-slate-700 mt-1 block">
            ${(totalsByChannel['نقدي (خزينة)'] || 0).toLocaleString('ar-EG')} ج.م
          </span>
        </div>
      </div>

      <!-- نموذج تسجيل تحويل خارجي إضافي -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-slate-700"></span>
          <span>إضافة أمر تحويل خارجي / مقاول لشهر (${currentMonth})</span>
        </h3>

        <form id="manualTransferForm" class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <input type="text" id="trRecipient" placeholder="اسم المستفيد بالكامل *" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <select id="trChannel" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white">
              <option value="انستا باي">انستا باي</option>
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="أورنج كاش">أورنج كاش</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="نقدي (خزينة)">نقدي (خزينة)</option>
            </select>
          </div>
          <div>
            <input type="text" id="trAccount" placeholder="رقم الهاتف / الحساب المحول إليه *" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <input type="number" id="trAmount" placeholder="قيمة التحويل (ج.م) *" min="1" step="any" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <button type="submit" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition">
              حفظ أمر التحويل
            </button>
          </div>
        </form>
      </div>

      <!-- جدول تفصيلي للمسير -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-sm">بيان الحوالات والمدفوعات المطلوبة</h3>
          <span class="text-xs text-slate-400">إجمالي الحوالات: ${allTransfers.length}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">م</th>
                <th class="py-3 px-4">اسم المستفيد</th>
                <th class="py-3 px-4">البيان</th>
                <th class="py-3 px-4">جهة التحويل</th>
                <th class="py-3 px-4">رقم الهاتف / الحساب</th>
                <th class="py-3 px-4">قيمة التحويل</th>
                <th class="py-3 px-4">الحالة</th>
                <th class="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${allTransfers.length === 0 ? `
                <tr><td colspan="8" class="text-center py-10 text-slate-400">لا توجد تحويلات مستحقة لهذا الشهر.</td></tr>
              ` : allTransfers.map((item, index) => `
                <tr class="hover:bg-slate-50">
                  <td class="py-2.5 px-4 font-mono text-slate-500">${index + 1}</td>
                  <td class="py-2.5 px-4 font-bold text-slate-800">${item.recipient}</td>
                  <td class="py-2.5 px-4 text-slate-500">${item.type}</td>
                  <td class="py-2.5 px-4">
                    <span class="px-2 py-0.5 rounded font-semibold text-[11px] ${
                      item.channel === 'فودافون كاش' ? 'bg-rose-50 text-rose-700' :
                      item.channel === 'انستا باي' ? 'bg-purple-50 text-purple-700' :
                      item.channel === 'تحويل بنكي' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }">
                      ${item.channel}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 font-mono font-bold text-slate-700">${item.account}</td>
                  <td class="py-2.5 px-4 font-mono font-black text-emerald-700 text-sm">
                    ${item.amount.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-2.5 px-4 text-slate-600">${item.status}</td>
                  <td class="py-2.5 px-4 text-center">
                    ${item.id.toString().startsWith('emp_') ? `
                      <span class="text-slate-400 text-[10px]">مسير آلي</span>
                    ` : `
                      <button data-id="${item.id}" class="del-transfer-btn text-rose-600 hover:underline">حذف</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // ربط الأحداث
  setTimeout(() => {
    // 1. تغيير الشهر
    const selector = document.getElementById('transferMonthSelector');
    if (selector) {
      selector.onchange = (e) => {
        const newMonth = e.target.value;
        const contentContainer = document.getElementById('content-root');
        contentContainer.innerHTML = renderTransfersView(refreshApp, newMonth);
      };
    }

    // 2. طباعة الكشف
    const printBtn = document.getElementById('printTransferSheetBtn');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    // 3. إضافة تحويل مخصص
    const form = document.getElementById('manualTransferForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();

        const recipient = document.getElementById('trRecipient').value.trim();
        const channel = document.getElementById('trChannel').value;
        const account = document.getElementById('trAccount').value.trim();
        const amount = parseFloat(document.getElementById('trAmount').value) || 0;

        store.insert('manual_transfers', {
          month: currentMonth,
          recipient,
          channel,
          account,
          amount,
          type: 'تحويل مخصص / مقاول',
          status: 'معتمد'
        });

        refreshApp();
      };
    }

    // 4. حذف تحويل مخصص
    document.querySelectorAll('.del-transfer-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('هل ترغب في حذف هذا التحويل؟')) {
          store.delete('manual_transfers', id);
          refreshApp();
        }
      };
    });
  }, 0);

  return html;
}
