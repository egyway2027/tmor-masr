/**
 * شاشة عمالة المصنع ومقاولي الإنتاج (Factory Labor & Contractors Module)
 * مسؤولة عن يوميات العمالة المؤقتة ومستخلصات مقاولي العمليات
 */

import { store } from '../data/store.js';

/**
 * بناء وعرض شاشة عمالة المصنع والمقاولين
 * @param {Function} refreshApp - دالة إعادة تصيير الواجهة
 * @returns {string} كود HTML للشاشة
 */
export function renderFactoryLaborView(refreshApp) {
  const laborRecords = store.getAll('factory_labor');
  const contractorRecords = store.getAll('contractors');

  // إحصائيات سريعة
  const totalLaborCost = laborRecords.reduce((sum, r) => sum + (r.netTotal || 0), 0);
  const totalContractorRemaining = contractorRecords.reduce((sum, c) => sum + (c.remaining || 0), 0);

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      
      <!-- ترويسة الصفحة -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">عمالة المصنع والمقاولين</h2>
          <p class="text-sm text-slate-500 mt-1">متابعة يوميات ورديات المصنع، مصاريف النقل، ومستخلصات أعمال المقاولين</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-3.5 py-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold">
            تكلفة اليوميات: ${totalLaborCost.toLocaleString('ar-EG')} ج.م
          </div>
          <div class="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
            متبقي المقاولين: ${totalContractorRemaining.toLocaleString('ar-EG')} ج.م
          </div>
        </div>
      </div>

      <!-- القسم الأول: تسجيل يومية عمالة المصنع -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
          <span>تسجيل وردية عمالة مصنع (رجال / سيدات)</span>
        </h3>

        <form id="laborForm" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">التاريخ *</label>
            <input type="date" id="labDate" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">فئة العمالة *</label>
            <select id="labCategory" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white">
              <option value="عمالة رجال بالمصنع">عمالة رجال بالمصنع</option>
              <option value="عمالة سيدات بالمصنع">عمالة سيدات بالمصنع</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">العدد (نهاري) *</label>
            <input type="number" id="labDayCount" value="0" min="0" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">يومية الفرد (نهاري) *</label>
            <input type="number" id="labDayRate" value="600" min="0" step="any" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">العدد (ليلي / إضافي)</label>
            <input type="number" id="labNightCount" value="0" min="0" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">قيمة الإضافي / الليلي للفرد</label>
            <input type="number" id="labNightRate" value="300" min="0" step="any" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">مصاريف النقل والسيارات</label>
            <input type="number" id="labTransport" value="0" min="0" step="any" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">خصومات وجزاءات</label>
            <input type="number" id="labPenalties" value="0" min="0" step="any" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div class="md:col-span-3 lg:col-span-4 flex justify-end">
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>حفظ كشف الوردية</span>
            </button>
          </div>
        </form>

        <!-- جدول يوميات المصنع -->
        <div class="overflow-x-auto border-t border-slate-100 pt-4">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">التاريخ</th>
                <th class="py-2.5 px-3">الفئة</th>
                <th class="py-2.5 px-3">النهاري (عدد × فئة)</th>
                <th class="py-2.5 px-3">الليلي (عدد × فئة)</th>
                <th class="py-2.5 px-3">النقل</th>
                <th class="py-2.5 px-3">الجزاءات</th>
                <th class="py-2.5 px-3">صافي المستحق</th>
                <th class="py-2.5 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${laborRecords.length === 0 ? `
                <tr><td colspan="8" class="text-center py-6 text-slate-400">لا توجد يوميات مسجلة.</td></tr>
              ` : laborRecords.map(r => `
                <tr class="hover:bg-slate-50">
                  <td class="py-2.5 px-3 font-mono font-bold text-slate-700">${r.date}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-800">${r.category}</td>
                  <td class="py-2.5 px-3 font-mono">${r.dayCount} × ${r.dayRate} =${r.dayTotal.toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-2.5 px-3 font-mono">${r.nightCount} × ${r.nightRate} =${r.nightTotal.toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-2.5 px-3 font-mono text-slate-600">${r.transport} ج.م</td>
                  <td class="py-2.5 px-3 font-mono text-rose-600">${r.penalties > 0 ? `-${r.penalties}` : '0'}</td>
                  <td class="py-2.5 px-3 font-mono font-black text-indigo-700">${r.netTotal.toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-2.5 px-3 text-center">
                    <button data-id="${r.id}" class="del-labor-btn text-rose-600 hover:underline">حذف</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- القسم الثاني: مستخلصات وحسابات مقاولي الإنتاج -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>مستخلصات وأعمال المقاولين (فصل، تكييس، جمع)</span>
        </h3>

        <form id="contractorForm" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 mb-1">اسم المقاول / المستفيد *</label>
            <input type="text" id="conName" placeholder="مثال: اسلام الازلي / ابو عاصم" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 mb-1">بيان الأعمال *</label>
            <input type="text" id="conDescription" placeholder="مثال: قيمة التكييس / فصل فسائل" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">الكمية المنفذة *</label>
            <input type="number" id="conQty" min="0" step="any" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">سعر الفئة (ج.م) *</label>
            <input type="number" id="conPrice" min="0" step="any" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 mb-1">التحويلات المسددة له (ج.م)</label>
            <input type="number" id="conPaid" value="0" min="0" step="any" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none" />
          </div>

          <div class="lg:col-span-4 flex items-end justify-end">
            <button type="submit" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition">
              تسجيل وحساب المستخلص
            </button>
          </div>
        </form>

        <!-- جدول مستخلصات المقاولين -->
        <div class="overflow-x-auto border-t border-slate-100 pt-4">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">المقاول</th>
                <th class="py-2.5 px-3">البيان</th>
                <th class="py-2.5 px-3">الكمية</th>
                <th class="py-2.5 px-3">السعر</th>
                <th class="py-2.5 px-3">إجمالي الأعمال</th>
                <th class="py-2.5 px-3">المسدد</th>
                <th class="py-2.5 px-3">الرصيد المتبقي</th>
                <th class="py-2.5 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${contractorRecords.length === 0 ? `
                <tr><td colspan="8" class="text-center py-6 text-slate-400">لا توجد مستخلصات مسجلة.</td></tr>
              ` : contractorRecords.map(c => `
                <tr class="hover:bg-slate-50">
                  <td class="py-2.5 px-3 font-bold text-slate-800">${c.name}</td>
                  <td class="py-2.5 px-3 text-slate-600">${c.description}</td>
                  <td class="py-2.5 px-3 font-mono">${c.qty}</td>
                  <td class="py-2.5 px-3 font-mono">${c.price} ج.م</td>
                  <td class="py-2.5 px-3 font-mono font-bold text-slate-800">${c.totalAmount.toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-2.5 px-3 font-mono text-emerald-600 font-bold">${c.paidAmount.toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-2.5 px-3 font-mono font-black ${c.remaining > 0 ? 'text-rose-600' : 'text-slate-400'}">
                    ${c.remaining.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <button data-id="${c.id}" class="del-contractor-btn text-rose-600 hover:underline">حذف</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // ربط أحداث الحفظ والحذف
  setTimeout(() => {
    // 1. تسجيل يومية عمالة المصنع
    const laborForm = document.getElementById('laborForm');
    if (laborForm) {
      laborForm.onsubmit = (e) => {
        e.preventDefault();

        const date = document.getElementById('labDate').value;
        const category = document.getElementById('labCategory').value;
        const dayCount = parseFloat(document.getElementById('labDayCount').value) || 0;
        const dayRate = parseFloat(document.getElementById('labDayRate').value) || 0;
        const nightCount = parseFloat(document.getElementById('labNightCount').value) || 0;
        const nightRate = parseFloat(document.getElementById('labNightRate').value) || 0;
        const transport = parseFloat(document.getElementById('labTransport').value) || 0;
        const penalties = parseFloat(document.getElementById('labPenalties').value) || 0;

        const dayTotal = Math.round(dayCount * dayRate * 100) / 100;
        const nightTotal = Math.round(nightCount * nightRate * 100) / 100;
        const netTotal = Math.round((dayTotal + nightTotal + transport - penalties) * 100) / 100;

        store.insert('factory_labor', {
          date,
          category,
          dayCount,
          dayRate,
          dayTotal,
          nightCount,
          nightRate,
          nightTotal,
          transport,
          penalties,
          netTotal
        });

        refreshApp();
      };
    }

    // 2. تسجيل مستخلص مقاول
    const conForm = document.getElementById('contractorForm');
    if (conForm) {
      conForm.onsubmit = (e) => {
        e.preventDefault();

        const name = document.getElementById('conName').value.trim();
        const description = document.getElementById('conDescription').value.trim();
        const qty = parseFloat(document.getElementById('conQty').value) || 0;
        const price = parseFloat(document.getElementById('conPrice').value) || 0;
        const paidAmount = parseFloat(document.getElementById('conPaid').value) || 0;

        const totalAmount = Math.round(qty * price * 100) / 100;
        const remaining = Math.round((totalAmount - paidAmount) * 100) / 100;

        store.insert('contractors', {
          name,
          description,
          qty,
          price,
          totalAmount,
          paidAmount,
          remaining
        });

        refreshApp();
      };
    }

    // 3. حذف يومية عمالة
    document.querySelectorAll('.del-labor-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('حذف هذا البيان؟')) {
          store.delete('factory_labor', id);
          refreshApp();
        }
      };
    });

    // 4. حذف مستخلص مقاول
    document.querySelectorAll('.del-contractor-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('حذف هذا المستخلص؟')) {
          store.delete('contractors', id);
          refreshApp();
        }
      };
    });
  }, 0);

  return html;
}
