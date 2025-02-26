import { Model, DataTypes } from "sequelize";
import sequelize from "../database/SqlServer";

class PersonaModel extends Model {
  public id_persona!: number;
  public tipo_identificacion!: string;
  public numero_identifiacion!: string;
  public nombre!: string;
  public primer_apellido!: string;
  public segundo_apellido?: string;
  public fecha_nacimiento!: Date;
  public genero!: string;
  public estado_civil!: string;
  public nacionalidad!: string;
  public fecha_registro!: Date;
  public usuario_registro!: string;
  public nivel_estudios?: string;
  public asesor?: string;
  public estado!: string;

}

try {
  PersonaModel.init(
    {
      id_persona: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      tipo_identificacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numero_identifiacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      primer_apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      segundo_apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      genero: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      estado_civil: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      nacionalidad: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usuario_registro: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nivel_estudios: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      asesor: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "ACTIVO",
      },
    },
    {
      sequelize,
      tableName: "Persona",
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

export default PersonaModel;