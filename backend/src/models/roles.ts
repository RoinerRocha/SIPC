import { Model, DataTypes } from "sequelize";
import sequelize from "../database/SqlServer";

class rolesModel extends Model {
    public id!: number;
    public rol!: string;

    public readonly fecha_creacion!: Date;
    public readonly fecha_modificacion!: Date;
}

try {
    rolesModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        rol: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
  
        tableName: "Roles",
        schema: "dbo",
      }
    );
  } catch (error: any) {
    console.log("error en modelo roles: " + error.message);
  }
  sequelize
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
  
export default rolesModel;