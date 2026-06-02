"use client";

import type { UserDTO } from "@monmate/types";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "../../components/BrandLogo";
import { apiFetch } from "../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    setMessage("");
    const response = await apiFetch<{ token: string; user: UserDTO }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password })
      }
    );

    if (!response.success || !response.data) {
      setMessage(response.error?.message ?? "登入失敗");
      return;
    }

    window.localStorage.setItem("monmate.token", response.data.token);
    setMessage(`已登入：${response.data.user.name}`);
    router.push("/admin");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-sm rounded-lg border border-charcoal/10 bg-white p-6 shadow-soft">
        <BrandLogo variant="slogan" className="mx-auto h-28 w-64 object-contain" />
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
          />

          <label className="block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-lg border border-charcoal/15 bg-paper px-3 outline-none focus:border-mint"
          />

          <button
            type="button"
            onClick={login}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange font-bold text-white"
          >
            <LogIn size={18} />
            登入後台
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
              const response = await apiFetch<{ token: string; user: UserDTO }>(
                "/auth/google",
                {
                  method: "POST",
                  body: JSON.stringify({ credential: credentialResponse.credential })
                }
              );
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
            shape="rectangular"
            size="large"
          />
        </div>

        {message ? (
          <p className="mt-4 rounded-lg bg-mint/20 px-3 py-2 text-sm font-semibold">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
