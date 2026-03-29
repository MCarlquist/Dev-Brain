import { Outlet, createFileRoute } from '@tanstack/react-router'
import Sidebar from '#/components/dashboard/Sidebar'




export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-(--bg-base) text-foreground">
      <Sidebar />
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  )
}
