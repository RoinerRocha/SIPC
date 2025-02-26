import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { roleModels } from "../../app/models/roleModels";
import RolesList from "./rolesList";

export default function NewRoles() {
  const [role, setRole] = useState<roleModels[]>([]);

  useEffect(() => {
    api.roles
      .getRoles()
      .then((response) => {
        if (response && Array.isArray(response.data)) {
          setRole(response.data);
        } else {
          console.error(
            "La respuesta de la API no es un array de Perfil de Usuario:",
            response
          );
        }
      })
      .catch((error) =>
        console.error("Error al obtener Perfil de Usuario:", error)
      );
  }, []);

  if (!Array.isArray(role)) {
    console.error("El valor del Perfil de Usuario no es un array:", role);
    return <div>Error: No se pudieron cargar los Perfil de Usuario.</div>;
  }

  return (
    <>
      <RolesList roles={role} setRoles={setRole} />
    </>
  );
}
