import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField,
    Box
} from "@mui/material";
import { normalizerModel } from "../../app/models/normalizerModel";
import { useState, useEffect } from "react";
// import PaymentRegister from "./paymentRegister";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
// import UpdatePayment from "./UpdatedPayment";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DetailsRegister from "../referrals/RegisterDetails";
import RegisterNormalizer from "../Normalizers/registerNormalizer";
import UpdatedNormalizer from "../Normalizers/updatedNormalizer";

interface Props {
    normalizers: normalizerModel[];
    setNormalizers: React.Dispatch<React.SetStateAction<normalizerModel[]>>;
}

export default function NormalizersList({ normalizers: normalizers, setNormalizers: setNormalizers }: Props) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedNormalizer, setSelectedNormalizer] = useState<normalizerModel | null>(null);
    const [empresa, setEmpresa] = useState("");

    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    const loadAccess = async () => {
        try {
            const response = await api.normalizers.getAllNormalizers();
            setNormalizers(response.data);
        } catch (error) {
            console.error("Error al cargar las normalizaciones:", error);
            toast.error("Error al cargar las normalizaciones");
        }
    };

    const handleSearch = async () => {
        if (!empresa) {
            const defaultResponse = await api.normalizers.getAllNormalizers();
            setNormalizers(defaultResponse.data);
            return;
        }
        console.log(empresa);

        setLoading(true);
        try {
            const response = await api.normalizers.getNormalizeByCompany(empresa);
            if (response && response.data) {
                setNormalizers(Array.isArray(response.data) ? response.data : [response.data]);
            } else {
                toast.error("No se encontraron normalizaciones con esa empresa.");
            }

        } catch (error) {
            console.error("Error al obtener normalizaciones:", error);
            toast.error("Error al obtener normalizaciones.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddObservation = () => {
        setOpenAddDialog(true);
    };

    const handleEdit = async (id: number) => {
        try {
            const response = await api.normalizers.getNormalizerById(id);
            setSelectedNormalizer(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de las normalizaciones:", error);
            toast.error("No se puede acceder a esta normalizacion");
        }
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedNormalizers = normalizers.slice(startIndex, endIndex);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddObservation}
                    fullWidth
                    sx={{ marginBottom: 2, height: "56px" }}
                >
                    Agregar Normalizaciones
                </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Nombre de la Empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value === "" ? "" : (e.target.value))}
                    type="text"
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px" }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    fullWidth
                    disabled={loading}
                    sx={{ marginBottom: 2, height: "56px" }}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </Button>
            </Grid>
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Nombre
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Tipo
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Empresa
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha de Registro
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Realizar Cambios
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedNormalizers.map((normalizer) => (
                                <TableRow key={normalizer.id}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{normalizer.nombre}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{normalizer.tipo}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{normalizer.empresa}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{normalizer.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(normalizer.fecha_registro).toLocaleDateString()}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="info"
                                                    onClick={() => handleEdit(normalizer.id)}
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", margin: "5px" }}
                                                >
                                                    Editar
                                                </Button>

                                                {/* <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => handleDownloadPDF(normalizer.id)}
                                                    sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px",  margin: "5px" }} // Aquí pasamos el id_remision
                                                >
                                                    Descargar PDF
                                                </Button> */}
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
                count={normalizers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
            />
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Agregar Normalizaciones</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}
                >
                    <RegisterNormalizer loadAccess={loadAccess}></RegisterNormalizer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Editar Normalizacion</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedNormalizer && (<UpdatedNormalizer NormalizerData={selectedNormalizer} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}