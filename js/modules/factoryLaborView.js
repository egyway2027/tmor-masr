/**
 * شاشة عمالة المصنع ومقاولي الإنتاج (Factory Labor & Contractors Module)
 * واجهة احترافية بتبويبات مستقلة مع حسابات لحظية مباشرة للرجال والسيدات والمقاولين
 */

import { store } from '../data/store.js';
import { 
  calculateShiftMinutes, 
  calculateMenShift, 
  calculateMenDaySummary, 
  calculateWomenDayShift, 
  calculateContractorEntry 
} from '../core/factoryLaborCalc.js';

// التبويب النشط (رجال / سيدات / مقاولين)
let activeLaborTab = 'men';

/**
 * بناء وعرض شاشة عمالة المصنع والمقاولين
 * @param {Function} refreshApp - دالة إعادة تصيير الواجهة
 * @returns {string} كود HTML للشاشة
 */
export function renderFactoryLaborView(refreshApp) {
  const menRecords = store.getAll('factory_labor_men');
  const womenRecords = store.getAll('factory_labor_women');
  const contractorRecords = store.getAll('contractors');
  const todayStr = new Date().toISOString().split('T')[0];

  const html = `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      
      <!-- ترويسة الصفحة والتبويبات -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">إدارة حسابات العمالة والمقاولات</h2>
          <p class="text-sm text-slate-500 mt-1">حساب دقيق لورديات العمالة بالدقائق والساعات وبدل النقل ومستخلصات المقاولين</p>
        </div>

        <!-- أزرار التبويبات الرئيسية -->
        <div class="flex bg-slate-200/80 p-1.5 rounded-xl gap-1">
          <button 
            data-tab="men" 
            class="labor-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeLaborTab === 'men' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }"
          >
            👨 عمالة رجال (شفتين)
          </button>
          <button 
            data-tab="women" 
            class="labor-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeLaborTab === 'women' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }"
          >
            👩 عمالة سيدات (شفت + نقل)
          </button>
          <button 
            data-tab="contractors" 
            class="labor-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeLaborTab === 'contractors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }"
          >
            🚜 مستخلصات المقاولين
          </button>
        </div>
      </div>

      <!-- محتوى التبويب النشط -->
      <div id="labor-tab-content">
        ${activeLaborTab === 'men' ? renderMenSection(menRecords, todayStr) : ''}
        ${activeLaborTab === 'women' ? renderWomenSection(womenRecords, todayStr) : ''}
        ${activeLaborTab === 'contractors' ? renderContractorsSection(contractorRecords) : ''}
      </div>

    </div>
  `;

  // ربط الأحداث
  setTimeout(() => {
    // 1. التبديل بين التبويبات
    document.querySelectorAll('.labor-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeLaborTab = btn.getAttribute('data-tab');
        const container = document.getElementById('content-root');
        if (container) {
          container.innerHTML = renderFactoryLaborView(refreshApp);
        }
      };
    });

    // 2. تفعيل أحداث التبويب النشط
    if (activeLaborTab === 'men') {
      setupMenTabEvents(refreshApp);
    } else if (activeLaborTab === 'women') {
      setupWomenTabEvents(refreshApp);
    } else if (activeLaborTab === 'contractors') {
      setupContractorsTabEvents(refreshApp);
    }
  }, 0);

  return html;
}

/* ==========================================================
   1. قسم عمالة الرجال (Men Section)
   ========================================================== */
function renderMenSection(records, todayStr) {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
            <span>تسجيل وردية عمالة رجال (حساب فوري بالدقيقة والساعة)</span>
          </h3>
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold text-slate-600">تاريخ اليومية:</label>
            <input type="date" id="menDate" value="${todayStr}" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none bg-white font-semibold" />
          </div>
        </div>

        <form id="menLaborForm" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- كارت الوردية النهارية -->
            <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <span class="text-amber-500">☀️</span> الوردية النهارية
                </span>
                <span id="menDayDurationBadge" class="text-[11px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                  0 س
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">وقت الحضور</label>
                  <input type="time" id="menDayStart" value="07:00" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-mono" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">وقت الانصراف</label>
                  <input type="time" id="menDayEnd" value="17:15" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">عدد العمال النهاري *</label>
                  <input type="number" id="menDayCount" value="20" min="0" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-bold" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">سعر الساعة (ج.م)</label>
                  <input type="number" id="menDayRate" value="75" min="1" step="any" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-bold" />
                </div>
              </div>

              <!-- ناتج النهاري الفوري -->
              <div class="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span class="text-slate-500">أجر الفرد النهاري: <b id="menDayPerWorkerText" class="text-blue-700 font-mono">0 ج.م</b></span>
                <span class="text-slate-700 font-bold">إجمالي النهاري: <b id="menDayTotalText" class="text-emerald-700 font-mono text-sm">0 ج.م</b></span>
              </div>
            </div>

            <!-- كارت الوردية الليلية -->
            <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <span class="text-indigo-500">🌙</span> الوردية الليلية
                </span>
                <span id="menNightDurationBadge" class="text-[11px] font-mono font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                  0 س
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">وقت الحضور</label>
                  <input type="time" id="menNightStart" value="19:00" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-mono" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">وقت الانصراف (فجر اليوم التالي)</label>
                  <input type="time" id="menNightEnd" value="03:00" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">عدد العمال الليلي</label>
                  <input type="number" id="menNightCount" value="0" min="0" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-bold" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">سعر الساعة (ج.م)</label>
                  <input type="number" id="menNightRate" value="75" min="1" step="any" class="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-bold" />
                </div>
              </div>

              <!-- ناتج الليلي الفوري -->
              <div class="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span class="text-slate-500">أجر الفرد الليلي: <b id="menNightPerWorkerText" class="text-indigo-700 font-mono">0 ج.م</b></span>
                <span class="text-slate-700 font-bold">إجمالي الليلي: <b id="menNightTotalText" class="text-emerald-700 font-mono text-sm">0 ج.م</b></span>
              </div>
            </div>

          </div>

          <!-- شريط الإقفال والجزاءات وزر الحفظ -->
          <div class="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div>
                <span class="text-[11px] text-slate-400 block">الجزاءات والاستقطاعات</span>
                <input type="number" id="menPenalties" value="0" min="0" class="w-28 p-1.5 text-xs rounded bg-slate-800 border border-slate-700 text-rose-400 font-bold outline-none" />
              </div>
              <div class="border-r border-slate-800 pr-4">
                <span class="text-[11px] text-slate-400 block">إجمالي عمال اليوم</span>
                <span id="menTotalWorkersText" class="text-base font-bold font-mono">0 عامل</span>
              </div>
              <div class="border-r border-slate-800 pr-4">
                <span class="text-[11px] text-emerald-400 block font-semibold">الصافي الإجمالي المطلوب صرفه</span>
                <span id="menFinalNetText" class="text-xl font-black font-mono text-emerald-400">0.00 ج.م</span>
              </div>
            </div>

            <button type="submit" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5">
              <span>حفظ واعتماد يومية الرجال</span>
            </button>
          </div>
        </form>
      </div>

      <!-- جدول سجل يوميات الرجال -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="font-bold text-slate-800 text-sm">سجل يوميات عمالة الرجال بالمصنع</h4>
          <span class="text-xs text-slate-400">عدد الأيام المسجلة: ${records.length}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">التاريخ</th>
                <th class="py-3 px-3">النهاري (وقت / عمال / فرد)</th>
                <th class="py-3 px-3">إجمالي النهاري</th>
                <th class="py-3 px-3">الليلي (وقت / عمال / فرد)</th>
                <th class="py-3 px-3">إجمالي الليلي</th>
                <th class="py-3 px-3">الجزاءات</th>
                <th class="py-3 px-3 font-black text-emerald-800 bg-emerald-50">صافي اليومية</th>
                <th class="py-3 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.length === 0 ? `
                <tr><td colspan="8" class="text-center py-8 text-slate-400">لا توجد يوميات مسجلة لعمالة الرجال.</td></tr>
              ` : records.map(r => `
                <tr class="hover:bg-slate-50">
                  <td class="py-3 px-3 font-mono font-bold text-slate-700">${r.date}</td>
                  <td class="py-3 px-3 text-slate-600">
                    <span class="font-mono text-blue-700">${(r.dayShift && r.dayShift.durationText) || '-'}</span> • 
                    <b>${(r.dayShift && r.dayShift.workerCount) \vert{}\vert{} 0} عمال</b> (${(r.dayShift && r.dayShift.perWorkerWage) || 0} ج/فرد)
                  </td>
                  <td class="py-3 px-3 font-mono font-semibold">${Number((r.dayShift && r.dayShift.shiftTotal) || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 text-slate-600">
                    ${r.nightShift && r.nightShift.workerCount > 0 ? `
                      <span class="font-mono text-indigo-700">${r.nightShift.durationText}</span> • 
                      <b>${r.nightShift.workerCount} عمال</b> (${r.nightShift.perWorkerWage} ج/فرد)
                    ` : '<span class="text-slate-400">-</span>'}
                  </td>
                  <td class="py-3 px-3 font-mono font-semibold">${(r.nightShift && r.nightShift.shiftTotal > 0) ? Number(r.nightShift.shiftTotal).toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
                  <td class="py-3 px-3 font-mono text-rose-600">${r.penalties > 0 ? '-' + r.penalties : '0'}</td>
                  <td class="py-3 px-3 font-mono font-black text-emerald-700 bg-emerald-50/50">${Number(r.netTotal || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 text-center">
                    <button data-id="${r.id}" class="del-men-btn text-rose-600 hover:underline">حذف</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setupMenTabEvents(refreshApp) {
  const dayStartInput = document.getElementById('menDayStart');
  const dayEndInput = document.getElementById('menDayEnd');
  const dayCountInput = document.getElementById('menDayCount');
  const dayRateInput = document.getElementById('menDayRate');

  const nightStartInput = document.getElementById('menNightStart');
  const nightEndInput = document.getElementById('menNightEnd');
  const nightCountInput = document.getElementById('menNightCount');
  const nightRateInput = document.getElementById('menNightRate');

  const penaltiesInput = document.getElementById('menPenalties');

  if (!dayStartInput || !nightStartInput) return;

  function updateMenLiveCalculations() {
    const dayDiff = calculateShiftMinutes(dayStartInput.value, dayEndInput.value);
    const dayShift = calculateMenShift({
      totalMinutes: dayDiff.totalMinutes,
      workerCount: dayCountInput.value,
      hourlyRate: dayRateInput.value
    });

    const nightDiff = calculateShiftMinutes(nightStartInput.value, nightEndInput.value);
    const nightShift = calculateMenShift({
      totalMinutes: nightDiff.totalMinutes,
      workerCount: nightCountInput.value,
      hourlyRate: nightRateInput.value
    });

    const summary = calculateMenDaySummary({
      dayShift,
      nightShift,
      penalties: penaltiesInput.value
    });

    document.getElementById('menDayDurationBadge').innerText = dayDiff.text;
    document.getElementById('menDayPerWorkerText').innerText = dayShift.perWorkerWage + ' ج.م';
    document.getElementById('menDayTotalText').innerText = dayShift.shiftTotal.toLocaleString('ar-EG') + ' ج.م';

    document.getElementById('menNightDurationBadge').innerText = nightDiff.text;
    document.getElementById('menNightPerWorkerText').innerText = nightShift.perWorkerWage + ' ج.م';
    document.getElementById('menNightTotalText').innerText = nightShift.shiftTotal.toLocaleString('ar-EG') + ' ج.م';

    document.getElementById('menTotalWorkersText').innerText = summary.totalWorkers + ' عامل';
    document.getElementById('menFinalNetText').innerText = summary.netTotal.toLocaleString('ar-EG') + ' ج.م';

    return { dayDiff, dayShift, nightDiff, nightShift, summary };
  }

  [
    dayStartInput, dayEndInput, dayCountInput, dayRateInput,
    nightStartInput, nightEndInput, nightCountInput, nightRateInput, penaltiesInput
  ].forEach(el => el.addEventListener('input', updateMenLiveCalculations));

  updateMenLiveCalculations();

  const form = document.getElementById('menLaborForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const date = document.getElementById('menDate').value;
      const { dayDiff, dayShift, nightDiff, nightShift, summary } = updateMenLiveCalculations();

      store.insert('factory_labor_men', {
        date,
        dayShift: {
          startTime: dayStartInput.value,
          endTime: dayEndInput.value,
          durationText: dayDiff.text,
          totalMinutes: dayDiff.totalMinutes,
          workerCount: dayShift.workerCount,
          hourlyRate: dayShift.hourlyRate,
          perWorkerWage: dayShift.perWorkerWage,
          shiftTotal: dayShift.shiftTotal
        },
        nightShift: {
          startTime: nightStartInput.value,
          endTime: nightEndInput.value,
          durationText: nightDiff.text,
          totalMinutes: nightDiff.totalMinutes,
          workerCount: nightShift.workerCount,
          hourlyRate: nightShift.hourlyRate,
          perWorkerWage: nightShift.perWorkerWage,
          shiftTotal: nightShift.shiftTotal
        },
        totalWorkers: summary.totalWorkers,
        totalGross: summary.totalGross,
        penalties: summary.penalties,
        netTotal: summary.netTotal
      });

      refreshApp();
    };
  }

  document.querySelectorAll('.del-men-btn').forEach(btn => {
    btn.onclick = () => {
      if (confirm('حذف يومية الرجال هذه؟')) {
        store.delete('factory_labor_men', btn.getAttribute('data-id'));
        refreshApp();
      }
    };
  });
}

/* ==========================================================
   2. قسم عمالة السيدات (Women Section)
   ========================================================== */
function renderWomenSection(records, todayStr) {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span>تسجيل وردية عمالة سيدات (شفت موحد + 8 ساعات أساسي + إضافي بالدقيقة + 150 ج نقل)</span>
          </h3>
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold text-slate-600">تاريخ اليومية:</label>
            <input type="date" id="womenDate" value="${todayStr}" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none bg-white font-semibold" />
          </div>
        </div>

        <form id="womenLaborForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">وقت الحضور</label>
              <input type="time" id="womenStart" value="07:00" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none font-mono bg-white" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">وقت الانصراف</label>
              <input type="time" id="womenEnd" value="18:00" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none font-mono bg-white" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">عدد العاملات باليومية *</label>
              <input type="number" id="womenCount" value="44" min="1" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none font-bold" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">أجر الـ 8 ساعات الأساسية (ج.م)</label>
              <input type="number" id="womenBaseRate" value="450" min="1" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none font-bold" />
            </div>
          </div>

          <!-- تفكيك الحسبة للعاملة الواحدة -->
          <div class="bg-rose-50/50 border border-rose-100 p-4 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <span class="text-slate-500 block">إجمالي وقت الوردية:</span>
              <span id="womenDurationText" class="font-bold font-mono text-slate-800">11 ساعة</span>
            </div>
            <div>
              <span class="text-slate-500 block">الأساسي (8 ساعات):</span>
              <span id="womenPerWorkerBase" class="font-bold font-mono text-slate-800">450.00 ج.م</span>
            </div>
            <div>
              <span class="text-slate-500 block">الإضافي بالدقيقة:</span>
              <span id="womenPerWorkerOt" class="font-bold font-mono text-rose-700">168.75 ج.م</span>
            </div>
            <div>
              <span class="text-slate-500 block">بدل نقل السيارات:</span>
              <span class="font-bold font-mono text-blue-700">150.00 ج.م</span>
            </div>
            <div class="col-span-2 md:col-span-1 bg-white p-2 rounded-lg border border-rose-200">
              <span class="text-slate-500 block text-[10px]">إجمالي نصيب العاملة:</span>
              <span id="womenPerWorkerTotal" class="font-black font-mono text-rose-700 text-sm">768.75 ج.م</span>
            </div>
          </div>

          <!-- شريط الإقفال والنتائج الإجمالية -->
          <div class="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex flex-wrap items-center gap-4">
              <div>
                <span class="text-[11px] text-slate-400 block">الجزاءات (ج.م)</span>
                <input type="number" id="womenPenalties" value="0" min="0" class="w-28 p-1.5 text-xs rounded bg-slate-800 border border-slate-700 text-rose-400 font-bold outline-none" />
              </div>
              <div class="border-r border-slate-800 pr-4">
                <span class="text-[11px] text-slate-400 block">مستحقات النقل للسيارات</span>
                <span id="womenTotalTransportText" class="text-sm font-bold font-mono text-blue-400">0 ج.م</span>
              </div>
              <div class="border-r border-slate-800 pr-4">
                <span class="text-[11px] text-emerald-400 block font-semibold">الصافي الإجمالي المطلوب سداده</span>
                <span id="womenNetTotalText" class="text-xl font-black font-mono text-emerald-400">0.00 ج.م</span>
              </div>
            </div>

            <button type="submit" class="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow transition">
              حفظ واعتماد يومية السيدات
            </button>
          </div>
        </form>
      </div>

      <!-- جدول سجل يوميات السيدات -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="font-bold text-slate-800 text-sm">سجل يوميات عمالة السيدات بالمصنع</h4>
          <span class="text-xs text-slate-400">عدد الأيام المسجلة: ${records.length}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">التاريخ</th>
                <th class="py-3 px-3">العدد</th>
                <th class="py-3 px-3">ساعات العمل</th>
                <th class="py-3 px-3">إجمالي الأساسي</th>
                <th class="py-3 px-3">إجمالي الإضافي</th>
                <th class="py-3 px-3">إجمالي النقل</th>
                <th class="py-3 px-3">الجزاءات</th>
                <th class="py-3 px-3 font-black text-rose-800 bg-rose-50">صافي المسير</th>
                <th class="py-3 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.length === 0 ? `
                <tr><td colspan="9" class="text-center py-8 text-slate-400">لا توجد يوميات مسجلة لعمالة السيدات.</td></tr>
              ` : records.map(r => `
                <tr class="hover:bg-slate-50">
                  <td class="py-3 px-3 font-mono font-bold text-slate-700">${r.date}</td>
                  <td class="py-3 px-3 font-bold text-slate-800">${r.workerCount} عاملة</td>
                  <td class="py-3 px-3 text-slate-600 font-mono">${r.durationText || '-'}</td>
                  <td class="py-3 px-3 font-mono">${Number(r.totalRegularWage || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 font-mono text-rose-600 font-semibold">${Number(r.totalOvertimeWage || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 font-mono text-blue-600 font-semibold">${Number(r.totalTransport || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 font-mono text-rose-600">${r.penalties > 0 ? '-' + r.penalties : '0'}</td>
                  <td class="py-3 px-3 font-mono font-black text-rose-700 bg-rose-50/50">${Number(r.netTotal || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 text-center">
                    <button data-id="${r.id}" class="del-women-btn text-rose-600 hover:underline">حذف</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setupWomenTabEvents(refreshApp) {
  const startInput = document.getElementById('womenStart');
  const endInput = document.getElementById('womenEnd');
  const countInput = document.getElementById('womenCount');
  const baseRateInput = document.getElementById('womenBaseRate');
  const penaltiesInput = document.getElementById('womenPenalties');

  if (!startInput || !endInput) return;

  function updateWomenLiveCalculations() {
    const diff = calculateShiftMinutes(startInput.value, endInput.value);
    const calc = calculateWomenDayShift({
      totalMinutes: diff.totalMinutes,
      workerCount: countInput.value,
      baseDayRate: baseRateInput.value,
      transportRate: 150,
      penalties: penaltiesInput.value
    });

    document.getElementById('womenDurationText').innerText = diff.text;
    document.getElementById('womenPerWorkerBase').innerText = calc.regularWagePerWorker + ' ج.م';
    document.getElementById('womenPerWorkerOt').innerText = calc.overtimeWagePerWorker + ' ج.م';
    document.getElementById('womenPerWorkerTotal').innerText = calc.totalPerWorker + ' ج.م';

    document.getElementById('womenTotalTransportText').innerText = calc.totalTransport.toLocaleString('ar-EG') + ' ج.م';
    document.getElementById('womenNetTotalText').innerText = calc.netTotal.toLocaleString('ar-EG') + ' ج.م';

    return { diff, calc };
  }

  [startInput, endInput, countInput, baseRateInput, penaltiesInput].forEach(el => el.addEventListener('input', updateWomenLiveCalculations));
  updateWomenLiveCalculations();

  const form = document.getElementById('womenLaborForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const date = document.getElementById('womenDate').value;
      const { diff, calc } = updateWomenLiveCalculations();

      store.insert('factory_labor_women', {
        date,
        startTime: startInput.value,
        endTime: endInput.value,
        durationText: diff.text,
        totalMinutes: diff.totalMinutes,
        ...calc
      });

      refreshApp();
    };
  }

  document.querySelectorAll('.del-women-btn').forEach(btn => {
    btn.onclick = () => {
      if (confirm('حذف يومية السيدات هذه؟')) {
        store.delete('factory_labor_women', btn.getAttribute('data-id'));
        refreshApp();
      }
    };
  });
}

/* ==========================================================
   3. قسم المقاولين (Contractors Section)
   ========================================================== */
function renderContractorsSection(records) {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
          <span>تسجيل مستخلص مقاول (تكييس / جمع / فصل فسائل)</span>
        </h3>

        <form id="contractorTabForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">اسم المقاول / المستفيد *</label>
            <input type="text" id="cTabName" placeholder="مثال: اسلام الازلي" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">بيان الأعمال *</label>
            <input type="text" id="cTabDesc" placeholder="مثال: قيمة التكييس" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">الكمية المنفذة *</label>
            <input type="number" id="cTabQty" min="0" step="any" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">سعر الفئة (ج.م) *</label>
            <input type="number" id="cTabPrice" min="0" step="any" required class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">الدفعة المسددة له (ج.م)</label>
            <input type="number" id="cTabPaid" value="0" min="0" step="any" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none" />
          </div>
          <div class="lg:col-span-5 flex justify-end">
            <button type="submit" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition">
              حفظ المستخلص
            </button>
          </div>
        </form>
      </div>

      <!-- جدول المقاولين -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="font-bold text-slate-800 text-sm">كشف حسابات ومستخلصات المقاولين</h4>
          <span class="text-xs text-slate-400">إجمالي العمليات: ${records.length}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">المقاول</th>
                <th class="py-3 px-3">البيان</th>
                <th class="py-3 px-3">الكمية</th>
                <th class="py-3 px-3">السعر</th>
                <th class="py-3 px-3">إجمالي القيمة</th>
                <th class="py-3 px-3">المسدد</th>
                <th class="py-3 px-3 font-bold text-rose-700">المتبقي</th>
                <th class="py-3 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.length === 0 ? `
                <tr><td colspan="8" class="text-center py-8 text-slate-400">لا توجد مستخلصات مسجلة.</td></tr>
              ` : records.map(c => `
                <tr class="hover:bg-slate-50">
                  <td class="py-3 px-3 font-bold text-slate-800">${c.name}</td>
                  <td class="py-3 px-3 text-slate-600">${c.description}</td>
                  <td class="py-3 px-3 font-mono">${c.qty}</td>
                  <td class="py-3 px-3 font-mono">${c.price} ج.م</td>
                  <td class="py-3 px-3 font-mono font-bold">${Number(c.totalAmount || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 font-mono text-emerald-600 font-bold">${Number(c.paidAmount || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 font-mono font-black ${c.remaining > 0 ? 'text-rose-600' : 'text-slate-400'}">${Number(c.remaining || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td class="py-3 px-3 text-center">
                    <button data-id="${c.id}" class="del-c-btn text-rose-600 hover:underline">حذف</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setupContractorsTabEvents(refreshApp) {
  const form = document.getElementById('contractorTabForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('cTabName').value.trim();
      const description = document.getElementById('cTabDesc').value.trim();
      const qty = parseFloat(document.getElementById('cTabQty').value) || 0;
      const price = parseFloat(document.getElementById('cTabPrice').value) || 0;
      const paid = parseFloat(document.getElementById('cTabPaid').value) || 0;

      const calc = calculateContractorEntry({ quantity: qty, unitPrice: price, paidAmount: paid });

      store.insert('contractors', {
        name,
        description,
        qty: calc.quantity,
        price: calc.unitPrice,
        totalAmount: calc.totalAmount,
        paidAmount: calc.paidAmount,
        remaining: calc.remaining
      });

      refreshApp();
    };
  }

  document.querySelectorAll('.del-c-btn').forEach(btn => {
    btn.onclick = () => {
      if (confirm('حذف هذا المستخلص؟')) {
        store.delete('contractors', btn.getAttribute('data-id'));
        refreshApp();
      }
    };
  });
}
