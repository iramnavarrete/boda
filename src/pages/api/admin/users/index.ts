import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { UserDoc } from "@/types";
import { FirebaseError } from "firebase-admin";

// ============================================================================
// TIPOS ESTRICTOS
// ============================================================================

type AuthenticatedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void | NextApiResponse>;

// ============================================================================
// MIDDLEWARE (WRAPPER): Valida token y permisos de Root Admin
// ============================================================================

const withRootAdmin = (handler: AuthenticatedHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "No autorizado. Token faltante." });
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await adminAuth.verifyIdToken(token);

      // Verificamos el Custom Claim
      if (!decodedToken.isRootAdmin) {
        return res.status(403).json({
          error: "Acción no permitida. Se requieren permisos de Root Admin.",
        });
      }

      // Si todo está bien, ejecutamos el endpoint real
      return await handler(req, res);
    } catch (error: unknown) {
      console.error("Error en middleware de autenticación:", error);
      return res.status(401).json({ error: "No autorizado o token inválido." });
    }
  };
};

// ============================================================================
// HANDLER PRINCIPAL (Endpoint)
// ============================================================================

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ------------------------------------------------------------------------
  // CREAR USUARIO (POST)
  // ------------------------------------------------------------------------
  if (req.method === "POST") {
    try {
      const { email, password, isRootAdmin, invitationsMap } = req.body as {
        email?: string;
        password?: string;
        isRootAdmin?: boolean;
        invitationsMap?: Record<string, "admin" | "host" | "guardia">;
      };

      if (!email || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      // Crear usuario en Auth
      const userRecord = await adminAuth.createUser({ email, password });

      // Inyectar Custom Claims (Roles Híbridos e isRootAdmin)
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        isRootAdmin: isRootAdmin || false,
        roles: invitationsMap || {}, // Guardamos el mapa de bodas/roles aquí
      });

      // Documento Firestore
      const newUserDoc: UserDoc = {
        uid: userRecord.uid,
        email: userRecord.email!,
        isRootAdmin: isRootAdmin || false,
        invitationsMap: invitationsMap || {},
        createdAt: new Date().toISOString(),
      };

      await adminDb.collection("users").doc(userRecord.uid).set(newUserDoc);

      return res.status(201).json(newUserDoc);
    } catch (error: unknown) {
      console.error("Error creando usuario:", error);
      if (error && typeof error === "object" && "code" in error) {
        if ((error as FirebaseError).code === "auth/email-already-exists") {
          return res
            .status(409)
            .json({ error: "El correo electrónico ya está registrado." });
        }
      }
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }

  // ------------------------------------------------------------------------
  // ACTUALIZAR USUARIO (PUT)
  // ------------------------------------------------------------------------
  if (req.method === "PUT") {
    try {
      const { uid, email, password, isRootAdmin, invitationsMap } =
        req.body as {
          uid?: string;
          email?: string;
          password?: string;
          isRootAdmin?: boolean;
          invitationsMap?: Record<string, "admin" | "host" | "guardia">;
        };

      if (!uid) {
        return res.status(400).json({ error: "Falta el UID del usuario" });
      }

      // Actualizar credenciales en Auth (si aplican)
      const updateAuthData: { email?: string; password?: string } = {};
      if (email) updateAuthData.email = email;
      if (password) updateAuthData.password = password;

      if (Object.keys(updateAuthData).length > 0) {
        await adminAuth.updateUser(uid, updateAuthData);
      }

      // Actualizar Custom Claims
      // Primero leemos los claims actuales para no perder data si es un update parcial
      const userRecord = await adminAuth.getUser(uid);
      const currentClaims = userRecord.customClaims || {};

      const newClaims = {
        ...currentClaims,
        isRootAdmin:
          isRootAdmin !== undefined ? isRootAdmin : currentClaims.isRootAdmin,
        roles:
          invitationsMap !== undefined ? invitationsMap : currentClaims.roles,
      };

      await adminAuth.setCustomUserClaims(uid, newClaims);

      // Actualizar Firestore
      const updateDocData: Partial<UserDoc> = {};
      if (isRootAdmin !== undefined) updateDocData.isRootAdmin = isRootAdmin;
      if (invitationsMap !== undefined)
        updateDocData.invitationsMap = invitationsMap;
      if (email) updateDocData.email = email;

      await adminDb.collection("users").doc(uid).update(updateDocData);

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error("Error actualizando usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }

  // ------------------------------------------------------------------------
  // ELIMINAR USUARIO (DELETE)
  // ------------------------------------------------------------------------
  if (req.method === "DELETE") {
    try {
      const { uid } = req.query;

      if (!uid || typeof uid !== "string") {
        return res.status(400).json({ error: "Falta el UID del usuario" });
      }

      await adminAuth.deleteUser(uid);
      await adminDb.collection("users").doc(uid).delete();

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error("Error eliminando usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }

  res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withRootAdmin(handler);
