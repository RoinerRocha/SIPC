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



// const data: StatCardProps[] = [
//   {
//     title: 'Users',
//     value: '14k',
//     interval: 'Last 30 days',
//     trend: 'up',
//     data: [
//       200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
//       360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
//     ],
//   },
//   {
//     title: 'Conversions',
//     value: '325',
//     interval: 'Last 30 days',
//     trend: 'down',
//     data: [
//       1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820,
//       780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300, 220,
//     ],
//   },
//   {
//     title: 'Event count',
//     value: '200k',
//     interval: 'Last 30 days',
//     trend: 'neutral',
//     data: [
//       500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530,
//       520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
//     ],
//   },
// ];

export default function HomePage() {
  const [data, setData] = useState<StatCardProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.persons.getPersons();
        const persons: personModel[] = response.data;
        const totalMujeres = persons.filter(
          (person: personModel) => person.genero === "FEMENINO"
        ).length;
        const totalHombres = persons.filter(
          (person: personModel) => person.genero === "MASCULINO"
        ).length;

        // Simulación de métricas basadas en personas
        const totalPersons = persons.length;
        const newRegistrations = persons.filter((person: personModel) => {
          const registrationDate = new Date(person.fecha_registro);
          const now = new Date();
          return (
            registrationDate.getMonth() === now.getMonth() &&
            registrationDate.getFullYear() === now.getFullYear()
          );
        }).length;

        setData([
          {
            title: "Total de Beneficiarios",
            value: `${totalPersons}`,
            interval: "Últimos 30 días",
            trend: "up",
            data: Array(30).fill(totalPersons / 30),
          },
          {
            title: "Total de Mujeres",
            value: `${totalMujeres}`,
            interval: "Últimos 30 días",
            trend: "up",
            data: Array(30).fill(totalMujeres / 30),
          },
          {
            title: "Total de Hombres",
            value: `${totalHombres}`,
            interval: "Últimos 30 días",
            trend: "up",
            data: Array(30).fill(totalHombres / 30),
          },
          {
            title: "Nuevos Beneficiarios",
            value: `${newRegistrations}`,
            interval: "Este mes",
            trend: newRegistrations > 0 ? "up" : "neutral",
            data: Array(30).fill(newRegistrations / 30),
          },
        ]);
      } catch (error) {
        console.error("Error al obtener datos de personas:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} item xs={12} sm={5} lg={3}>
            <StatCard {...card} />
          </Grid>
        ))}
        {/* <Grid item xs={12} md={6}>
          <SessionsChart /> 
      </Grid> */}
        {/* numero de expedientes por persona y usuario*/}
        <Grid item xs={12} md={6}>
          <PageViewsBarChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <FilesViewsBarChart />
        </Grid>
      </Grid>
      {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Details
      </Typography> */}
      {/* <Grid container spacing={2} columns={12}>
        <Grid item xs={12} lg={9} >
          <CustomizedDataGrid />
        </Grid>
        <Grid item xs={12} lg={3}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <ChartUserByCountry />
          </Stack>
        </Grid>
      </Grid> */}
    </Box>
  );
}