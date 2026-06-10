import { Card } from '../components/ui/Card'

/** Placeholder page for Donors */
export function DonorsPage() {
  return (
    <section className="p-4">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Donors</h1>
      <div className="flex justify-center">
        <Card className="p-6">
          <p className="text-gray-600">Donors content will be displayed here.</p>
        </Card>
      </div>
    </section>
  )
}
