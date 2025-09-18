export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-4 text-center">
      <p className="text-sm">
        © {new Date().getFullYear()} Task Management System All rights reserved.
      </p>
    </footer>
  )
}
