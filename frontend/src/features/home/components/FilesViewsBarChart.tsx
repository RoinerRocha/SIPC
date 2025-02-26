import * as React from 'react';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import api from '../../../app/api/api';

export default function FilesViewsBarChart() {
    const theme = useTheme();
    const [users, setUsers] = useState<string[]>([]);
    const [personsPerUser, setPersonsPerUser] = useState<number[]>([]);
    const [filesPerUser, setFilesPerUser] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener todos los usuarios
                const usersResponse = await api.Account.getAllUser();
                console.log("Usuarios obtenidos:", usersResponse.data);

                const usersData = usersResponse.data || [];
                const userNames: string[] = [];
                const personsCounts: number[] = [];
                const filesCounts: number[] = [];

                // Obtener todas las personas
                const personsResponse = await api.persons.getPersons();
                const allPersons = personsResponse.data || [];
                console.log("Total de personas registradas:", allPersons.length);

                for (const user of usersData) {
                    userNames.push(`${user.nombre} ${user.primer_apellido}`);

                    // Filtrar personas registradas por cada usuario
                    const personsByUser = allPersons.filter((p: any) => p.usuario_registro === user.nombre_usuario);
                    personsCounts.push(personsByUser.length || 0);
                    console.log(`Personas registradas por ${user.nombre_usuario}:`, personsByUser.length);

                    // Obtener expedientes por cada persona del usuario
                    let totalFiles = 0;
                    for (const person of personsByUser) {
                        try {
                            const filesResponse = await api.history.getFilesByIdPerson(person.id_persona);
                            const personFiles = filesResponse.data || [];
                            console.log(`Expedientes de ${person.nombre}:`, personFiles.length);
                            totalFiles += personFiles.length;
                        } catch (error) {
                            console.warn(`No se encontraron expedientes para ${person.nombre}.`);
                        }
                    }
                    filesCounts.push(totalFiles);
                }

                // Asignar valores por defecto si no hay datos
                setUsers(userNames.length > 0 ? userNames : ["Sin datos"]);
                setPersonsPerUser(personsCounts.length > 0 ? personsCounts : [0]);
                setFilesPerUser(filesCounts.length > 0 ? filesCounts : [0]);

                console.log("Usuarios finales:", userNames);
                console.log("Personas por usuario:", personsCounts);
                console.log("Expedientes por usuario:", filesCounts);
            } catch (error) {
                console.error("Error al obtener los datos de usuarios, personas y expedientes:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    Número de Expedientes por Usuario
                </Typography>
                <Stack sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Cantidad de expedientes ingresados por usuario
                    </Typography>
                </Stack>
                <BarChart
                    borderRadius={8}
                    colors={[theme.palette.primary.main, theme.palette.secondary.main]}
                    xAxis={[
                        {
                            scaleType: 'band',
                            //   categoryGapRatio: 0.5,
                            data: users,
                        },
                    ]}
                    series={[
                        // {
                        //   id: 'persons-per-user',
                        //   label: 'Personas Registradas',
                        //   data: personsPerUser,
                        //   stack: 'A',
                        // },
                        {
                            id: 'files-per-user',
                            label: 'Expedientes Ingresados',
                            data: filesPerUser,
                            stack: 'A',
                            valueFormatter: (value) => `${value} Expedientes`,
                        },
                    ]}
                    height={300}
                    margin={{ left: 50, right: 0, top: 20, bottom: 80 }}
                    grid={{ horizontal: true }}
                    slotProps={{
                        legend: {
                            hidden: false,
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
}
