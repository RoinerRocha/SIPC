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

const groupId = "7a10c078-bee7-4a28-bdad-b388a50fbb37";
const reportId = "03b77af4-b4dc-4219-99b8-f5663bcfec6d";
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

export default function HomePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPowerBIEmbedInfo().then(data => {
      if (data) {
        setAccessToken(data.accessToken);
        setEmbedUrl(data.embedUrl);
      } else {
        console.error("No se pudo obtener la información de Power BI.");
      }
    });
  }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, mt: 4 }}>
      {accessToken && embedUrl ? (
        <PowerBIEmbed
          embedConfig={{
            type: "report",
            id: "03b77af4-b4dc-4219-99b8-f5663bcfec6d",
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
        />
      ) : (
        <p>Cargando Power BI...</p>
      )}
    </Box>
  );
}