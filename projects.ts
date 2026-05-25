/**
 * نظام إدارة المشاريع
 * 
 * يحفظ المشاريع محلياً في LocalStorage
 * يمكن ربطه بـ Supabase لاحقاً للمزامنة السحابية
 * 
 * كل مشروع يحتوي على:
 * - ID فريد
 * - اسم المشروع
 * - الوصف
 * - الكود المُولد
 * - تاريخ الإنشاء والتعديل
 * - المزود والنموذج المستخدم
 * - الحالة (مسودة/منشور)
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: number;
  updatedAt: number;
  provider: string;
  model: string;
  status: "draft" | "published";
  thumbnail?: string;
  size: number; // حجم الكود بالبايت
  userId?: string;
}

const PROJECTS_KEY = "appgenius-projects";

/**
 * توليد ID فريد
 */
function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * الحصول على جميع المشاريع
 */
export function getAllProjects(userId?: string): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (!stored) return [];
    const projects: Project[] = JSON.parse(stored);
    
    // فلترة حسب المستخدم إذا تم تحديده
    if (userId) {
      return projects.filter((p) => !p.userId || p.userId === userId);
    }
    return projects;
  } catch (error) {
    console.error("فشل تحميل المشاريع:", error);
    return [];
  }
}

/**
 * الحصول على مشروع واحد
 */
export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * حفظ مشروع جديد
 */
export function saveProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt" | "size">
): Project {
  const projects = getAllProjects();
  const now = Date.now();
  
  const project: Project = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    size: new Blob([data.code]).size,
  };
  
  projects.unshift(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return project;
}

/**
 * تحديث مشروع موجود
 */
export function updateProject(
  id: string,
  updates: Partial<Omit<Project, "id" | "createdAt">>
): Project | null {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === id);
  
  if (index === -1) return null;
  
  const updated: Project = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now(),
    size: updates.code 
      ? new Blob([updates.code]).size 
      : projects[index].size,
  };
  
  projects[index] = updated;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return updated;
}

/**
 * حذف مشروع
 */
export function deleteProject(id: string): boolean {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  
  if (filtered.length === projects.length) return false;
  
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * تكرار مشروع
 */
export function duplicateProject(id: string): Project | null {
  const project = getProject(id);
  if (!project) return null;
  
  return saveProject({
    name: `${project.name} (نسخة)`,
    description: project.description,
    code: project.code,
    provider: project.provider,
    model: project.model,
    status: "draft",
  });
}

/**
 * الحصول على إحصائيات المشاريع
 */
export function getProjectsStats(userId?: string) {
  const projects = getAllProjects(userId);
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  return {
    total: projects.length,
    thisWeek: projects.filter((p) => p.createdAt > weekAgo).length,
    thisMonth: projects.filter((p) => p.createdAt > monthAgo).length,
    published: projects.filter((p) => p.status === "published").length,
    drafts: projects.filter((p) => p.status === "draft").length,
    totalSize: projects.reduce((sum, p) => sum + p.size, 0),
  };
}

/**
 * البحث في المشاريع
 */
export function searchProjects(query: string, userId?: string): Project[] {
  const projects = getAllProjects(userId);
  const q = query.toLowerCase().trim();
  
  if (!q) return projects;
  
  return projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.provider.toLowerCase().includes(q)
  );
}

/**
 * ترتيب المشاريع
 */
export function sortProjects(
  projects: Project[],
  sortBy: "newest" | "oldest" | "name" | "size"
): Project[] {
  const sorted = [...projects];
  
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case "oldest":
      return sorted.sort((a, b) => a.createdAt - b.createdAt);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    case "size":
      return sorted.sort((a, b) => b.size - a.size);
    default:
      return sorted;
  }
}

/**
 * تنسيق الحجم
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * تنسيق التاريخ
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  
  // أقل من دقيقة
  if (diff < 60 * 1000) return "الآن";
  
  // أقل من ساعة
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `منذ ${minutes} دقيقة`;
  }
  
  // أقل من يوم
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `منذ ${hours} ساعة`;
  }
  
  // أقل من أسبوع
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `منذ ${days} يوم`;
  }
  
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * تنظيف جميع المشاريع (للاختبار)
 */
export function clearAllProjects(): void {
  localStorage.removeItem(PROJECTS_KEY);
}
