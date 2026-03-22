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

// 1. Diccionario de errores de Firebase
const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "El correo o la contraseña son incorrectos.",
  "auth/user-not-found": "No existe una cuenta con este correo.",
  "auth/wrong-password": "La contraseña es incorrecta.",
  "auth/invalid-email": "El formato del correo electrónico no es válido.",
  "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
  "auth/popup-closed-by-user": "Cancelaste el inicio de sesión.",
  "auth/popup-blocked": "Tu navegador bloqueó la ventana emergente.",
  "auth/cancelled-popup-request": "Se canceló la petición porque abriste otra.",
  "auth/account-exists-with-different-credential":
    "Este correo ya está registrado con otro método.",
  "auth/network-request-failed": "Error de red. Revisa tu conexión a internet.",
  "auth/unauthorized-domain": "Dominio no autorizado en Firebase.",
};

// 2. Función Helper para procesar el error
const getAuthErrorMessage = (
  error: unknown,
  defaultMessage = "Ocurrió un error inesperado",
) => {
  if (error instanceof FirebaseError) {
    // Retorna el mensaje del diccionario o el mensaje por defecto si el código no está mapeado
    return FIREBASE_ERRORS[error.code] || `Error interno: ${error.code}`;
  }
  return defaultMessage;
};

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
      const msg = getAuthErrorMessage(error, "Error al iniciar sesión");
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
      const msg = getAuthErrorMessage(error, "No se pudo conectar con Google");

      // Solo logueamos en consola si no es un FirebaseError mapeado (para debugear cosas raras)
      if (!(error instanceof FirebaseError) || !FIREBASE_ERRORS[error.code]) {
        console.error("Error completo de Google Login:", error);
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
