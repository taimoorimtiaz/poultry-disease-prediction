export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Poultry Disease Prediction System. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Built with Django REST Framework & React
        </p>
      </div>
    </footer>
  )
}
