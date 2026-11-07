export const metadata = {
  title: 'Maintenance Required - Tucker Trips',
  description: 'Tucker Trips is temporarily unavailable while we perform maintenance.',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-teal-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
        <div className="mb-2 text-3xl font-bold text-pink-500">Tucker Trips</div>
        <p className="mb-8 text-sm text-teal-500">Real trips. Real friends. Real trust.</p>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">Maintenance Required</h1>
        <p className="text-gray-600">
          We&apos;re temporarily offline while we take care of some maintenance. Please check back
          soon.
        </p>
      </div>
    </main>
  )
}
