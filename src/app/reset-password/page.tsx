import Image from "next/image";
import Link from "next/link";

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Reset Password Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Reset Password</h1>
          <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Send Reset Link
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
      {/* Image Section */}
      <div className="flex-1 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
        <div className="text-center">
          <Image src="/next.svg" alt="RevLock Logo" loading="eager" className="w-32 h-32 mx-auto mb-4" width={128} height={128} />
          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
          <p className="text-white opacity-90">We&apos;ll help you get back in.</p>
        </div>
      </div>
    </div>
  );
}
