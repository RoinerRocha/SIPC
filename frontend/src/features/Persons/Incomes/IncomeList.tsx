import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Box
} from "@mui/material";
import { incomesModel } from "../../../app/models/incomesModel";
import { useState, useEffect } from "react";
import api from "../../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import UpdateIncomes from "../Incomes/UpdatedIncomes";

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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { t } = useTranslation();

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
            setIncomes(response.data);
        } catch (error) {
            console.error("Error al obtener Ingresos:", error);
            toast.error("No se puede cargar los ingresos.");
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
            toast.error("Ingresos Inactivos");
        }
    };

    const handleDelete = async (id_ingreso: number) => {
        try {
            await api.incomes.deleteIncomes(id_ingreso);
            toast.success("Ingreso eliminado");
            loadAccess();
        } catch (error) {
            console.error("Error al eliminar el ingreso:", error);
            toast.error("Error al desactiar el ingreso");
        }
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedIncomes = incomes.slice(startIndex, endIndex);

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
                                    Segmento
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Subsegmento
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Patrono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Ocupacion
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Salario Bruto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Salario Neto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha Ingreso
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Principal
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Configuracion
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedIncomes.map((incomes) => (
                                <TableRow key={incomes.id_ingreso}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.segmento}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.subsegmento}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.patrono}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.ocupacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.salario_bruto}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.salario_neto}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(incomes.fecha_ingreso).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{incomes.principal ? "Sí" : "No"}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="info"
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px",  margin: "5px" }}
                                                    onClick={() => handleEdit(incomes.id_ingreso)}
                                                >
                                                    {t('Control-BotonEditar')}
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px",  margin: "5px" }}
                                                    onClick={() => handleDelete(incomes.id_ingreso)}
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
                count={incomes.length}
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
                <DialogTitle>Editar Ingresos</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedIncomes && (<UpdateIncomes Incomes={selectedIncomes} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}