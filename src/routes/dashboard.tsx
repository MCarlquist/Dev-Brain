import { Outlet, createFileRoute } from '@tanstack/react-router'
import Sidebar from '#/components/dashboard/Sidebar'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-[var(--bg-base)] text-[var(--foreground)]">
      <Sidebar />
      <main className="flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
