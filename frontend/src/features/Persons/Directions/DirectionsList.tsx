import {
    Grid, Paper, Button, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Box, IconButton, Tooltip,
} from "@mui/material";
import { directionsModel } from "../../../app/models/directionsModel";
import { useMemo, useState, useEffect } from "react";
import api from "../../../app/api/api";
import UpdateDirection from "./UpdateDirections";
import RegisterDirections from '../Directions/RegisterDirections';

import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useFontSize } from "../../../app/context/FontSizeContext";
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

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
    const { fontSize } = useFontSize();


    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

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
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar direcciones",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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
            Swal.fire({
                icon: "error",
                title: "Direccion Inactiva",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar direccion",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleDelete = async (id_direccion: number) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción deshabilitar la dirección actual.',
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, deshabilitar',
            denyButtonText: 'No deshabilitar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            reverseButtons: true,
            customClass: {
                popup: 'swal-z-index',
                confirmButton: 'swal-confirm-btn',
                denyButton: 'swal-deny-btn'
            }
        });

        if (result.isConfirmed) {
            try {
                await api.directions.deleteDirections(id_direccion);
                await Swal.fire({
                    icon: 'success',
                    title: 'Dirección deshabilitada',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error("Error al deshabilitar la dirección:", error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error al deshabilitar',
                    text: 'Ocurrió un error al deshabilitar la dirección',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Operacion cancelada',
                text: 'La dirección no fue deshabilitada',
                timer: 2000,
                showConfirmButton: false
            });
        }
        // Si se presiona "Cancelar", no se hace nada
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
        { accessorKey: "id_direccion", header: "ID Dirección", size: 100 },
        {
            accessorKey: "tipo_direccion",
            header: "Tipo Dirección",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow placement="top">
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '140px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            verticalAlign: 'middle'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "provincia",
            header: "Provincia",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow placement="top">
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '140px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            verticalAlign: 'middle'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "canton",
            header: "Cantón",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow placement="top">
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '140px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            verticalAlign: 'middle'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "distrito",
            header: "Distrito",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "barrio",
            header: "Barrio",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "otras_senas",
            header: "Otras Señas",
            size: 200,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow placement="top">
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            verticalAlign: 'middle'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "estado",
            header: "Estado",
            size: 120,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {value}
                        </span>
                    </Tooltip>
                );
            }
        },
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
        state: {
            globalFilter, columnVisibility: {
                id_direccion: false,
                estado: false,
            },
        },
        localization: MRT_Localization_ES,
        muiTopToolbarProps: {
            sx: {
                backgroundColor: "white", // Azul claro en la barra de herramientas
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: "white", // Azul claro en la barra inferior (paginación)
            },
        },
        muiTablePaperProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en toda la tabla
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "white", // Azul claro en el fondo del contenedor de la tabla
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976D2", // Azul primario para encabezados
                color: "white",
                fontWeight: "bold",
                fontSize: fontSizeMap[fontSize],
                border: "2px solid #1565C0",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: "white", // Blanco para las celdas
                borderBottom: "1px solid #BDBDBD",
                fontSize: fontSizeMap[fontSize],
                border: "1px solid #BDBDBD", // Gris medio para bordes
            },
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
                <Button variant="contained" color="primary" onClick={handleAddDirection} fullWidth
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
                <DialogContent>
                    {selectedDirection && (<UpdateDirection direction={selectedDirection} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="update-directions-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Direcciones
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
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
                        sx={{ textTransform: "none" }}
                    >
                        Registrar Direccion
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenRegisterDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
