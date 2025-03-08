import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from "@mui/material";

import { paymentsModel } from "../../app/models/paymentsModel";
import { useState, useEffect } from "react";
import PaymentRegister from "./paymentRegister";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import UpdatePayment from "./UpdatedPayment";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


interface Props {
    payments: paymentsModel[];
    setPayments: React.Dispatch<React.SetStateAction<paymentsModel[]>>;
}

export default function PaymentList({ payments: payments, setPayments: setPayments }: Props) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<paymentsModel | null>(null);
    const [identification, setIdentification] = useState("");
    const [selectedIdPersona, setSelectedIdPersona] = useState<number | null>(null);
    const [personName, setPersonName] = useState("");
    const [imageUrlMap, setImageUrlMap] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    const loadAccess = async () => {
        try {
            const response = await api.payments.getAllPayments();
            setPayments(response.data);
        } catch (error) {
            console.error("Error al cargar los pagos:", error);
            toast.error("Error al cargar los datos");
        }
    };

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://backend-sipe.onrender.com/api/";

    const handleSearch = async () => {
        if (!identification) {
            const defaultResponse = await api.payments.getAllPayments();
            setPayments(defaultResponse.data);
            setPersonName("");
            return;
        }

        setLoading(true);
        try {
            const response = await api.payments.getPaymentsByIdentification(identification);
            if (response && Array.isArray(response.data)) {
                setPayments(response.data);
                const personResponse = await api.persons.getPersonByIdentification(identification);
                const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                setPersonName(fullName);
            } else {
                console.error("La respuesta de la API no es un array de pagos:", response);
                toast.error("No se encontraron pagos con esa identificación.");
                setPersonName("");
            }
        } catch (error) {
            console.error("Error al obtener pagos:", error);
            toast.error("Error al obtener pagos.");
            setPersonName("");
        } finally {
            setLoading(false);
        }
    };

    const handleAddObservation = async () => {
        // Primero intentamos encontrar el pago en los pagos existentes
        const foundObservation = payments.find(obs => obs.identificacion === identification);

        if (foundObservation) {
            // Si encontramos el pago, tomamos el id_persona asociado
            setSelectedIdPersona(foundObservation.id_persona);
        } else {
            // Si no encontramos el pago, hacemos una consulta para obtener el id_persona
            try {
                const personResponse = await api.persons.getPersonByIdentification(identification);
                if (personResponse.data) {
                    setSelectedIdPersona(personResponse.data.id_persona);
                    setPersonName(`${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`); // Asignamos el nombre completo // Establecemos el id_persona
                } else {
                    toast.warning("No se encontró persona con esa identificación.");
                    return; // Si no se encuentra la persona, no abrimos el diálogo
                }
            } catch (error) {
                console.error("Error al obtener persona:", error);
                toast.error("Error al obtener información de la persona.");
                return; // Si hay un error en la consulta, no abrimos el diálogo
            }
        }

        // Abrimos el diálogo para agregar el pago
        setOpenAddDialog(true);
    };

    const handleEdit = async (id_pago: number) => {
        try {
            const response = await api.payments.getPaymentsByIDPago(id_pago);
            setSelectedPayment(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los pagos:", error);
            toast.error("No se puede acceder a este pago inactiva");
        }
    };

    const handleFileUrl = (filePath: File | string | null) => {
        if (!filePath) return "Sin archivo";

        // Si es una instancia de File (subido localmente)
        if (filePath instanceof File) {
            const localFileUrl = URL.createObjectURL(filePath);
            if (filePath.name.endsWith(".pdf")) {
                return (
                    <>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => window.open(localFileUrl, '_blank')}
                            sx={{ marginRight: 1 }}
                        >
                            Ver PDF
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => downloadFile(localFileUrl, filePath.name)}
                        >
                            Descargar
                        </Button>
                    </>
                );
            }

            return (
                <img
                    src={localFileUrl}
                    alt="Archivo"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
            );
        }

        // Si es una URL del backend (string)
        if (typeof filePath === 'string') {
            const backendFileUrl = `${backendUrl.replace('/api/', '')}/${filePath}`;

            if (filePath.endsWith(".pdf")) {
                return (
                    <>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => window.open(backendFileUrl, '_blank')}
                            sx={{ marginRight: 1, textTransform: "none", height: "45px", }}
                        >
                            Ver Archivo
                        </Button>
                    </>
                );
            }

            return (
                <img
                    src={backendFileUrl}
                    alt="Archivo"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
            );
        }

        return "Archivo no válido";
    };

    const downloadFile = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const [imageUrlMap1, setImageUrlMap1] = useState<Map<string, string>>(new Map());


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleDownloadPDF = () => {
        const paymentsToDownload = payments.filter((p) => p.identificacion === identification);

        if (paymentsToDownload.length === 0) {
            toast.error("No se encontraron pagos para esta persona.");
            return;
        }

        const doc = new jsPDF();

        // Encabezado del PDF con el nombre completo
        doc.setFontSize(16);
        doc.text("Detalle de Pagos", 14, 10);
        doc.setFontSize(12);
        doc.text(`Nombre: ${personName}`, 14, 20);
        doc.text(`Identificación: ${identification}`, 14, 30);

        // Agregar la tabla de pagos
        autoTable(doc, {
            startY: 40,
            head: [["Comprobante", "Tipo de Pago", "Fecha de Pago", "Monto", "Moneda", "Estado"]],
            body: paymentsToDownload.map((payment) => [
                payment.comprobante,
                payment.tipo_pago.replace(/_/g, " "),
                new Date(payment.fecha_pago).toLocaleDateString(),
                payment.monto,
                payment.moneda,
                payment.estado,
            ]),
        });

        // Guardar el PDF
        doc.save(`Pagos_${identification}.pdf`);
    };


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPayments = payments.slice(startIndex, endIndex);
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddObservation}
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none", mr: 1 }}
                >
                    Agregar Pagos
                </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Identificación"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    sx={{
                        marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px", height: "45px",
                        "& .MuiInputBase-root": { height: "45px" }
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    fullWidth
                    disabled={loading}
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Nombre de la persona"
                    value={personName}
                    InputProps={{ readOnly: true }}
                    sx={{
                        marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px", height: "45px",
                        "& .MuiInputBase-root": { height: "45px" }
                    }}
                />
            </Grid>
            {payments.some((payment) => payment.identificacion === identification) && (
                <Grid item xs={12} sm={6} md={1}>
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => handleDownloadPDF()}
                        sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                    >
                        Descargar PDF
                    </Button>
                </Grid>
            )}
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '180px', border: '1px solid black' }}>
                                    Numero de identificacion
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Comprobante
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Tipo de pago
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Fecha de pago
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '160px', border: '1px solid black' }}>
                                    fecha de presentacion
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Monto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Moneda
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Usuario
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Observaciones
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Archivo
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Tipo de Movimiento
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedPayments.map((payments) => (
                                <TableRow key={payments.id_pago}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.identificacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.comprobante}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.tipo_pago}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(payments.fecha_pago).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(payments.fecha_presentacion).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.monto}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.moneda}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.usuario}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.observaciones}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{handleFileUrl(payments.archivo)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{payments.tipo_movimiento}</TableCell>
                                    <TableCell align="center" sx={{ border: '1px solid black' }}>
                                        <Button
                                            variant="contained"
                                            color="info"
                                            sx={{ fontSize: "0.75rem", minWidth: "50px", minHeight: "20px", textTransform: "none" }}
                                            onClick={() => handleEdit(payments.id_pago)}
                                        >
                                            Editar
                                        </Button>
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
                count={payments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
            <Dialog
                open={openAddDialog}
                // onClose={() => setOpenAddDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Agregar Pago o Deposito</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}
                >
                    <PaymentRegister identificationPerson={identification} person={personName} idPersona={selectedIdPersona ?? 0} loadAccess={loadAccess} ></PaymentRegister>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="register-payments-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Ingresar Pago
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Pagos</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '270px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedPayment && (<UpdatePayment PaymentsData={selectedPayment} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="update-payments-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Pago
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}
