/**
 * طبقة التخزين الموحدة للنظام (Data Storage Layer)
 * مسؤولة عن عمليات CRUD المستقلة دون التدخل في الواجهات أو العمليات الحسابية
 */

const STORAGE_PREFIX = 'erp_db_';

export const store = {
  /**
   * جلب جميع السجلات لجدول معين
   * @param {string} collection - اسم الجدول (مثلاً: 'employees', 'advances')
   * @returns {Array} مصفوفة البيانات
   */
  getAll(collection) {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${collection}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`خطأ أثناء قراءة بيانات ${collection}:`, error);
      return [];
    }
  },

  /**
   * جلب سجل محدد بواسطة المعرف
   * @param {string} collection 
   * @param {string|number} id 
   * @returns {Object|null}
   */
  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => String(item.id) === String(id)) || null;
  },

  /**
   * إضافة سجل جديد مع توليد معرف فريد وتاريخ إنشاء
   * @param {string} collection 
   * @param {Object} record - البيانات المراد حفظها
   * @returns {Object} السجل المضاف كاملاً
   */
  insert(collection, record) {
    const items = this.getAll(collection);
    const newRecord = {
      id: Date.now().toString(),
      ...record,
      createdAt: new Date().toISOString()
    };
    
    items.unshift(newRecord); // إضافة في البداية لترتيب الأحدث أولاً
    localStorage.setItem(`${STORAGE_PREFIX}${collection}`, JSON.stringify(items));
    return newRecord;
  },

  /**
   * تعديل سجل موجود بالكامل أو جزئياً
   * @param {string} collection 
   * @param {string|number} id 
   * @param {Object} updatedData 
   * @returns {Object|null}
   */
  update(collection, id, updatedData) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => String(item.id) === String(id));
    
    if (index === -1) {
      console.error(`السجل غير موجود بالمعرف: ${id}`);
      return null;
    }

    items[index] = {
      ...items[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`${STORAGE_PREFIX}${collection}`, JSON.stringify(items));
    return items[index];
  },

  /**
   * حذف سجل محدد
   * @param {string} collection 
   * @param {string|number} id 
   * @returns {boolean}
   */
  delete(collection, id) {
    const items = this.getAll(collection);
    const filtered = items.filter(item => String(item.id) !== String(id));
    
    if (filtered.length === items.length) {
      return false; // لم يُحذف شيء
    }

    localStorage.setItem(`${STORAGE_PREFIX}${collection}`, JSON.stringify(filtered));
    return true;
  },

  /**
   * تفريغ جدول بالكامل (تستخدم في التصفير والترحيل)
   * @param {string} collection 
   */
  clear(collection) {
    localStorage.removeItem(`${STORAGE_PREFIX}${collection}`);
  }
};
