import { Model, DataTypes } from "sequelize";
import sequelize from "../database/SqlServer";

class statesModel extends Model {
    public id!: number;
    public estado!: string;

    public readonly fecha_creacion!: Date;
    public readonly fecha_modificacion!: Date;
}

try {
    statesModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        estado: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
  
        tableName: "Estados",
        schema: "dbo",
      }
    );
  } catch (error: any) {
    console.log("error en modelo states: " + error.message);
  }
  sequelize
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
  
export default statesModel;