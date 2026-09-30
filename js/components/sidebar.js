/**
 * القائمة الجانبية المستقلة للنظام (Sidebar Component)
 * مسؤولة عن التنقل وعرض التبويبات النشطة
 */

// تعريف عناصر القائمة الجانبية
const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'الرئيسية والمؤشرات',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
  },
  {
    id: 'employees',
    label: 'شؤون الموظفين',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
  },
  {
    id: 'attendance',
    label: 'الحضور والانصراف',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
  },
  {
    id: 'advances',
    label: 'السلف والقروض',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
  },
  {
    id: 'overtime',
    label: 'العمل الإضافي',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  },
  {
    id: 'penalties',
    label: 'الجزاءات والخصومات',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
  },
  {
    id: 'payroll',
    label: 'تصفية الرواتب',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>`
  },
  {
    id: 'factory-labor',
    label: 'عمالة المصنع اليومية',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`
  },
  {
    id: 'transfers',
    label: 'كشوف التحويلات',
    icon: `<svg class="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`
  }
];

/**
 * دالة بناء وتثبيت القائمة الجانبية
 * @param {string} activeId - كود الشاشة النشطة حالياً
 * @param {Function} onNavigate - دالة الاستدعاء عند اختيار شاشة
 * @returns {string} كود HTML
 */
export function renderSidebar(activeId, onNavigate) {
  const html = `
    <div class="w-64 bg-slate-900 text-slate-200 h-full flex flex-col border-l border-slate-800 shadow-xl select-none">
      
      <!-- شعار النظام -->
      <div class="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h1 class="font-extrabold text-lg tracking-wider text-emerald-400">ERP الرواتب</h1>
          <p class="text-xs text-slate-400 mt-0.5">إدارة الأجور والعمالة</p>
        </div>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Vercel</span>
      </div>

      <!-- قائمة الروابط -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1.5">
        ${MENU_ITEMS.map(item => {
          const isActive = activeId === item.id;
          return `
            <button 
              data-screen="${item.id}"
              class="sidebar-btn w-full flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }"
            >
              ${item.icon}
              <span>${item.label}</span>
            </button>
          `;
        }).join('')}
      </nav>

      <!-- تذييل القائمة الجانبية -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>متصل سحابياً</span>
        </span>
        <span class="text-slate-500 text-[11px]">v1.0</span>
      </div>

    </div>
  `;

  // ربط أحداث الضغط على الأزرار
  setTimeout(() => {
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
      btn.onclick = () => {
        const targetScreen = btn.getAttribute('data-screen');
        if (typeof onNavigate === 'function') {
          onNavigate(targetScreen);
        }
      };
    });
  }, 0);

  return html;
}
