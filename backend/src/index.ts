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
app.use("/api", routerFilesState);
app.use("/api", routerSubState);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.get("/api/loginAzure", (req: Request, res: Response): void => {
  const { CLIENT_ID, TENANT_ID, REDIRECT_URI } = process.env;
  if (!CLIENT_ID || !TENANT_ID || !REDIRECT_URI) {
    res.status(500).json({ error: "Faltan valores de configuración en .env" });
    return;
  }

  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_mode=query&scope=https://analysis.windows.net/powerbi/api/.default offline_access openid profile email`;
  res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  const { CLIENT_ID, CLIENT_SECRET, TENANT_ID, REDIRECT_URI } = process.env;

  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const data = qs.stringify({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://analysis.windows.net/powerbi/api/.default"
  });

  try {
    const tokenResponse = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenResponse.data.access_token;

    // Redirige a tu app con el token
    res.redirect(`/embed?access_token=${accessToken}`);
  } catch (error: any) {
    console.error("Error intercambiando el código por un token:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en el flujo OAuth" });
  }
});

app.post("/api/getPowerBIEmbedUrlWithToken", async (req: Request, res: Response) => {
  const token = req.body.token;
  const WORKSPACE_ID = "7a10c078-bee7-4a28-bdad-b388a50fbb37";
  const REPORT_ID = "03b77af4-b4dc-4219-99b8-f5663bcfec6d";

  try {
    const powerBiApiUrl = `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}`;
    const powerBiResponse = await axios.get(powerBiApiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const embedUrl = powerBiResponse.data.embedUrl;
    res.status(200).json({ accessToken: token, embedUrl, reportId: REPORT_ID });
  } catch (error: any) {
    console.error("Error al obtener embedUrl:", error.response?.data || error.message);
    res.status(500).json({ error: "No se pudo obtener el embedUrl" });
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
