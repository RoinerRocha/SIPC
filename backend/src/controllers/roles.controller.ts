import { Request, Response } from "express";
import rolesModel from "../models/roles";
import { QueryTypes } from "sequelize"; 
import sequelize from "../database/SqlServer";

export const saveRoles = async (req: Request, res: Response): Promise<void> => {
  const { rol } = req.body;

  try {
    await sequelize.query(
      "EXEC sp_gestion_roles @Action = 'I',  @rol = :rol",
      {
        replacements: {
          rol,
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

    res.status(200).json({ message: "Listado de roles exitoso", data: roles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
  
  // Método para eliminar un perfil por ID
  export const deleteRole = async (req: Request, res: Response) => {
    const roleId = req.params.id;
  
    try {
      const deleted = await rolesModel.destroy({
        where: { id: roleId },
      });
  
      if (deleted === 0) {
        res.status(404).json({ message: "Role not found" });
        return;
      }
  
      res.status(200).json({ message: "Delete role successful" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Método para actualizar un perfil
  export const updateRole = async (req: Request, res: Response): Promise<void> => {
    const roleId = req.params.id;
    const { rol } = req.body;
  
    try {
      await sequelize.query(
        "EXEC sp_gestion_roles @Action = 'U', @id = :id, @rol = :rol",
        {
          replacements: {
            id: roleId,
            rol,
          },
          type: QueryTypes.UPDATE, // Tipo de operación UPDATE
        }
      );
  
      res.status(200).json({ message: "Rol actualizado exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };