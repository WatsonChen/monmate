"use client";

import type { UserDTO } from "@monmate/types";
import { LogIn, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "../../components/BrandLogo";
import { apiFetch } from "../../lib/api";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await apiFetch<{ token: string; user: UserDTO }>(
        "auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );

      if (!response.success || !response.data) {
        setError(response.error?.message ?? "帳號或密碼錯誤，請再試一次");
        return;
      }

      const { token, user } = response.data;
      if (user.role !== "STAFF") {
        setError("此帳號非工作人員帳號，請使用後台登入頁面");
        return;
      }

      window.localStorage.setItem("monmate.token", token);
      router.push("/staff/scan");
    } catch {
      setError("無法連線到伺服器，請檢查網路後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-5 py-10">
      <section className="w-full max-w-sm rounded-lg border border-charcoal/10 bg-white p-6 shadow-soft">
        <BrandLogo
          variant="slogan"
          className="mx-auto h-28 w-64 object-contain"
        />
        <p className="mt-2 text-center text-sm font-semibold text-charcoal/60">
          工作人員登入
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-2 h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold">
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void login()}
              disabled={loading}
              className="mt-2 h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={() => void login()}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange font-bold text-white disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                登入中…
              </>
            ) : (
              <>
                <LogIn size={18} />
                登入報到系統
              </>
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
