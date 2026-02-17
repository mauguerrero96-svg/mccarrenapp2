export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏓</h1>
          <h2 className="text-xl font-semibold text-gray-800">Mccarren Tournament</h2>
        </div>
        {children}
      </div>
    </div>
  );
}