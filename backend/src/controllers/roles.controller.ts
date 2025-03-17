import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const saveRoles = async (req: Request, res: Response): Promise<void> => {
  const { rol, permisos } = req.body;

  try {
    await sequelize.query(
      "EXEC sp_gestion_roles @Action = 'I',  @rol = :rol, @permisos = :permisos",
      {
        replacements: {
          rol,
          permisos: JSON.stringify(permisos)
        },
        type: QueryTypes.INSERT, // Tipo de operación, ya que estamos insertando un nuevo rol
      }
    );

    res.status(201).json({ message: "Rol creado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


// Método para obtener todos los perfiles
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await sequelize.query(
      "EXEC sp_gestion_roles @Action = 'Q'",
      {
        type: QueryTypes.SELECT, // Tipo de operación SELECT
      }
    );

    const formattedRoles = roles.map((role: any) => ({
      ...role,
      permisos: role.permisos ? JSON.parse(role.permisos) : [], // 🔹 Parsear permisos
    }));

    res.status(200).json({ message: "Listado de roles exitoso", data: formattedRoles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Método para eliminar un perfil por ID
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const roleId = req.params.id;

  try {
    await sequelize.query(
      "EXEC sp_gestion_roles @Action = 'D', @id = :id",
      { replacements: { id: roleId }, type: QueryTypes.DELETE }
    );

    res.status(200).json({ message: "Rol eliminado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Método para actualizar un perfil
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  const roleId = req.params.id;
  const { rol, permisos } = req.body;

  try {
    await sequelize.query(
      "EXEC sp_gestion_roles @Action = 'U', @id = :id, @rol = :rol, @permisos = :permisos",
      {
        replacements: {
          id: roleId,
          rol,
          permisos: JSON.stringify(permisos)
        },
        type: QueryTypes.UPDATE, // Tipo de operación UPDATE
      }
    );

    res.status(200).json({ message: "Rol actualizado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};