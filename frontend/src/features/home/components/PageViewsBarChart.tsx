import * as React from 'react'
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import api from '../../../app/api/api';

export default function PageViewsBarChart() {
  const theme = useTheme();
  const [monthlyRegistrations, setMonthlyRegistrations] = useState<number[]>(Array(12).fill(0));
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.persons.getPersons();
        const persons = response.data;
        const now = new Date();
        const currentYear = now.getFullYear();
        const registrationsByMonth = Array(12).fill(0);

        persons.forEach((person: any) => {
          const regDate = new Date(person.fecha_registro);
          if (regDate.getFullYear() === currentYear) {
            registrationsByMonth[regDate.getMonth()] += 1;
          }
        });

        setMonthlyRegistrations(registrationsByMonth);
        setTotalRegistrations(persons.length);
        
        const lastMonth = now.getMonth() - 1;
        if (lastMonth >= 0 && registrationsByMonth[lastMonth] > 0) {
          setTrend(
            registrationsByMonth[now.getMonth()] >= registrationsByMonth[lastMonth]
              ? 'up'
              : 'down'
          );
        }
      } catch (error) {
        console.error("Error al obtener los registros de personas:", error);
      }
    };

    fetchRegistrations();
  }, []);

  const colorPalette = [
    theme.palette.primary.dark,
    theme.palette.primary.main,
    theme.palette.primary.light,
  ];
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Total de Personas Registradas por Mes
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {totalRegistrations}
            </Typography>
            <Chip size="small" color={trend === 'up' ? 'success' : 'error'} label={trend === 'up' ? '+%' : '-%'} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Registros de personas en los últimos 12 meses
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={
            [
              {
                scaleType: 'band',
                categoryGapRatio: 0.5,
                data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
              },
            ] as any
          }
          series={[
            {
              id: 'page-views',
              label: 'Personas Registradas',
              data: monthlyRegistrations,
              stack: 'A',
            },
            // {
            //   id: 'downloads',
            //   label: 'Downloads',
            //   data: [3098, 4215, 2384, 2101, 4752, 3593, 2384],
            //   stack: 'A',
            // },
            // {
            //   id: 'conversions',
            //   label: 'Conversions',
            //   data: [4051, 2275, 3129, 4693, 3904, 2038, 2275],
            //   stack: 'A',
            // },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}