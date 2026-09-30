/**
 * شاشة شؤون الموظفين (Employees Module)
 * مسؤولة عن إدارة بطاقات العاملين، عقودهم، ورواتبهم الأساسية
 */

import { store } from '../data/store.js';

// القوائم المرجعية للأقسام والوظائف بناءً على هيكل التشغيل
const DEPARTMENTS = [
  'مصنع التمور',
  'مصنع العجوة',
  'محطة فرز - البحثية',
  'إدارة - المزرعة',
  'الإدارة - القاهرة',
  'القطاع الزراعي'
];

const JOB_TITLES = [
  'مدير الشركة',
  'مدير مصنع',
  'مدير انتاج',
  'مشرف إنتاج',
  'اوبريتور',
  'محاسب',
  'سائق',
  'فني صيانة',
  'عامل تشغيل'
];

/**
 * بناء وعرض شاشة الموظفين وربط أحداث الإضافة والحذف
 * @param {Function} refreshApp - دالة لإعادة تصيير التطبيق بعد أي تعديل
 * @returns {string} كود HTML للشاشة
 */
export function renderEmployeesView(refreshApp) {
  const employees = store.getAll('employees');

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">بطاقات الموظفين</h2>
          <p class="text-sm text-slate-500 mt-1">تسجيل وتعديل بيانات العاملين الثابتين، العقود، وحسابات التحويل</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
            إجمالي المسجلين: ${employees.length} موظف
          </span>
        </div>
      </div>

      <!-- نموذج إضافة موظف جديد -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>إضافة موظف جديد</span>
        </h3>

        <form id="employeeForm" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- كود الموظف -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">كود الموظف *</label>
            <input 
              type="text" 
              id="empCode" 
              placeholder="مثال: E001" 
              required 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <!-- اسم الموظف -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">اسم الموظف بالكامل *</label>
            <input 
              type="text" 
              id="empName" 
              placeholder="الاسم الثلاثي أو الرباعي" 
              required 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <!-- الوظيفة -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">الوظيفة *</label>
            <select 
              id="empJob" 
              required 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value="" disabled selected>اختر الوظيفة...</option>
              ${JOB_TITLES.map(job => `<option value="${job}">${job}</option>`).join('')}
            </select>
          </div>

          <!-- الموقع / القسم -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">الموقع / القسم *</label>
            <select 
              id="empDept" 
              required 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value="" disabled selected>اختر القسم...</option>
              ${DEPARTMENTS.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
            </select>
          </div>

          <!-- الراتب الأساسي الشهري -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">الراتب الأساسي (ج.م) *</label>
            <input 
              type="number" 
              id="empSalary" 
              placeholder="0.00" 
              min="0" 
              step="any" 
              required 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <!-- نظام العمل والدورة -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">نظام الدورة</label>
            <select 
              id="empCycle" 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value="23 عمل / 7 إجازة">23 عمل / 7 إجازة</option>
              <option value="شامل شهري (30 يوم)">شامل شهري (30 يوم)</option>
              <option value="26 عمل / 4 إجازة">26 عمل / 4 إجازة</option>
            </select>
          </div>

          <!-- طريقة استلام الراتب -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">طريقة التحويل</label>
            <select 
              id="empPaymentMethod" 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value="انستا باي">انستا باي</option>
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="أورنج كاش">أورنج كاش</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="نقدي (خزينة)">نقدي (خزينة)</option>
            </select>
          </div>

          <!-- رقم المحفظة / الحساب للتحويل -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">رقم الهاتف / الحساب</label>
            <input 
              type="text" 
              id="empPaymentAccount" 
              placeholder="رقم المحفظة أو الحساب" 
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <!-- زر الإرسال والحفظ -->
          <div class="md:col-span-3 lg:col-span-4 flex justify-end pt-3">
            <button 
              type="submit" 
              class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>حفظ وتثبيت الموظف</span>
            </button>
          </div>
        </form>
      </div>

      <!-- جدول استعراض الموظفين -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-sm">سجل العاملين المعتمدين</h3>
          <span class="text-xs text-slate-400">التحديث فوري وتلقائي</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-sm">
            <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">الكود</th>
                <th class="py-3 px-4">اسم الموظف</th>
                <th class="py-3 px-4">الوظيفة</th>
                <th class="py-3 px-4">الموقع / القسم</th>
                <th class="py-3 px-4">الراتب الأساسي</th>
                <th class="py-3 px-4">نظام الدورة</th>
                <th class="py-3 px-4">بيانات التحويل</th>
                <th class="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${employees.length === 0 ? `
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-400 font-medium">
                    لا يوجد موظفون مسجلون حالياً. استخدم النموذج أعلاه لإضافة أول موظف.
                  </td>
                </tr>
              ` : employees.map(emp => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-4 font-mono font-bold text-emerald-700">${emp.code}</td>
                  <td class="py-3 px-4 font-bold text-slate-800">${emp.name}</td>
                  <td class="py-3 px-4 text-slate-600">${emp.jobTitle}</td>
                  <td class="py-3 px-4 text-slate-600">${emp.department}</td>
                  <td class="py-3 px-4 font-mono font-bold text-slate-700">
                    ${Number(emp.baseSalary).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td class="py-3 px-4 text-xs">
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      ${emp.cycleDays || '23 عمل / 7 إجازة'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-xs text-slate-600">
                    <span class="font-semibold text-slate-700">${emp.paymentMethod || 'نقدي'}:</span>
                    <span class="font-mono">${emp.paymentAccount || '-'}</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button 
                      data-id="${emp.id}" 
                      class="delete-emp-btn text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // ربط أحداث الإضافة والحذف بعد تحميل الـ DOM
  setTimeout(() => {
    // 1. معالجة نموذج الحفظ
    const form = document.getElementById('employeeForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();

        const code = document.getElementById('empCode').value.trim();
        const name = document.getElementById('empName').value.trim();
        const jobTitle = document.getElementById('empJob').value;
        const department = document.getElementById('empDept').value;
        const baseSalary = parseFloat(document.getElementById('empSalary').value) || 0;
        const cycleDays = document.getElementById('empCycle').value;
        const paymentMethod = document.getElementById('empPaymentMethod').value;
        const paymentAccount = document.getElementById('empPaymentAccount').value.trim();

        // حفظ السجل في طبقة التخزين الموحدة
        store.insert('employees', {
          code,
          name,
          jobTitle,
          department,
          baseSalary,
          cycleDays,
          paymentMethod,
          paymentAccount
        });

        // إعادة تحميل الواجهة لعرض البيانات الجديدة
        refreshApp();
      };
    }

    // 2. معالجة أزرار الحذف
    document.querySelectorAll('.delete-emp-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذه الخطوة.')) {
          store.delete('employees', id);
          refreshApp();
        }
      };
    });
  }, 0);

  return html;
}
