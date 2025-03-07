import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle,
    Box
} from "@mui/material";
import { directionsModel } from "../../../app/models/directionsModel";
import { useState, useEffect } from "react";
import api from "../../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { familyModel } from '../../../app/models/familyModel';
import UpdateFamilyMember from '../Family/UpdatedFamilyMember';
import RegisterFamilyMember from '../Family/RegisterFamilyMember';


interface Props {
    personId: number; // ID de la persona pasada como parámetro
}

export default function FamilyList({ personId }: Props) {
    const [members, setMembers] = useState<familyModel[]>([]);
    const [selectedMember, setSelectedMember] = useState<familyModel | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const { t } = useTranslation();

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
            toast.error("Error al obtener miembros familiares.");
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
            toast.error("Miembro familiar no encontrado");
        }
    };

    const handleDelete = async (idnucleo: number) => {
        try {
            await api.family.deleteMember(idnucleo);
            toast.success("Miembro eliminado");
            loadAccess();
        } catch (error) {
            console.error("Error al eliminar el miembro familiar:", error);
            toast.error("Error al desactivar el miembro familiar");
        }
    };

    const handleAddDirection = () => {
        localStorage.setItem("generatedUserId", personId.toString());
        setOpenRegisterDialog(true);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedMembers = members.slice(startIndex, endIndex);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={2}>
                <Button variant="contained" color="primary" onClick={handleAddDirection} fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}>
                    Agregar Familiar
                </Button>
            </Grid>
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem",  padding: '12px', minWidth: '170px', border: '1px solid black' }}>
                                    ID del miembro familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem",  padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    ID de la persona
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Cedula
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem",  padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Nombre Completo
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem",  padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Fecha de Nacimiento
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Relacion
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Ingresos
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Observaciones
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                                >
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedMembers.map((member) => (
                                <TableRow key={member.idnucleo}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.idnucleo}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.idpersona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.cedula}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.nombre_completo}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(member.fecha_nacimiento).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.relacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.ingresos}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{member.observaciones}</TableCell>
                                    <TableCell align="center" sx={{ border: '1px solid black' }}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="info"
                                                    sx={{ fontSize: "0.75rem", minWidth: "50px", minHeight: "20px", margin: "5px", textTransform: "none" }}
                                                    onClick={() => handleEdit(member.idnucleo)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    sx={{ fontSize: "0.75rem", minWidth: "50px", minHeight: "20px", margin: "5px", textTransform: "none" }}
                                                    onClick={() => handleDelete(member.idnucleo)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component="div"
                count={members.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
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
                        height: '500px',
                        width: '1200px', // Ajusta la altura según necesites.
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
                        sx={{ textTransform: "none"}}
                    >
                        Actualizar Familiar
                    </Button>
                    <Button sx={{ textTransform: "none"}} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
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
                        sx={{ textTransform: "none"}}
                    >
                        Ingresar Familiar
                    </Button>
                    <Button sx={{ textTransform: "none"}} onClick={() => setOpenRegisterDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}