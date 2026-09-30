/**
 * نقطة الانطلاق والموجّه الرئيسي للنظام (App Router)
 * يربط القائمة الجانبية بالشاشات المستقلة ويدير إعادة التصيير التلقائي
 */

import { renderSidebar } from './components/sidebar.js';
import { renderDashboardView } from './modules/dashboardView.js';
import { renderEmployeesView } from './modules/employeesView.js';
import { renderAttendanceView } from './modules/attendanceView.js';
import { renderAdvancesView } from './modules/advancesView.js';
import { renderPayrollView } from './modules/payrollView.js';
import { renderFactoryLaborView } from './modules/factoryLaborView.js';
import { renderTransfersView } from './modules/transfersView.js';

// الشاشة الافتراضية عند فتح التطبيق
let activeScreen = 'dashboard';

/**
 * دالة التنقل بين الشاشات
 * @param {string} screenId 
 */
function navigateTo(screenId) {
  activeScreen = screenId;
  renderApp();
}

/**
 * دالة إعادة بناء وتصيير التطبيق بالكامل
 */
function renderApp() {
  const sidebarContainer = document.getElementById('sidebar-root');
  const contentContainer = document.getElementById('content-root');

  if (!sidebarContainer || !contentContainer) {
    console.error('لم يتم العثور على حاويات العرض الأساسية في index.html');
    return;
  }

  // 1. رسم وتحديث القائمة الجانبية
  sidebarContainer.innerHTML = renderSidebar(activeScreen, navigateTo);

  // 2. توجيه وعرض الشاشة المطلوبة بشكل مستقل
  switch (activeScreen) {
    case 'dashboard':
      contentContainer.innerHTML = renderDashboardView(renderApp, navigateTo);
      break;

    case 'employees':
      contentContainer.innerHTML = renderEmployeesView(renderApp);
      break;

    case 'attendance':
    case 'overtime':
    case 'penalties':
      // إدخال الحضور والغياب والإضافي والجزاءات مدمجة تنظيمياً في هذه الشاشة
      contentContainer.innerHTML = renderAttendanceView(renderApp);
      break;

    case 'advances':
      contentContainer.innerHTML = renderAdvancesView(renderApp);
      break;

    case 'payroll':
      contentContainer.innerHTML = renderPayrollView(renderApp);
      break;

    case 'factory-labor':
      contentContainer.innerHTML = renderFactoryLaborView(renderApp);
      break;

    case 'transfers':
      contentContainer.innerHTML = renderTransfersView(renderApp);
      break;

    default:
      contentContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-slate-400 p-8">
          <p class="text-lg font-bold text-slate-600">الشاشة المطلوبة غير موجودة</p>
          <button id="backHomeBtn" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
            العودة للرئيسية
          </button>
        </div>
      `;
      setTimeout(() => {
        const btn = document.getElementById('backHomeBtn');
        if (btn) btn.onclick = () => navigateTo('dashboard');
      }, 0);
      break;
  }
}

// بدء تشغيل المنظومة بمجرد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});
