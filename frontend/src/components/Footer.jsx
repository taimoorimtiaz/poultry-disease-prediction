export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="glass-panel rounded-2xl px-6 py-5 text-center border border-white/50 shadow-lg">
          <p className="text-sm font-semibold text-gray-800">
            &copy; {new Date().getFullYear()} Poultry Disease Prediction System
          </p>
          <p className="text-xs text-gray-500 mt-1">Built with Django REST Framework & React</p>
        </div>
      </div>
    </footer>
  )
}
