import { Model, DataTypes } from "sequelize";
import sequelize from "../database/SqlServer";

class DirectionModel extends Model {
    public id_direccion!: number;
    public id_persona!: number;
    public provincia!: string;
    public canton!: string;
    public distrito!: string;
    public barrio?: string;
    public otras_senas!: string;
    public tipo_direccion!: string;
    public estado!: string;
  
  }
  
  try {
    DirectionModel.init(
      {
        id_direccion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        provincia: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        canton: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        distrito: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        barrio: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        otras_senas: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        tipo_direccion: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "Direccion",
        schema: "dbo",
      }
    );
  } catch (error: any) {
    console.log("Error en modelo Persona: " + error.message);
  }
  
  sequelize
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
  
export default DirectionModel;