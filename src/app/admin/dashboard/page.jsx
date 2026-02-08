// app/admin/dashboard/page.jsx (Updated)
import DashboardWithRevalidation from "./DashboardWithRevalidation"

/**
 * Dashboard Page - ببساطة يستدعي الكومبوننت الجديد
 */
export default function AdminDashboard() {
  return <DashboardWithRevalidation />
}

/**
 * Metadata للصفحة
 */
export const metadata = {
  title: "Admin Dashboard - Dawer Sah",
  description: "Admin panel for managing products and website content",
  robots: "noindex, nofollow", // منع indexing للصفحة الإدارية
}