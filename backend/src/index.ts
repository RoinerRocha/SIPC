import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./database/SqlServer";

import routerUser from "./routes/user.route";
import routerRoles from "./routes/roles.route";
import routerStates from "./routes/states.route";
import routerPersons from "./routes/persons.route";
import routerDirections from "./routes/directions.route";
import routerContacts from "./routes/contacts.route";
import routerIncomes from "./routes/incomes.router";
import routerPayments from "./routes/payments.route";
import routerObservations from "./routes/observations.router";
import routerFamily from "./routes/family.route";
import routerFiles from "./routes/Files.route";
import routerRequirements from "./routes/requirements.router";
import routerReferrals from "./routes/referrals.route";
import routerReferralsDetails from "./routes/referralsDetails.router";
import routerUbications from "./routes/ubications.route";
import routerNormalizer from "./routes/normalizers.route";
import { exceptionMiddleware } from "./Middleware/exceptionMiddleware";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//rutas archivos
app.use('/Documentos', express.static(path.join(__dirname, '../Documentos')));

// Rutas
app.use("/api", routerUser);
app.use("/api", routerRoles);
app.use("/api", routerStates);
app.use("/api", routerPersons);
app.use("/api", routerDirections);
app.use("/api", routerContacts);
app.use("/api", routerIncomes);
app.use("/api", routerPayments);
app.use("/api", routerObservations);
app.use("/api", routerFamily);
app.use("/api", routerFiles);
app.use("/api", routerRequirements);
app.use("/api", routerReferrals);
app.use("/api", routerReferralsDetails);
app.use("/api", routerUbications);
app.use("/api", routerNormalizer);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




// Registrar middleware de manejo de errores
app.use(exceptionMiddleware);

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    sequelize.authenticate();
    console.log("Connection DataBase has been established successfully. ;)");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
