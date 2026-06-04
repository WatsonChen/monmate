"use client";

import type { UserDTO } from "@monmate/types";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "../../components/BrandLogo";
import { apiFetch } from "../../lib/api";

export default function AdminLoginPage() {
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
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password })
        }
      );

      if (!response.success || !response.data) {
        setError(response.error?.message ?? "帳號或密碼錯誤，請再試一次");
        return;
      }

      window.localStorage.setItem("monmate.token", response.data.token);
      router.push("/admin");
    } catch {
      setError("無法連線到伺服器，請檢查網路後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-sm rounded-lg border border-charcoal/10 bg-white p-6 shadow-soft">
        <BrandLogo variant="slogan" className="mx-auto h-28 w-64 object-contain" />
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            className="h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint disabled:opacity-50"
          />

          <label className="block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            disabled={loading}
            className="h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint disabled:opacity-50"
          />

          <button
            type="button"
            onClick={login}
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
                登入後台
              </>
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-charcoal/10" />
          <span className="text-xs font-semibold text-charcoal/40">或</span>
          <div className="h-px flex-1 bg-charcoal/10" />
        </div>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (!credentialResponse.credential) return;
              setError("");
              setLoading(true);
              try {
                const response = await apiFetch<{ token: string; user: UserDTO }>(
                  "/auth/google",
                  {
                    method: "POST",
                    body: JSON.stringify({ credential: credentialResponse.credential })
                  }
                );
                if (!response.success || !response.data) {
                  setError(response.error?.message ?? "Google 登入失敗，請再試");
                  return;
                }
                window.localStorage.setItem("monmate.token", response.data.token);
                router.push("/admin");
              } catch {
                setError("無法連線到伺服器，請檢查網路後再試");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => setError("Google 登入失敗，請再試")}
            locale="zh-TW"
            text="signin_with"
            shape="rectangular"
            size="large"
          />
        </div>

      </section>
    </main>
  );
}
