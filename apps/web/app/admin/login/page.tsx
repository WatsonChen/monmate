"use client";

import type { UserDTO } from "@monmate/types";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "../../components/BrandLogo";
import { apiFetch } from "../../lib/api";
import { DotsLoading } from "../../components/DotsLoading";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (loading) return;
    setMessage("");
    setLoading(true);
    const response = await apiFetch<{ token: string; user: UserDTO }>(
      "auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    setLoading(false);

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "登入失敗");
      return;
    }

    const { token, user } = response.data;
    window.localStorage.setItem("monmate.token", token);
    router.push(user.role === "STAFF" ? "/staff/scan" : "/admin");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-sm rounded-lg border border-charcoal/10 bg-white p-6 shadow-soft">
        <BrandLogo variant="slogan" className="mx-auto h-28 w-64 object-contain" />

        {message && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {message}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold" htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void login()}
              className="mt-2 h-10 w-full rounded-xl border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={() => void login()}
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange font-bold text-white disabled:opacity-70"
          >
            {!loading && <LogIn size={18} />}
            {loading ? <>登入中<DotsLoading /></> : "登入"}
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
              setMessage("");
              setLoading(true);
              const response = await apiFetch<{ token: string; user: UserDTO }>(
                "/auth/google",
                { method: "POST", body: JSON.stringify({ credential: credentialResponse.credential }) },
              );
              setLoading(false);
              if (!response.success || !response.data) {
                setMessage(response.error?.message ?? "Google 登入失敗");
                return;
              }
              window.localStorage.setItem("monmate.token", response.data.token);
              router.push("/admin");
            }}
            onError={() => setMessage("Google 登入失敗，請再試")}
            locale="zh-TW"
            text="signin_with"
            shape="pill"
            size="large"
          />
        </div>
      </section>
    </main>
  );
}
