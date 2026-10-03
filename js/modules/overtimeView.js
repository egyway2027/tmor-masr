/**
 * شاشة حساب وسجل العمل الإضافي لكل موظف (Overtime Tracking Module)
 * مسؤولة عن احتساب ساعات العمل الفعلي، استبعاد الـ 8 ساعات الأساسية، واحتساب الإضافي بالدقيقة
 */

import { store } from '../data/store.js';

export function renderOvertimeView(refreshApp, selectedEmpFilter = 'all') {
  const employees = store.getAll('employees');
  const allOvertimeRecords = store.getAll('employee_overtime');
  const todayStr = new Date().toISOString().split('T')[0];

  // تصفية السجلات حسب الموظف المختار لعرض سجل كل شخص بشكل مستقل
  const filteredRecords = selectedEmpFilter === 'all'
    ? allOvertimeRecords
    : allOvertimeRecords.filter(r => r.empCode === selectedEmpFilter);

  // احتساب الإجماليات للكروت العلوية
  const totalDays = filteredRecords.length;
  const totalWorkMinutes = filteredRecords.reduce((sum, r) => sum + (r.totalMinutes || 0), 0);
  const totalOvertimeMinutes = filteredRecords.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);

  const formatMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} س و ${m} د` : `${h} س`;
  };

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة وفلتر الموظف -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">سجل ومعدل العمل الإضافي</h2>
          <p class="text-sm text-slate-500 mt-1">حساب ساعات العمل اليومية واحتساب ما زاد عن 8 ساعات كأساسي كعمل إضافي</p>
        </div>

        <!-- فلتر استعراض سجل موظف معين -->
        <div class="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
          <label class="text-xs font-bold text-slate-600 mr-1">عرض سجل:</label>
          <select id="empFilterSelect" class="text-xs font-bold text-slate-700 border border-slate-300 rounded-lg p-1.5 outline-none bg-white">
            <option value="all" ${selectedEmpFilter === 'all' ? 'selected' : ''}>جميع الموظفين</option>
            ${employees.map(emp => `
              <option value="${emp.code}" ${selectedEmpFilter === emp.code ? 'selected' : ''}>
                ${emp.name} (${emp.code})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- كروت الإحصائيات العلوية -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- كارت إجمالي أيام الحضور -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 block uppercase">إجمالي أيام الحضور</span>
            <span class="text-2xl font-black font-mono text-slate-800 mt-1 block">${totalDays} يوم</span>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        </div>

        <!-- كارت إجمالي ساعات العمل الكلية -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 block uppercase">إجمالي ساعات العمل الكلية</span>
            <span class="text-2xl font-black font-mono text-slate-800 mt-1 block">${formatMins(totalWorkMinutes)}</span>
            <span class="text-[11px] text-slate-400 font-mono mt-0.5 block">(${(totalWorkMinutes / 60).toFixed(2)} ساعة عشرية)</span>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        <!-- كارت إجمالي ساعات الإضافي المستحقة -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-amber-600 block uppercase">إجمالي الإضافي المعتمد (+8 س)</span>
            <span class="text-2xl font-black font-mono text-amber-600 mt-1 block">${formatMins(totalOvertimeMinutes)}</span>
            <span class="text-[11px] text-amber-700 font-mono mt-0.5 block">(${(totalOvertimeMinutes / 60).toFixed(2)} ساعة إضافية)</span>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
        </div>
      </div>

      <!-- نموذج تسجيل الحضور والانصراف اليومي -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span>تسجيل حضور وانصراف واحتساب الإضافي تلقائياً</span>
        </h3>

        ${employees.length === 0 ? `
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">
            يرجى إضافة موظفين أولاً من شاشة "شؤون الموظفين" قبل تسجيل ساعات العمل.
          </div>
        ` : `
          <form id="overtimeForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- اختيار الموظف -->
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">اسم الموظف *</label>
                <select id="otEmpCode" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                  <option value="" disabled selected>اختر الموظف...</option>
                  ${employees.map(emp => `
                    <option value="${emp.code}" data-name="${emp.name}" data-salary="${emp.baseSalary}">
                      ${emp.name} (${emp.code})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- تحديد اليوم -->
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">تاريخ اليوم *</label>
                <input type="date" id="otDate" value="${todayStr}" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white font-semibold" />
              </div>

              <!-- توقيت الحضور -->
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">توقيت الحضور *</label>
                <input type="time" id="otStartTime" value="08:00" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white font-mono" />
              </div>

              <!-- توقيت الانصراف -->
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">توقيت الانصراف *</label>
                <input type="time" id="otEndTime" value="18:30" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white font-mono" />
              </div>
            </div>

            <!-- بطاقة المعاينة والحساب اللحظي الفوري -->
            <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
              <div class="flex items-center gap-6">
                <div>
                  <span class="text-slate-500 block">إجمالي وقت التواجد:</span>
                  <span id="liveTotalWorkText" class="text-sm font-bold font-mono text-slate-800">10 س و 30 د</span>
                </div>
                <div class="border-r border-slate-300 pr-6">
                  <span class="text-slate-500 block">الأساسي (لا يحتسب إضافي):</span>
                  <span class="text-sm font-bold font-mono text-slate-600">8 ساعات</span>
                </div>
                <div class="border-r border-slate-300 pr-6">
                  <span class="text-amber-600 font-bold block">معدل الإضافي المستحق (+8 س):</span>
                  <span id="liveOvertimeText" class="text-base font-black font-mono text-amber-600">2 س و 30 د (2.50 ساعة)</span>
                </div>
              </div>

              <button type="submit" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow transition flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>حفظ في سجل الموظف</span>
              </button>
            </div>
          </form>
        `}
      </div>

      <!-- جدول سجل ساعات العمل والإضافي لكل موظف -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="font-bold text-slate-800 text-sm">سجل الحضور ومعدلات الإضافي التفصيلية</h4>
          <span class="text-xs text-slate-400">عدد السجلات: ${filteredRecords.length}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">التاريخ</th>
                <th class="py-3 px-3">كود الموظف</th>
                <th class="py-3 px-3">اسم الموظف</th>
                <th class="py-3 px-3">توقيت الحضور</th>
                <th class="py-3 px-3">توقيت الانصراف</th>
                <th class="py-3 px-3">إجمالي ساعات العمل</th>
                <th class="py-3 px-3">ساعات الأساسي</th>
                <th class="py-3 px-3 font-black text-amber-800 bg-amber-50">الإضافي المستحق</th>
                <th class="py-3 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredRecords.length === 0 ? `
                <tr><td colspan="9" class="text-center py-8 text-slate-400">لا توجد سجلات حضور وإضافي مسجلة.</td></tr>
              ` : filteredRecords.map(r => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-3 font-mono font-bold text-slate-700">${r.date}</td>
                  <td class="py-3 px-3 font-mono text-slate-500">${r.empCode}</td>
                  <td class="py-3 px-3 font-bold text-slate-800">${r.empName}</td>
                  <td class="py-3 px-3 font-mono text-slate-600">${r.startTime}</td>
                  <td class="py-3 px-3 font-mono text-slate-600">${r.endTime}</td>
                  <td class="py-3 px-3 font-mono font-semibold text-slate-800">
                    ${r.totalWorkFormatted} <span class="text-slate-400 text-[10px]">(${r.decimalHours} س)</span>
                  </td>
                  <td class="py-3 px-3 font-mono text-slate-500">8 ساعات</td>
                  <td class="py-3 px-3 font-mono font-black text-amber-700 bg-amber-50/60">
                    ${r.overtimeMinutes > 0 ? `${r.overtimeFormatted} (${r.decimalOvertime} س)` : '<span class="text-slate-400 font-normal">لا يوجد</span>'}
                  </td>
                  <td class="py-3 px-3 text-center">
                    <button data-id="${r.id}" class="del-ot-btn text-rose-600 hover:underline font-bold">حذف</button>
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
    // 1. تغيير فلتر الموظف
    const filterSelect = document.getElementById('empFilterSelect');
    if (filterSelect) {
      filterSelect.onchange = (e) => {
        const container = document.getElementById('content-root');
        if (container) {
          container.innerHTML = renderOvertimeView(refreshApp, e.target.value);
        }
      };
    }

    // 2. حساب الفارق اللحظي عند تعديل وقت الحضور أو الانصراف
    const startInput = document.getElementById('otStartTime');
    const endInput = document.getElementById('otEndTime');

    function calculateLiveTimes() {
      if (!startInput || !endInput) return;
      const sVal = startInput.value;
      const eVal = endInput.value;
      if (!sVal || !eVal) return;

      const [sh, sm] = sVal.split(':').map(Number);
      const [eh, em] = eVal.split(':').map(Number);

      let startMins = sh * 60 + sm;
      let endMins = eh * 60 + em;

      if (endMins < startMins) {
        endMins += 24 * 60; // دعم عبور منتصف الليل
      }

      const totalDiff = endMins - startMins;
      const standardMins = 8 * 60; // 480 دقيقة
      const otMins = Math.max(0, totalDiff - standardMins);

      const totalH = Math.floor(totalDiff / 60);
      const totalM = totalDiff % 60;
      const totalText = totalM > 0 ? `${totalH} س و ${totalM} د` : `${totalH} س`;
      const decimalH = (totalDiff / 60).toFixed(2);

      const otH = Math.floor(otMins / 60);
      const otM = otMins % 60;
      const otText = otM > 0 ? `${otH} س و ${otM} د` : `${otH} س`;
      const decimalOt = (otMins / 60).toFixed(2);

      const liveTotal = document.getElementById('liveTotalWorkText');
      const liveOt = document.getElementById('liveOvertimeText');

      if (liveTotal) liveTotal.innerText = `${totalText} (${decimalH} ساعة)`;
      if (liveOt) liveOt.innerText = otMins > 0 ? `${otText} (${decimalOt} ساعة)` : 'لا يوجد إضافي (أقل من أو يساوي 8 ساعات)';

      return { totalDiff, otMins, totalText, decimalH, otText, decimalOt };
    }

    if (startInput && endInput) {
      startInput.addEventListener('input', calculateLiveTimes);
      endInput.addEventListener('input', calculateLiveTimes);
      calculateLiveTimes();
    }

    // 3. حفظ السجل
    const form = document.getElementById('overtimeForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const empSelect = document.getElementById('otEmpCode');
        const empCode = empSelect.value;
        const empName = empSelect.options[empSelect.selectedIndex].getAttribute('data-name');
        const date = document.getElementById('otDate').value;
        const startTime = startInput.value;
        const endTime = endInput.value;

        const calcs = calculateLiveTimes();

        store.insert('employee_overtime', {
          empCode,
          empName,
          date,
          startTime,
          endTime,
          totalMinutes: calcs.totalDiff,
          totalWorkFormatted: calcs.totalText,
          decimalHours: calcs.decimalH,
          overtimeMinutes: calcs.otMins,
          overtimeFormatted: calcs.otText,
          decimalOvertime: calcs.decimalOt
        });

        const container = document.getElementById('content-root');
        if (container) {
          container.innerHTML = renderOvertimeView(refreshApp, selectedEmpFilter);
        }
      };
    }

    // 4. حذف سجل
    document.querySelectorAll('.del-ot-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('هل ترغب في حذف هذا السجل؟')) {
          store.delete('employee_overtime', btn.getAttribute('data-id'));
          const container = document.getElementById('content-root');
          if (container) {
            container.innerHTML = renderOvertimeView(refreshApp, selectedEmpFilter);
          }
        }
      };
    });
  }, 0);

  return html;
}
