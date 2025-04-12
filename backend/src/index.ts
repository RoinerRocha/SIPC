import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./database/SqlServer";
import { Request, Response } from "express";
import qs from "qs";
import axios from "axios";

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
import routerFilesState from "./routes/FilesState.route";
import routerSubState from "./routes/substate.route";
import { exceptionMiddleware } from "./Middleware/exceptionMiddleware";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

//rutas archivos


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
app.use("/api", routerFilesState);
app.use("/api", routerSubState);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  res.send('¡Hola desde Express en Azure1!');
});


// 🔄 Cambia este endpoint en el backend
app.post("/api/getPowerBIEmbedUrl", async (req: Request, res: Response): Promise<void> => {
  try {
    const { CLIENT_ID, CLIENT_SECRET, TENANT_ID } = process.env;
    const WORKSPACE_ID = "7a10c078-bee7-4a28-bdad-b388a50fbb37";
    const REPORT_ID = "03b77af4-b4dc-4219-99b8-f5663bcfec6d";

    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const data = qs.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://analysis.windows.net/powerbi/api/.default"
    });

    const tokenResponse = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenResponse.data.access_token;

    const me = await axios.get("https://api.powerbi.com/v1.0/myorg/groups", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log("🔍 WORKSPACES disponibles:", me.data.value);

    // 👉 Crear embed token con API de Power BI
    const embedTokenResponse = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}/GenerateToken`,
      {
        accessLevel: "view" // o "edit" si necesitas edición
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const embedToken = embedTokenResponse.data.token;

    // Obtener URL del reporte
    const reportInfo = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const embedUrl = reportInfo.data.embedUrl;

    res.status(200).json({ accessToken: embedToken, embedUrl, reportId: REPORT_ID });
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al generar token de embebido", details: error.message });
  }
});

// Registrar middleware de manejo de errores
app.use(exceptionMiddleware);

const PORT = process.env.PORT || 3001;

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
