import { AuthInitializer } from "@/features/admin/components/AuthInitializer";
import { ToastProvider } from "@/features/shared/components/Toast";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthInitializer />
      <Component {...pageProps} />
    </ToastProvider>
  );
}
