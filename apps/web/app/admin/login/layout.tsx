import { Providers } from "../../components/Providers";

// Google 登入只有登入頁用得到。放在這裡而不是根 layout，
// 公開頁面（首頁、價格、情境頁）就不會載入 accounts.google.com 的腳本與第三方 Cookie。
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
