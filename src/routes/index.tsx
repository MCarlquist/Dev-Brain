import { Button } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="page-wrap">
      <h1 className="text-3xl font-bold">Welcome to Dev Brain</h1>
      <p className="mt-4 text-lg text-sea-ink">
        Your personal code snippet manager and project organizer.
      </p>
      <Button className="mt-6" onClick={() => alert('Get Started!')}>
        Get Started
      </Button>
    </div>
  )
}
