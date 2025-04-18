import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow, TableBody,
    Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    FormControl, Select, InputLabel, MenuItem, SelectChangeEvent,
    TablePagination,
    Tooltip,
    IconButton,
    Box
} from "@mui/material";

import { MRT_Localization_ES } from "material-react-table/locales/es";

import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef
} from "material-react-table";

import { Edit as EditIcon } from "@mui/icons-material";

import React, { useMemo, useState, useEffect } from "react";
import api from "../../app/api/api";
import { User } from "../../app/models/user";
import { Link } from 'react-router-dom';
import { roleModels } from '../../app/models/roleModels';
import { statesModels } from '../../app/models/states';
import { FieldValues, useForm } from "react-hook-form";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


interface Props {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export default function UserList({ users, setUsers }: Props) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [roles, setRoles] = useState<roleModels[]>([]);
    const [states, setStates] = useState<statesModels[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    useEffect(() => {
        loadUsers();
        fetchData();
        fetchStates();
    }, []);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    const fetchData = async () => {
        try {
            const [rolesData] = await Promise.all([
                api.roles.getRoles()
            ]);
            if (rolesData && Array.isArray(rolesData.data)) {
                setRoles(rolesData.data);
            } else {
                console.error("Roles data is not an array", rolesData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha generado un error al agregar la Direccion",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };
    const fetchStates = async () => {
        try {
            const [statesData] = await Promise.all([
                api.States.getStates()
            ]);
            if (statesData && Array.isArray(statesData.data)) {
                setStates(statesData.data);
            } else {
                console.error("Roles data is not an array", statesData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar datos",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof roleModels;
        const value = event.target.value;
        setRoles((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };


    const loadUsers = async () => {
        try {
            const response = await api.Account.getAllUser();
            setUsers(response.data);
        } catch (error) {
            console.error("Error al cargar las zonas:", error);
        }
    };

    const handleEdit = (usuario: User) => {
        setSelectedUser(usuario);
        setOpenEditDialog(true);
    }

    const handleUpdate = async () => {
        if (selectedUser) {
            // Validar que los campos requeridos no estén vacíos
            if (!selectedUser.nombre || !selectedUser.primer_apellido || !selectedUser.segundo_apellido ||
                !selectedUser.nombre_usuario || !selectedUser.correo_electronico || !selectedUser.perfil_asignado ||
                !selectedUser.estado || !selectedUser.contrasena || !selectedUser.hora_inicial || !selectedUser.hora_final) {
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Todos los datos son obligatorios",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                return;
            }

            try {
                const accountId = selectedUser.id;
                const updateUser = {
                    nombre: selectedUser.nombre.trim(),
                    primer_apellido: selectedUser.primer_apellido.trim(),
                    segundo_apellido: selectedUser.segundo_apellido.trim(),
                    nombre_usuario: selectedUser.nombre_usuario.trim(),
                    correo_electronico: selectedUser.correo_electronico.trim(),
                    perfil_asignado: selectedUser.perfil_asignado,
                    estado: selectedUser.estado,
                    contrasena: selectedUser.contrasena.trim(),
                    hora_inicial: selectedUser.hora_inicial.trim(),
                    hora_final: selectedUser.hora_final.trim(),
                };

                await api.Account.updateUser(accountId, updateUser);
                Swal.fire({
                    icon: "success",
                    title: "Actualizacion realizada",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Se ha actualizado al usuario con exito",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                setOpenEditDialog(false);
                loadUsers();
            } catch (error) {
                console.error("Error al actualizar al usuario:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al actualizar el usuario",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        }
    };

    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                size: 100,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ row }) => (
                    <Tooltip title="Editar Usuario">
                        <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleEdit(row.original)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                )
            },
            { accessorKey: "nombre", header: "Nombre", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "primer_apellido", header: "Primer Apellido", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "segundo_apellido", header: "Segundo Apellido", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "nombre_usuario", header: "Usuario", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "correo_electronico", header: "Correo", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "perfil_asignado", header: "Rol", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "estado", header: "Estado", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "hora_inicial", header: "Hora Inicial", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "hora_final", header: "Hora Final", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            // {
            //     accessorKey: "hora_final",
            //     header: "Hora Final",
            //     size: 100,
            //     muiTableHeadCellProps: { align: "center" }, 
            //     muiTableBodyCellProps: { align: "center" },
            //     Cell: ({ cell }) => {
            //         const value = cell.getValue();
            //         return typeof value === "string" ? moment(value).add(6, "hours").format("HH:mm") : "";
            //     }
            // },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: users,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
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
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    width: "50%",
                    paddingY: 1,
                    paddingX: 2,
                    backgroundColor: "white", // Azul claro
                    borderRadius: "8px",
                }}
            >

                <Button variant="contained" color="primary" component={Link} to="/Registro">
                    Registrar Usuario
                </Button>
            </Box>
        )
    });

    return (
        <>
            <Box
                sx={{
                    maxWidth: '95%',        // Limita el ancho al 96% del contenedor padre
                    margin: '0 auto',       // Centra horizontalmente
                    padding: 2,             // Espaciado interno
                    backgroundColor: '#f9f9f9', // Opcional: color de fondo para mejor separación visual
                    borderRadius: 2,        // Bordes redondeados
                    boxShadow: 2,           // Sombra ligera
                }}
            >
                <MaterialReactTable table={table} />
            </Box>
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle sx={{ backgroundColor: "white" }}>Editar Usuario</DialogTitle>
                <DialogContent >
                    <DialogContentText>
                        Editar Informacion del Usuario
                    </DialogContentText>
                    <TextField
                        label="Nombre"
                        value={selectedUser?.nombre || ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, nombre: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Primer Apellido"
                        value={selectedUser?.primer_apellido || ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, primer_apellido: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Segundo Apellido"
                        value={selectedUser?.segundo_apellido || ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, segundo_apellido: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Usuario"
                        value={selectedUser?.nombre_usuario || ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, nombre_usuario: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Correo"
                        value={selectedUser?.correo_electronico || ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, correo_electronico: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="perfil-asignado-label">Rol del Usuario</InputLabel>
                        <Select
                            labelId="perfil-asignado-label"
                            id="perfil_asignado"
                            label="Rol del Usuario"
                            value={selectedUser?.perfil_asignado || ''}
                            onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, 'perfil_asignado': e.target.value } : null)}

                        >
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.rol}>
                                    {role.rol}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="estado-label">Estado</InputLabel>
                        <Select
                            labelId="estado-label"
                            id="estado"
                            label="Estado"
                            value={selectedUser?.estado || ''}
                            onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, 'estado': e.target.value } : null)}
                        >
                            {states.map((state) => (
                                <MenuItem key={state.id} value={state.estado}>
                                    {state.estado}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Contraseña"
                        value={selectedUser?.contrasena || ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, contrasena: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                        type="password"
                    />
                    <TextField
                        label="Hora Inicial"
                        type="time"
                        value={selectedUser?.hora_inicial ? selectedUser.hora_inicial.substring(0, 5) : ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, hora_inicial: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Hora Final"
                        type="time"
                        value={selectedUser?.hora_final ? selectedUser.hora_final.substring(0, 5) : ''}
                        onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, hora_final: e.target.value } : null)}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    <Button  sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                    <Button  sx={{ textTransform: "none", bgcolor: '#1976D2', color: 'white', '&:hover': { bgcolor: '#1565C0' } }} onClick={handleUpdate}>Editar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}