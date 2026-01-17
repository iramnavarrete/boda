import { AuthInitializer } from "@/features/admin/components/AuthInitializer";
import ProtectedPage from "@/features/admin/components/ProtectedPage";
import { ToastProvider } from "@/features/shared/components/Toast";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/admin");

  return (
    <ToastProvider>
      <AuthInitializer />
      {isAdminRoute ? (
        <ProtectedPage>
          <Component {...pageProps} />
        </ProtectedPage>
      ) : (
        <Component {...pageProps} />
      )}
    </ToastProvider>
  );
}
