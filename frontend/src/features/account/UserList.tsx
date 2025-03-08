import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow, TableBody,
    Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    FormControl, Select, InputLabel, MenuItem, SelectChangeEvent,
    TablePagination
} from "@mui/material";

import React, { useState, useEffect } from "react";
import api from "../../app/api/api";
import { toast } from 'react-toastify';
import { User } from "../../app/models/user";
import { Link } from 'react-router-dom';
import { roleModels } from '../../app/models/roleModels';
import { statesModels } from '../../app/models/states';
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';

interface Props {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export default function UserList({ users, setUsers }: Props) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [roles, setRoles] = useState<roleModels[]>([]);
    const [states, setStates] = useState<statesModels[]>([]);

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
            toast.error(t('toast-Usuarios'));
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
            toast.error(t('toast-Usuarios'));
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

    const handleDelete = async (id: number) => {
        try {
            await api.Account.deleteUser(id);
            toast.success(t('toast-Usuarios-Eliminado'));
            loadUsers();
        } catch (error) {
            console.error("Error al eliminar al usuario:", error);
            toast.error(t('toast-Usuarios-Eliminado-error'));
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
                !selectedUser.estado || !selectedUser.contrasena) {
                toast.error("Todos los campos son obligatorios.");
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
                };
                
                await api.Account.updateUser(accountId, updateUser);
                toast.success(t('toast-Usuarios-Editar'));
                setOpenEditDialog(false);
                loadUsers();
            } catch (error) {
                console.error("Error al actualizar al usuario:", error);
                toast.error(t('toast-Usuarios-Editar-error'));
            }
        }
    };

    const { t } = useTranslation();
    const { changeLanguage, language } = useLanguage();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPersons = users.slice(startIndex, endIndex);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={2}>
                <Button variant="contained" color="primary" component={Link} to="/Registro" sx={{ marginBottom: 2, width: "130px" }}>
                    Registrar Usuario
                </Button>
            </Grid>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                        <TableRow>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Nombre</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Primer Apellido</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Segundo Apellido</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Nombre de Usuario</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Correo</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Rol del Usuario</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>estado</TableCell>
                            <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((users) => (
                            <TableRow key={users.id}>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.nombre}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.primer_apellido}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.segundo_apellido}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.nombre_usuario}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.correo_electronico}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.perfil_asignado}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{users.estado}</TableCell>
                                <TableCell align='center' sx={{ border: '1px solid black' }}>
                                    <Button
                                        variant='contained'
                                        color='info'
                                        sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px" }}
                                        onClick={() => handleEdit(users)}

                                    >
                                        Editar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component="div"
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) =>
                    setRowsPerPage(parseInt(event.target.value, 10))
                }
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Usuario</DialogTitle>
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
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                    <Button onClick={handleUpdate}>Editar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}