import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { AuthService } from "@/services/authService";
import { useToast } from "@/features/shared/components/Toast";
import { FirebaseError } from "firebase/app";

export function useAuthLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Verificar sesión iniciada
  useEffect(() => {
    const unsubscribe = AuthService.onUserChange((user) => {
      if (user) {
        router.replace("/admin");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Handler para Email y Contraseña
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Por favor ingresa tus credenciales", "error");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      let msg = "Error al iniciar sesión";

      if (firebaseError?.code === "auth/invalid-credential") {
        msg = "Credenciales incorrectas";
      }

      toast(msg, "error");
      setLoading(false);
    }
  };

  // Handler para Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      let msg = "No se pudo conectar con Google";

      switch (firebaseError?.code) {
        case "auth/popup-closed-by-user":
          msg = "Cancelaste el inicio de sesión";
          break;
        case "auth/popup-blocked":
          msg = "Tu navegador bloqueó la ventana emergente";
          break;
        case "auth/cancelled-popup-request":
          msg = "Se canceló la petición porque abriste otra";
          break;
        case "auth/account-exists-with-different-credential":
          msg = "Este correo ya está registrado con otro método";
          break;
        case "auth/network-request-failed":
          msg = "Error de red. Revisa tu conexión a internet";
          break;
        case "auth/unauthorized-domain":
          msg = "Dominio no autorizado en Firebase";
          break;
        default:
          console.error("Error completo de Google Login:", error);
          break;
      }

      toast(msg, "error");
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    checkingAuth,
    handleEmailLogin,
    handleGoogleLogin,
  };
}
