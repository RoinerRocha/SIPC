
import Grid from '@mui/material/Grid';
import { Button, Card, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { useMemo, useEffect, useState } from 'react';
import { historyFilesModel } from "../../app/models/historyFilesModel";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';

import { MRT_Localization_ES } from "material-react-table/locales/es";

interface HistoryProps {
    HistoryData: historyFilesModel[];
}

export default function HistoryFiles({ HistoryData }: HistoryProps) {
    const [loading, setLoading] = useState(false);

    const columns = useMemo<MRT_ColumnDef<historyFilesModel>[]>(() => [
        { accessorKey: "codigo", header: "Código", size: 100 },
        { accessorKey: "campo_modificado", header: "Campo Modificado", size: 200 },
        { 
            accessorKey: "fecha", 
            header: "Fecha", 
            size: 150, 
            Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString() 
        },
        { accessorKey: "valor_anterior", header: "Valor Anterior", size: 200 },
        { accessorKey: "valor_nuevo", header: "Valor Nuevo", size: 200 },
        { accessorKey: "usuario", header: "Usuario Responsable", size: 200 },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: HistoryData,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        localization: MRT_Localization_ES,
        muiTopToolbarProps: { sx: { backgroundColor: "#E3F2FD" } }, // Azul claro en la barra de herramientas
        muiBottomToolbarProps: { sx: { backgroundColor: "#E3F2FD" } }, // Azul claro en la barra inferior
        muiTablePaperProps: { sx: { backgroundColor: "#E3F2FD" } }, // Azul claro en la tabla
        muiTableContainerProps: { sx: { backgroundColor: "#E3F2FD" } }, // Azul claro en el contenedor
        muiTableHeadCellProps: { 
            sx: { backgroundColor: "#1976D2", color: "white", fontWeight: "bold", border: "2px solid #1565C0" } 
        },
        muiTableBodyCellProps: { 
            sx: { backgroundColor: "white", borderBottom: "1px solid #BDBDBD", border: "1px solid #BDBDBD" } 
        },
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


