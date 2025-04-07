import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Box,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import { directionsModel } from "../../../app/models/directionsModel";
import { useMemo, useState, useEffect } from "react";
import api from "../../../app/api/api";
import { useTranslation } from "react-i18next";
import { familyModel } from '../../../app/models/familyModel';
import UpdateFamilyMember from '../Family/UpdatedFamilyMember';
import RegisterFamilyMember from '../Family/RegisterFamilyMember';

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

export default function FamilyList({ personId }: Props) {
    const [members, setMembers] = useState<familyModel[]>([]);
    const [selectedMember, setSelectedMember] = useState<familyModel | null>(null);
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
            const response = await api.family.getMembersByPerson(personId);
            setMembers(response.data);
        } catch (error) {
            console.error("Error al obtener miembros familiares:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar miembros familiares",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (idnucleo: number) => {
        try {
            const response = await api.family.getMembersByID(idnucleo);
            setSelectedMember(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los miembros familiares:", error);
            Swal.fire({
                icon: "error",
                title: "Error en miembro familiar",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar Miembro Familiar",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleDelete = async (idnucleo: number) => {
        const result = await Swal.fire({
            title: '¿Desea eliminar este miembro del núcleo familiar?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, eliminar',
            denyButtonText: 'No eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
    
        if (result.isConfirmed) {
            try {
                await api.family.deleteMember(idnucleo);
                await Swal.fire({
                    icon: 'success',
                    title: 'Miembro eliminado',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error("Error al eliminar el miembro familiar:", error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el miembro familiar.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Eliminación cancelada',
                text: 'El miembro no fue eliminado.',
                showConfirmButton: false,
                timer: 2000
            });
        }
        // Si se presiona "Cancelar", no se hace nada.
    };

    const handleAddDirection = () => {
        localStorage.setItem("generatedUserId", personId.toString());
        setOpenRegisterDialog(true);
    };

    const columns = useMemo<MRT_ColumnDef<familyModel>[]>(() => [
        {
            accessorKey: "acciones",
            header: "Acciones",
            size: 120,
            muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" },
            Cell: ({ row }) => (
                <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="Editar">
                        <IconButton color="info" onClick={() => handleEdit(row.original.idnucleo)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(row.original.idnucleo)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
        { accessorKey: "idnucleo", header: "ID", size: 100 },
        { accessorKey: "idpersona", header: "ID Persona", size: 120 },
        { accessorKey: "cedula", header: "Cédula", size: 150 },
        { accessorKey: "nombre_completo", header: "Nombre Completo", size: 200 },
        {
            accessorKey: "fecha_nacimiento",
            header: "Fecha de Nacimiento",
            size: 150,
            Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
        },
        { accessorKey: "relacion", header: "Relación", size: 150 },
        { accessorKey: "ingresos", header: "Ingresos", size: 120 },
        { accessorKey: "observaciones", header: "Observaciones", size: 200 },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: members,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        onGlobalFilterChange: (value) => {
            setGlobalFilter(value ?? "");
        },
        state: {
            globalFilter, columnVisibility: {
                idnucleo: false, // Oculta la columna "id_persona"
                idpersona: false, // Oculta la columna "identificacion"
            },
        },
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "#E3F2FD", borderRadius: "8px" }}>
                <Button variant="contained" color="primary" onClick={handleAddDirection} fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}>
                    Agregar Familiar
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
                <DialogTitle>Editar Miembro Familiar</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '500px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedMember && (<UpdateFamilyMember member={selectedMember} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="update-family-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Familiar
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Registrar Nuevo Familiar</DialogTitle>
                <DialogContent>
                    <RegisterFamilyMember loadAccess={loadAccess} />
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="register-family-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Ingresar Familiar
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenRegisterDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}