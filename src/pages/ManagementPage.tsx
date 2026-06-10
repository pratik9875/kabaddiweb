import { Card } from '../components/ui/Card'

/** Placeholder page for Management members */
export function ManagementPage() {
  return (
    <section className="p-4">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Management</h1>
      <div className="flex justify-center">
        <Card className="p-6">
          <p className="text-gray-600">Management content will be displayed here.</p>
        </Card>
      </div>
    </section>
  )
}
