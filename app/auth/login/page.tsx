"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Loader2, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { push } = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (res?.error) {
        setErrorMsg("Login failed. Please check your credentials.");
      } else {
        push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* BAGIAN KIRI: Ilustrasi (White Background) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-white p-12 relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
            Brother Cell
          </h1>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Menggunakan ilustrasi placeholder yang mirip dengan referensi */}
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" alt="Login Illustration" className="max-w-md w-full drop-shadow-xl" />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Kelola Bisnis Tanpa Batas</h2>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">Platform terintegrasi untuk manajemen stok voucher dan transaksi offline-to-online.</p>
          </div>
        </div>

        {/* Dekorasi Dot Pattern */}
        <div className="absolute top-10 right-10 opacity-10">
          <svg width="100" height="100" fill="none">
            <defs>
              <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" className="text-blue-600" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dot-pattern)" />
          </svg>
        </div>
      </div>

      {/* BAGIAN KANAN: Form (Blue Background) */}
      <div className="w-full lg:w-1/2 bg-blue-600 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Dekorasi Background Lengkungan (Sesuai Referensi) */}
        <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400 rounded-full opacity-30 blur-3xl"></div>
          {/* Garis Lengkung Putih Transparan */}
          <svg className="absolute bottom-0 right-0 opacity-10" width="400" height="400" viewBox="0 0 400 400" fill="none">
            <path d="M0 400 C 150 400, 400 150, 400 0" stroke="white" strokeWidth="2" />
            <path d="M50 400 C 180 400, 400 180, 400 50" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Card Putih Mengapung */}
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 transition-all duration-300 hover:shadow-blue-900/20">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Halo!</h2>
            <p className="text-gray-500 mt-2">Masuk untuk mengakses Dashboard Owner.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Username */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Ingat saya
                </label>
              </div>
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Lupa Password?
              </button>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <button type="button" className="font-bold text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4">
                Daftar Sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
