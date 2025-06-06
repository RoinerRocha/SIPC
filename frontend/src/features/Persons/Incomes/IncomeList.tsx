import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Box,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { incomesModel } from "../../../app/models/incomesModel";
import { useMemo, useState, useEffect } from "react";
import api from "../../../app/api/api";
import { useTranslation } from "react-i18next";
import UpdateIncomes from "../Incomes/UpdatedIncomes";
import RegisterIncomes from '../Incomes/RegisterIncomes';
import { useFontSize } from "../../../app/context/FontSizeContext";
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';


interface Props {
    personId: number; // ID de la persona pasada como parámetro
}

export default function IncomeList({ personId }: Props) {
    const [incomes, setIncomes] = useState<incomesModel[]>([]);
    const [selectedIncomes, setSelectedIncomes] = useState<incomesModel | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
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
            const response = await api.incomes.getIncomesByPerson(personId);
            const updatedIncomes = response.data.map((income: incomesModel) => ({
                ...income,
                principal: Boolean(income.principal), // Convertir a boolean si es necesario
            }));
            setIncomes(updatedIncomes);
        } catch (error) {
            console.error("Error al obtener Ingresos:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar ingresos",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (id_ingreso: number) => {
        try {
            const response = await api.incomes.getIncomesByID(id_ingreso);
            setSelectedIncomes(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los ingresos:", error);
            Swal.fire({
                icon: "error",
                title: "Ingreso Inactivo",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar ingresso",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleDelete = async (id_ingreso: number) => {
        const result = await Swal.fire({
            title: '¿Desea deshabilitar este ingreso?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, deshabilitar',
            denyButtonText: 'No deshabilitar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                popup: 'swal-z-index',
                confirmButton: 'swal-confirm-btn',
                denyButton: 'swal-deny-btn'
            }
        });

        if (result.isConfirmed) {
            try {
                await api.incomes.deleteIncomes(id_ingreso);
                await Swal.fire({
                    icon: 'success',
                    title: 'Ingreso deshabilitado',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error("Error al deshabilitar el ingreso:", error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error al deshabilitar',
                    text: 'No se pudo deshabilitar el ingreso.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Operacion cancelada',
                text: 'El ingreso no fue deshabilitado.',
                showConfirmButton: false,
                timer: 2000
            });
        }
        // Si presiona "Cancelar", no se hace nada.
    };

    const handleAddDirection = () => {
        localStorage.setItem("generatedUserId", personId.toString());
        setOpenRegisterDialog(true);
    };

    const columns = useMemo<MRT_ColumnDef<incomesModel>[]>(() => [
        {
            accessorKey: "acciones",
            header: "Acciones",
            size: 120,
            Cell: ({ row }) => (
                <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="Editar">
                        <IconButton color="info" onClick={() => handleEdit(row.original.id_ingreso)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(row.original.id_ingreso)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
        {
            accessorKey: "segmento",
            header: "Segmento",
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
            accessorKey: "subsegmento",
            header: "Sub Segmento",
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
            accessorKey: "patrono",
            header: "Patrono",
            size: 200,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
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
            accessorKey: "ocupacion",
            header: "Ocupación",
            size: 180,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '160px',
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
            accessorKey: "salario_bruto",
            header: "Salario Bruto",
            size: 140,
            Cell: ({ cell }) => `$${cell.getValue()}`,
        },
        {
            accessorKey: "salario_neto",
            header: "Salario Neto",
            size: 140,
            Cell: ({ cell }) => `$${cell.getValue()}`,
        },
        {
            accessorKey: "fecha_ingreso",
            header: "Fecha Ingreso",
            size: 150,
            Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
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
        {
            accessorKey: "principal",
            header: "Principal",
            size: 120,
            Cell: ({ cell }) => (cell.getValue() ? "Sí" : "No"),
        },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: incomes,
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
                    Agregar Ingreso
                </Button>
            </Box>
        ),
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
                <DialogTitle>Editar Ingresos</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '500px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedIncomes && (<UpdateIncomes Incomes={selectedIncomes} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="update-incomes-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Ingresos
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                <DialogContent>
                    <RegisterIncomes loadAccess={loadAccess} />
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="register-incomes-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Agregar Ingreso
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenRegisterDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}