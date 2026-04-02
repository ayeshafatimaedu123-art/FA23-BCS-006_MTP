/**
 * Footer Component
 */

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-4">AdFlow Pro</div>
            <p className="text-gray-400 text-sm">
              Premium sponsored listing marketplace platform
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="/explore" className="hover:text-white transition">Browse Ads</a></li>
              <li><a href="/packages" className="hover:text-white transition">Packages</a></li>
              <li><a href="/about" className="hover:text-white transition">About</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
              <li><a href="/pricing" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="/privacy" className="hover:text-white transition">Privacy</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms</a></li>
              <li><a href="/cookies" className="hover:text-white transition">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 AdFlow Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
