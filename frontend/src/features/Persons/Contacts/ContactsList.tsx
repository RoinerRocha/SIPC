import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Box
} from "@mui/material";
import { contactsModel } from "../../../app/models/contactsModel";
import { useState, useEffect } from "react";
import api from "../../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import UpdatedContacts from "../Contacts/UpdatedContacts";

interface Props {
    personId: number; // ID de la persona pasada como parámetro
}

export default function ContactList({ personId }: Props) {
    const [contacts, setContacts] = useState<contactsModel[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<contactsModel | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { t } = useTranslation();

    useEffect(() => {
        loadAccess();
    }, [personId]);

    const loadAccess = async () => {
        setLoading(true);
        try {
            const response = await api.contacts.getContactsByPerson(personId);
            setContacts(response.data);
        } catch (error) {
            console.error("Error al obtener direcciones:", error);
            toast.error("Error al cargar los contactos.");
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (id_contacto: number) => {
        try {
            const response = await api.contacts.getContactsByID(id_contacto);
            setSelectedContacts(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los contactos:", error);
            toast.error("Contacto Inactivo");
        }
    };

    const handleDelete = async (id_contacto: number) => {
        try {
            await api.contacts.deleteContacts(id_contacto);
            toast.success("Contacto Inactivado");
            loadAccess();
        } catch (error) {
            console.error("Error al Desahabilitar el contacto:", error);
            toast.error("Contacto Desahabilitado");
        }
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedContacts = contacts.slice(startIndex, endIndex);

    return (
        <Grid container spacing={1}>
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    ID del contacto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    ID de la persona
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Tipo de Contacto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Identificador
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha de registro
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Comentarios
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Configuracion
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedContacts.map((contact) => (
                                <TableRow key={contact.id_contacto}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{contact.id_contacto}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{contact.id_persona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{contact.tipo_contacto}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{contact.identificador}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{contact.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(contact.fecha_registro).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{contact.comentarios}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="info"
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", margin: "5px" }}
                                                    onClick={() => handleEdit(contact.id_contacto)}
                                                >
                                                    {t('Control-BotonEditar')}
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", margin: "5px" }}
                                                    onClick={() => handleDelete(contact.id_contacto)}
                                                >
                                                    {t('Control-BotonEliminar')}
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
                count={contacts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
            />
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Editar Contactos</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedContacts && (<UpdatedContacts contacts={selectedContacts} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}