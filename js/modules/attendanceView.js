/**
 * شاشة الحضور والعناصر المتغيرة الشهرية (Monthly Attendance Module)
 * مسؤولة عن إدخال أيام العمل، الغياب، الساعات الإضافية، الحوافز، والجزاءات
 */

import { store } from '../data/store.js';

/**
 * بناء وعرض شاشة الحضور والانصراف والمتغيرات
 * @param {Function} refreshApp - دالة إعادة تصيير الواجهة
 * @returns {string} كود HTML للشاشة
 */
export function renderAttendanceView(refreshApp) {
  const employees = store.getAll('employees');
  const attendanceRecords = store.getAll('attendance');

  // تحديد الشهر الافتراضي (الشهر الحالي بصيغة YYYY-MM)
  const currentMonthDefault = new Date().toISOString().slice(0, 7);

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">الحضور والمتغيرات الشهرية</h2>
          <p class="text-sm text-slate-500 mt-1">تسجيل أيام العمل الفعلية، الغياب، الإضافي، الحوافز، والجزاءات لكل موظف</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
            إجمالي السجلات المدخلة: ${attendanceRecords.length}
          </span>
        </div>
      </div>

      <!-- نموذج تسجيل المتغيرات الشهرية لموظف -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-blue-500"></span>
          <span>تسجيل بيان شهري لموظف</span>
        </h3>

        ${employees.length === 0 ? `
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">
            تنبيه: يجب تسجيل موظفين أولاً من شاشة "شؤون الموظفين" قبل إدخال بيانات الحضور.
          </div>
        ` : `
          <form id="attendanceForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- شهر الاستحقاق -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">شهر الاستحقاق *</label>
              <input 
                type="month" 
                id="attMonth" 
                value="${currentMonthDefault}" 
                required 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>

            <!-- اختيار الموظف -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">الموظف *</label>
              <select 
                id="attEmpCode" 
                required 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="" disabled selected>اختر الموظف...</option>
                ${employees.map(emp => `
                  <option value="${emp.code}" data-name="${emp.name}" data-salary="${emp.baseSalary}">
                    ${emp.name} (${emp.code}) - راتب: ${emp.baseSalary} ج.م
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- أيام العمل الفعلية -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">أيام العمل الفعلية *</label>
              <input 
                type="number" 
                id="attWorkDays" 
                value="30" 
                min="0" 
                max="31" 
                required 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- أيام الغياب بدون أجر -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">أيام الغياب بدون أجر</label>
              <input 
                type="number" 
                id="attAbsenceDays" 
                value="0" 
                min="0" 
                max="31" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- ساعات العمل الإضافي -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">ساعات الإضافي</label>
              <input 
                type="number" 
                id="attOvertimeHours" 
                value="0" 
                min="0" 
                step="any" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- الأيام الإضافية -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">الأيام الإضافية</label>
              <input 
                type="number" 
                id="attOvertimeDays" 
                value="0" 
                min="0" 
                step="any" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- الحوافز والمكافآت -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">حوافز ومكافآت (ج.م)</label>
              <input 
                type="number" 
                id="attIncentives" 
                value="0" 
                min="0" 
                step="any" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- الجزاءات المباشرة -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">خصومات وجزاءات (ج.م)</label>
              <input 
                type="number" 
                id="attPenalties" 
                value="0" 
                min="0" 
                step="any" 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- ملاحظات -->
            <div class="lg:col-span-3">
              <label class="block text-xs font-semibold text-slate-600 mb-1">ملاحظات تشغيلية</label>
              <input 
                type="text" 
                id="attNotes" 
                placeholder="أي ملاحظات تخص الغياب أو الإضافي..." 
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- زر الحفظ -->
            <div class="flex items-end justify-end">
              <button 
                type="submit" 
                class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>حفظ البيان الشهري</span>
              </button>
            </div>
          </form>
        `}
      </div>

      <!-- جدول استعراض سجلات الحضور والمتغيرات -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-sm">سجل المتغيرات الشهرية المسجلة</h3>
          <span class="text-xs text-slate-400">تستخدم تلقائياً عند استخراج المرتبات</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-sm">
            <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">الشهر</th>
                <th class="py-3 px-4">الكود</th>
                <th class="py-3 px-4">اسم الموظف</th>
                <th class="py-3 px-4">أيام العمل</th>
                <th class="py-3 px-4">أيام الغياب</th>
                <th class="py-3 px-4">إضافي (ساعات/أيام)</th>
                <th class="py-3 px-4">حوافز</th>
                <th class="py-3 px-4">جزاءات</th>
                <th class="py-3 px-4">ملاحظات</th>
                <th class="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${attendanceRecords.length === 0 ? `
                <tr>
                  <td colspan="10" class="text-center py-12 text-slate-400 font-medium">
                    لا توجد سجلات حضور مسجلة حتى الآن.
                  </td>
                </tr>
              ` : attendanceRecords.map(item => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-4 font-mono font-bold text-slate-600">${item.month}</td>
                  <td class="py-3 px-4 font-mono font-bold text-blue-700">${item.empCode}</td>
                  <td class="py-3 px-4 font-bold text-slate-800">${item.empName}</td>
                  <td class="py-3 px-4 font-mono text-slate-700 font-semibold">${item.workDays} يوم</td>
                  <td class="py-3 px-4 font-mono ${item.absenceDays > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}">
                    ${item.absenceDays} يوم
                  </td>
                  <td class="py-3 px-4 text-xs font-mono text-emerald-700 font-semibold">
                    ${item.overtimeHours > 0 ? `${item.overtimeHours} س` : ''} 
                    ${item.overtimeDays > 0 ? `${item.overtimeDays} ي` : ''}
                    ${item.overtimeHours === 0 && item.overtimeDays === 0 ? '-' : ''}
                  </td>
                  <td class="py-3 px-4 font-mono text-emerald-600 font-bold">
                    ${item.incentives > 0 ? `${item.incentives} ج.م` : '-'}
                  </td>
                  <td class="py-3 px-4 font-mono text-rose-600 font-bold">
                    ${item.penalties > 0 ? `${item.penalties} ج.م` : '-'}
                  </td>
                  <td class="py-3 px-4 text-xs text-slate-500">${item.notes || '-'}</td>
                  <td class="py-3 px-4 text-center">
                    <button 
                      data-id="${item.id}" 
                      class="delete-att-btn text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline"
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

  // ربط أحداث الإضافة والحذف
  setTimeout(() => {
    const form = document.getElementById('attendanceForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();

        const month = document.getElementById('attMonth').value;
        const empSelect = document.getElementById('attEmpCode');
        const empCode = empSelect.value;
        const empName = empSelect.options[empSelect.selectedIndex].getAttribute('data-name');
        const baseSalary = parseFloat(empSelect.options[empSelect.selectedIndex].getAttribute('data-salary')) || 0;

        const workDays = parseFloat(document.getElementById('attWorkDays').value) || 0;
        const absenceDays = parseFloat(document.getElementById('attAbsenceDays').value) || 0;
        const overtimeHours = parseFloat(document.getElementById('attOvertimeHours').value) || 0;
        const overtimeDays = parseFloat(document.getElementById('attOvertimeDays').value) || 0;
        const incentives = parseFloat(document.getElementById('attIncentives').value) || 0;
        const penalties = parseFloat(document.getElementById('attPenalties').value) || 0;
        const notes = document.getElementById('attNotes').value.trim();

        // فحص ما إذا كان هناك تسجيل سابق للموظف لنفس الشهر لمنع التكرار
        const existing = attendanceRecords.find(r => r.empCode === empCode && r.month === month);
        if (existing) {
          if (!confirm(`الموظف ${empName} مسجل له بيان بالفعل لشهر ${month}. هل ترغب في تحديث البيان القديم؟`)) {
            return;
          }
          store.update('attendance', existing.id, {
            workDays,
            absenceDays,
            overtimeHours,
            overtimeDays,
            incentives,
            penalties,
            notes,
            baseSalary
          });
        } else {
          store.insert('attendance', {
            month,
            empCode,
            empName,
            baseSalary,
            workDays,
            absenceDays,
            overtimeHours,
            overtimeDays,
            incentives,
            penalties,
            notes
          });
        }

        refreshApp();
      };
    }

    // حذف بيان حضور
    document.querySelectorAll('.delete-att-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('هل أنت متأكد من حذف هذا السجل الشهري؟')) {
          store.delete('attendance', id);
          refreshApp();
        }
      };
    });
  }, 0);

  return html;
}
