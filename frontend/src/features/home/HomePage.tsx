import { Typography, Box, Grid, Stack } from "@mui/material";
import ChartUserByCountry from './components/ChartUserByCountry';
import PageViewsBarChart from './components/PageViewsBarChart';
import FilesViewsBarChart from './components/FilesViewsBarChart';
import SessionsChart from './components/SessionsChart';
import CustomizedDataGrid from './components/CustomizedDataGrid';
import StatCard, { StatCardProps } from './components/StatCard';
import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { personModel } from "../../app/models/persons";
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import axios from 'axios';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";

const API_URL = process.env.REACT_APP_BACKEND_URL;

async function fetchPowerBIEmbedInfo() {
  try {
    const response = await axios.post(`${API_URL}getPowerBIEmbedUrl`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo los datos de Power BI:", error);
    return null;
  }
}

declare global {
  interface Window {
    report: any;
  }
}

export default function HomePage() {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null)



  useEffect(() => {
    if (accounts.length > 0) {
      instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
        .then((response) => {
          const token = response.accessToken;
          setAccessToken(token);
          fetchEmbedUrl(token);
        })
        .catch(() => {
          instance.loginRedirect(loginRequest);
        });
    } else {
      instance.loginRedirect(loginRequest);
    }
  }, [accounts, instance]);

  async function fetchEmbedUrl(token: string) {
    try {
      const response = await axios.post(`${API_URL}getPowerBIEmbedUrlWithToken`, { token });
      const { embedUrl, reportId } = response.data;
      // usar estos valores con PowerBIEmbed
    } catch (error) {
      console.error("Error obteniendo embedUrl:", error);
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, mt: 4 }}>
      {accessToken && embedUrl && reportId ? (
        <PowerBIEmbed
          embedConfig={{
            type: "report",
            id: reportId,
            embedUrl: embedUrl, // 🔥 Ahora usamos la URL de Power BI API
            accessToken: accessToken,
            tokenType: models.TokenType.Embed,
            settings: {
              panes: {
                filters: { expanded: false, visible: false },
              },
              background: models.BackgroundType.Transparent,
            },
          }}
          eventHandlers={new Map([
            ["loaded", () => console.log("Reporte cargado")],
            ["rendered", () => console.log("Reporte renderizado")],
            ["visualClicked", () => console.log("Visualización clickeada")],
            ["pageChanged", (event: any) => console.log("Página cambiada:", event)],
          ])}
          cssClassName={"reportClass"}
          getEmbeddedComponent = { (embeddedReport) => {
            window.report = embeddedReport;
          }}
        />
      ) : (
        <p>Cargando Power BI...</p>
      )}
    </Box>
  );
}