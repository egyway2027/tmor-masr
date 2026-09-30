/**
 * شاشة إدارة السلف والقروض (Advances Module)
 * تعتمد على محرك advancesCalc للحسابات وعلى store للتخزين
 */

import { store } from '../data/store.js';
import { calculateAdvance } from '../core/advancesCalc.js';

/**
 * بناء وعرض شاشة السلف وربط عمليات الجدولة والسداد
 * @param {Function} refreshApp - دالة إعادة تصيير التطبيق
 * @returns {string} كود HTML للشاشة
 */
export function renderAdvancesView(refreshApp) {
  const employees = store.getAll('employees');
  const advances = store.getAll('advances');

  // حساب إجمالي المبالغ والمتبقي لكافة السلف كإحصائيات سريعة
  const totalAdvancesSum = advances.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const totalRemainingSum = advances.reduce((sum, item) => sum + (item.remainingBalance || 0), 0);

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة والإحصائيات -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">إدارة السلف والقروض</h2>
          <p class="text-sm text-slate-500 mt-1">منح السلف، احتساب الأقساط تلقائياً، ومتابعة الأرصدة المتبقية</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
            إجمالي المنصرف: ${totalAdvancesSum.toLocaleString('ar-EG')} ج.م
          </div>
          <div class="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
            المتبقي للتحصيل: ${totalRemainingSum.toLocaleString('ar-EG')} ج.م
          </div>
        </div>
      </div>

      <!-- نموذج منح سلفة جديدة -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-amber-500"></span>
          <span>منح سلفة أو قرض جديد</span>
        </h3>

        ${employees.length === 0 ? `
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">
            تنبيه: يجب إضافة موظف واحد على الأقل من شاشة "شؤون الموظفين" قبل البدء في تسجيل السلف.
          </div>
        ` : `
          <form id="advanceForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- اختيار الموظف -->
            <div class="lg:col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1">الموظف المستفيد *</label>
              <select 
                id="advEmpCode" 
                required 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="" disabled selected>اختر الموظف...</option>
                ${employees.map(emp => `
                  <option value="${emp.code}" data-name="${emp.name}">${emp.name} (${emp.code}) - ${emp.jobTitle}</option>
                `).join('')}
              </select>
            </div>

            <!-- نوع المعاملة -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">النوع *</label>
              <select 
                id="advType" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="سلفة شهرية">سلفة شهرية</option>
                <option value="قرض حسن">قرض حسن</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <!-- المبلغ الإجمالي -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">المبلغ الإجمالي (ج.م) *</label>
              <input 
                type="number" 
                id="advAmount" 
                placeholder="مثال: 6000" 
                min="1" 
                step="any" 
                required 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <!-- عدد الأقساط -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">عدد الأقساط *</label>
              <input 
                type="number" 
                id="advInstallments" 
                value="1" 
                min="1" 
                max="60" 
                required 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <!-- تاريخ المنح -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">تاريخ المنح</label>
              <input 
                type="date" 
                id="advDate" 
                value="${new Date().toISOString().split('T')[0]}" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>

            <!-- زر الحفظ والجدولة -->
            <div class="lg:col-span-4 flex items-end justify-end">
              <button 
                type="submit" 
                class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>اعتماد السلفة وجدولة الأقساط</span>
              </button>
            </div>
          </form>
        `}
      </div>

      <!-- جدول متابعة السلف -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-sm">سجل السلف والقروض المفتوحة والمغلقة</h3>
          <span class="text-xs text-slate-400">إجمالي المعاملات: ${advances.length}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-sm">
            <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">كود الموظف</th>
                <th class="py-3 px-4">اسم الموظف</th>
                <th class="py-3 px-4">النوع</th>
                <th class="py-3 px-4">المبلغ الإجمالي</th>
                <th class="py-3 px-4">القسط الشهري</th>
                <th class="py-3 px-4">المسدد / الأقساط</th>
                <th class="py-3 px-4">المتبقي</th>
                <th class="py-3 px-4">الحالة</th>
                <th class="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${advances.length === 0 ? `
                <tr>
                  <td colspan="9" class="text-center py-12 text-slate-400 font-medium">
                    لا توجد سلف أو قروض مسجلة حتى الآن.
                  </td>
                </tr>
              ` : advances.map(adv => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-4 font-mono font-bold text-emerald-700">${adv.empCode}</td>
                  <td class="py-3 px-4 font-bold text-slate-800">${adv.empName}</td>
                  <td class="py-3 px-4 text-slate-600 text-xs">${adv.type}</td>
                  <td class="py-3 px-4 font-mono font-bold text-slate-700">
                    ${Number(adv.totalAmount).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-3 px-4 font-mono font-bold text-amber-700">
                    ${Number(adv.monthlyInstallment).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-3 px-4 text-xs font-mono">
                    <span class="text-emerald-700 font-bold">${adv.paidInstallments}</span> من ${adv.installmentsCount}
                  </td>
                  <td class="py-3 px-4 font-mono font-bold ${adv.remainingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}">
                    ${Number(adv.remainingBalance).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-3 px-4 text-xs">
                    <span class="px-2 py-0.5 rounded font-bold ${
                      adv.isSettled 
                        ? 'bg-slate-100 text-slate-600' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }">
                      ${adv.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      ${!adv.isSettled ? `
                        <button 
                          data-id="${adv.id}" 
                          class="pay-installment-btn text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold px-2 py-1 rounded transition"
                          title="تسجيل استقطاع قسط واحد"
                        >
                          سداد قسط
                        </button>
                      ` : ''}
                      <button 
                        data-id="${adv.id}" 
                        class="delete-adv-btn text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // ربط أحداث الإضافة، سداد القسط، والحذف
  setTimeout(() => {
    // 1. تسجيل سلفة جديدة
    const form = document.getElementById('advanceForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();

        const empSelect = document.getElementById('advEmpCode');
        const empCode = empSelect.value;
        const empName = empSelect.options[empSelect.selectedIndex].getAttribute('data-name');
        const type = document.getElementById('advType').value;
        const totalAmount = parseFloat(document.getElementById('advAmount').value) || 0;
        const installmentsCount = parseInt(document.getElementById('advInstallments').value, 10) || 1;
        const grantDate = document.getElementById('advDate').value;

        // استدعاء محرك الحسابات الصرفة لحساب القسط والمتبقي والحالة
        const calcData = calculateAdvance({
          totalAmount,
          installmentsCount,
          paidInstallments: 0
        });

        // حفظ السجل كاملاً
        store.insert('advances', {
          empCode,
          empName,
          type,
          grantDate,
          ...calcData
        });

        refreshApp();
      };
    }

    // 2. تسجيل سداد قسط يدوي
    document.querySelectorAll('.pay-installment-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const currentAdv = store.getById('advances', id);
        if (!currentAdv) return;

        const newPaidCount = currentAdv.paidInstallments + 1;
        
        // إعادة الحساب عبر المحرك الصرف
        const updatedCalc = calculateAdvance({
          totalAmount: currentAdv.totalAmount,
          installmentsCount: currentAdv.installmentsCount,
          paidInstallments: newPaidCount
        });

        // تحديث السجل في قاعدة البيانات
        store.update('advances', id, updatedCalc);
        refreshApp();
      };
    });

    // 3. حذف سلفة
    document.querySelectorAll('.delete-adv-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('هل أنت متأكد من حذف هذه السلفة؟')) {
          store.delete('advances', id);
          refreshApp();
        }
      };
    });
  }, 0);

  return html;
}
