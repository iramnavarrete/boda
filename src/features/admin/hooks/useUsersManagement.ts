import { useState, useEffect, useMemo, useCallback } from "react";
import { UserDoc } from "@/types";
import { auth, db } from "@/lib/firebase/config"; // Ajustado a tu ruta real
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/features/shared/components/Toast";

export const useUsersManagement = () => {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: UserDoc[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as UserDoc);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      toast("Error al cargar la lista de usuarios.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.uid.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  const handleDeleteUser = async (uid: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No hay usuario autenticado");
      const token = await currentUser.getIdToken();

      // Ajustado para Pages Router: /api/admin/users
      const response = await fetch(`/api/admin/users?uid=${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar el usuario");

      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      toast("Usuario eliminado correctamente.", "success");
    } catch (error: unknown) {
      console.error(error);
      toast(
        (error as Error).message || "Ocurrió un error al eliminar.",
        "error",
      );
    }
  };

  const handleSaveUser = async (
    userData: UserDoc & { password?: string },
    isEditing: boolean,
  ) => {
    setIsSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Debes iniciar sesión.");
      const token = await currentUser.getIdToken();

      const method = isEditing ? "PUT" : "POST";
      const response = await fetch("/api/admin/users", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Error al ${isEditing ? "actualizar" : "crear"} usuario`,
        );
      }

      if (isEditing) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === userData.uid ? userData : u)),
        );
        toast("Usuario actualizado correctamente.", "success");
      } else {
        const savedUserDoc = await response.json();
        setUsers((prev) => [...prev, savedUserDoc]);
        toast("Usuario creado exitosamente.", "success");
      }
      return true; // Retorna true si fue exitoso para cerrar el modal
    } catch (error: unknown) {
      console.error(error);
      toast(
        (error as Error).message || "Ocurrió un error inesperado.",
        "error",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    users: filteredUsers,
    totalUsers: users.length,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    handleDeleteUser,
    handleSaveUser,
  };
};
