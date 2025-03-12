import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Box, IconButton, Tooltip
} from "@mui/material";
import { directionsModel } from "../../../app/models/directionsModel";
import { useMemo, useState, useEffect } from "react";
import api from "../../../app/api/api";
import { toast } from "react-toastify";
import UpdateDirection from "./UpdateDirections";
import RegisterDirections from '../Directions/RegisterDirections';

import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon   } from "@mui/icons-material";

interface Props {
    personId: number; // ID de la persona pasada como parámetro
}

export default function DirectionsList({ personId }: Props) {
    const [directions, setDirections] = useState<directionsModel[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<directionsModel | null>(
        null
    );
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    useEffect(() => {
        loadAccess();
    }, [personId]);

    const loadAccess = async () => {
        setLoading(true);
        try {
            const response = await api.directions.getDireccionesByPersona(personId);
            setDirections(response.data);
        } catch (error) {
            console.error("Error al obtener direcciones:", error);
            toast.error("Error al obtener direcciones.");
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (id_direccion: number) => {
        try {
            const response = await api.directions.getDireccionesByID(id_direccion);
            setSelectedDirection(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de las direcciones:", error);
            toast.error("Direccion inactiva");
        }
    };

    const handleDelete = async (id_direccion: number) => {
        try {
            await api.directions.deleteDirections(id_direccion);
            toast.success("Direccion eliminada");
            loadAccess();
        } catch (error) {
            console.error("Error al eliminar el acceso:", error);
            toast.error("Error al desactivar la direccion");
        }
    };

    const handleAddDirection = () => {
        localStorage.setItem("generatedUserId", personId.toString());
        setOpenRegisterDialog(true);
    };
    const columns = useMemo<MRT_ColumnDef<directionsModel>[]>(() => [
        {
            accessorKey: "acciones",
            header: "Acciones",
            size: 120,
            muiTableHeadCellProps: { align: "center" }, 
            muiTableBodyCellProps: { align: "center" },
            Cell: ({ row }) => (
                <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="Editar">
                        <IconButton color="info" onClick={() => handleEdit(row.original.id_direccion)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(row.original.id_direccion)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
        { accessorKey: "id_direccion", header: "ID Dirección", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "provincia", header: "Provincia", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "canton", header: "Cantón", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "distrito", header: "Distrito", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "barrio", header: "Barrio", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "otras_senas", header: "Otras Señales", size: 200, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "tipo_direccion", header: "Tipo de Dirección", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "estado", header: "Estado", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: directions,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        onGlobalFilterChange: (value) => {
            setGlobalFilter(value ?? "");
        },
        state: { globalFilter },
        localization: MRT_Localization_ES,
        muiTopToolbarProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en la barra de herramientas
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en la barra inferior (paginación)
            },
        },
        muiTablePaperProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en toda la tabla
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en el fondo del contenedor de la tabla
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976D2", // Azul primario para encabezados
                color: "white",
                fontWeight: "bold",
                border: "2px solid #1565C0",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: "white", // Blanco para las celdas
                borderBottom: "1px solid #BDBDBD",
                border: "1px solid #BDBDBD", // Gris medio para bordes
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "#E3F2FD", borderRadius: "8px" }}>
                <Button  variant="contained" color="primary" onClick={handleAddDirection} fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}>
                    Agregar Dirección
                </Button>
            </Box>
        )
    });


    return (
        <Grid container spacing={1}>
            <Paper sx={{ width: "100%", p: 2 }}>
                {loading ? <CircularProgress sx={{ margin: "20px auto", display: "block" }} /> : <MaterialReactTable table={table} />}
            </Paper>
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Editar Direccion</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '250px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedDirection && (<UpdateDirection direction={selectedDirection} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="update-directions-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none"}}
                    >
                        Actualizar Direcciones
                    </Button>
                    <Button sx={{ textTransform: "none"}} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Registrar Nueva Dirección</DialogTitle>
                <DialogContent>
                    <RegisterDirections loadAccess={loadAccess} />
                </DialogContent>
                <DialogActions>
                <Button
                        type="submit"
                        form="register-directions-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none"}}
                    >
                        Registrar Direccion
                    </Button>
                    <Button sx={{ textTransform: "none"}} onClick={() => setOpenRegisterDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
