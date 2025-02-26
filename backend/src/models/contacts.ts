import { Model, DataTypes } from "sequelize";
import sequelize from "../database/SqlServer";

class ContactsModel extends Model {
    public id_contacto!: number;
    public id_persona!: number;
    public tipo_contacto!: string;
    public identificador!: string;
    public estado!: string;
    public fecha_registro!: Date;
    public comentarios!: string;
  
  }
  
  try {
    ContactsModel.init(
      {
        id_contacto: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo_contacto: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        identificador: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        fecha_registro: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        comentarios: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "Contactos",
        schema: "dbo",
      }
    );
  } catch (error: any) {
    console.log("Error en modelo Contactos: " + error.message);
  }
  
  sequelize
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
  
export default ContactsModel;