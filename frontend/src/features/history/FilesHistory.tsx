
import Grid from '@mui/material/Grid';
import { Box, Button, Card, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material';
import { useMemo, useEffect, useState } from 'react';
import { historyFilesModel } from "../../app/models/historyFilesModel";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';

import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useFontSize } from "../../app/context/FontSizeContext";

interface HistoryProps {
    HistoryData: historyFilesModel[];
}

export default function HistoryFiles({ HistoryData }: HistoryProps) {
    const [loading, setLoading] = useState(false);
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    const columns = useMemo<MRT_ColumnDef<historyFilesModel>[]>(() => [
        {
            accessorKey: "codigo",
            header: "Código",
            size: 100,
            Cell: ({ cell }) => {
                const rawValue = cell.getValue();
                const value = rawValue ? String(rawValue) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '90px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "campo_modificado",
            header: "Campo Modificado",
            size: 200,
            Cell: ({ cell }) => {
                const rawValue = cell.getValue();
                const value = rawValue ? String(rawValue) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "fecha",
            header: "Fecha",
            size: 150,
            Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString()
        },
        {
            accessorKey: "valor_anterior",
            header: "Valor Anterior",
            size: 200,
            Cell: ({ cell }) => {
                const rawValue = cell.getValue();
                const value = rawValue ? String(rawValue) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "valor_nuevo",
            header: "Valor Nuevo",
            size: 200,
            Cell: ({ cell }) => {
                const rawValue = cell.getValue();
                const value = rawValue ? String(rawValue) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "usuario",
            header: "Usuario Responsable",
            size: 200,
            Cell: ({ cell }) => {
                const rawValue = cell.getValue();
                const value = rawValue ? String(rawValue) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: HistoryData,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        localization: MRT_Localization_ES,
        muiTopToolbarProps: { sx: { backgroundColor: "white" } }, // Azul claro en la barra de herramientas
        muiBottomToolbarProps: { sx: { backgroundColor: "white" } }, // Azul claro en la barra inferior
        muiTablePaperProps: { sx: { backgroundColor: "#E3F2FD" } }, // Azul claro en la tabla
        muiTableContainerProps: { sx: { backgroundColor: "white" } }, // Azul claro en el contenedor
        muiTableHeadCellProps: {
            sx: { backgroundColor: "#1976D2", color: "white", fontWeight: "bold", border: "2px solid #1565C0", fontSize: fontSizeMap[fontSize], }
        },
        muiTableBodyCellProps: {
            sx: { backgroundColor: "white", borderBottom: "1px solid #BDBDBD", border: "1px solid #BDBDBD", fontSize: fontSizeMap[fontSize], }
        },
        muiFilterTextFieldProps: {
            sx: {
                '& input::placeholder': {
                    color: 'white',
                    opacity: 1, // <-- importante para que se vea bien el color
                },
                '& .MuiInputBase-input': {
                    color: 'white',
                },
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "white", borderRadius: "8px" }}>
            </Box>
        )
    });

    return (
        <Grid container spacing={1}>
            <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <MaterialReactTable table={table} />
                )}
            </Paper>
        </Grid>
    )
}


