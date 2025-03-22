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
import { loginRequest } from "../../authConfig";
import './HomePage.css';


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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null)

  useEffect(() => {
    fetchPowerBIEmbedInfo().then(data => {
      if (data) {
        console.log("✅ AccessToken obtenido:", data.accessToken);
        console.log("✅ EmbedURL obtenida:", data.embedUrl);
        console.log("✅ ReportId obtenido:", data.reportId);
        setAccessToken(data.accessToken);
        setEmbedUrl(data.embedUrl);
        setReportId(data.reportId);
      } else {
        console.error("No se pudo obtener la información de Power BI.");
      }
    });
  }, []);

  return (
    <Box sx={{ width: "95%", p: 0 }}>
      {accessToken && embedUrl && reportId ? (
        <PowerBIEmbed
          embedConfig={{
            type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
            id: reportId,
            embedUrl: embedUrl,
            accessToken: accessToken,
            tokenType: models.TokenType.Embed, // Use models.TokenType.Aad for SaaS embed
            settings: {
              panes: {
                filters: {
                  expanded: false,
                  visible: false
                }
              },
              background: models.BackgroundType.Transparent,
            }
          }}

          eventHandlers={
            new Map([
              ['loaded', function () { console.log('Report loaded'); }],
              ['rendered', function () { console.log('Report rendered'); }],
              ['error', (event: any) => console.error(event.detail)],
              ['visualClicked', () => console.log('visual clicked')],
              ['pageChanged', (event) => console.log(event)],
            ])
          }

          cssClassName="report-style-class"

          getEmbeddedComponent={(embeddedReport) => {
            window.report = embeddedReport;
          }}
        />
      ) : (
        <p>Cargando Power BI...</p>
      )}
    </Box>
  );
}
