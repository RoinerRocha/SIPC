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
import TableUpdateData from "../TableUpdateData";
import UpdateDirection from "./UpdateDirections";

interface Props {
    personId: number; // ID de la persona pasada como parámetro
}

export default function DirectionsList({ personId }: Props) {
    const [directions, setDirections] = useState<directionsModel[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<directionsModel | null>(
        null
    );
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { t } = useTranslation();

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

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedDirections = directions.slice(startIndex, endIndex);

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
                                    Provincia
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Cantón
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Distrito
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Barrio
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Otras Señas
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Tipo de Dirección
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                                >
                                    {t('Control-ColumnaConfiguracion')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedDirections.map((direction) => (
                                <TableRow key={direction.id_direccion}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.id_direccion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.id_persona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.provincia}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.canton}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.distrito}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.barrio}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.otras_senas}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.tipo_direccion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{direction.estado}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="info"
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", margin: "5px" }}
                                                    onClick={() => handleEdit(direction.id_direccion)}
                                                >
                                                    {t('Control-BotonEditar')}
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", margin: "5px" }}
                                                    onClick={() => handleDelete(direction.id_direccion)}
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
                count={directions.length}
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
                <DialogTitle>Editar Direccion</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedDirection && (<UpdateDirection direction={selectedDirection} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
