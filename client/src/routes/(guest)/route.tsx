import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(guest)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/(guest)"!
      <Outlet />
    </div>
  )
}
