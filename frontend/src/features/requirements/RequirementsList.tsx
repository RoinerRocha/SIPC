import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from "@mui/material";

import { personModel } from "../../app/models/persons";
import RequirementRegister from "./RegisterRequirement";
import { useState, useEffect } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { requirementsModel } from "../../app/models/requirementsModel";
import UpdateRequirements from "./UpdatedRequirements";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface RequirementProps {
    requirements: requirementsModel[];
    setRequirements: React.Dispatch<React.SetStateAction<requirementsModel[]>>;
}

export default function RequirementList({ requirements: requirements, setRequirements: setRequirements }: RequirementProps) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<requirementsModel | null>(null);
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
            const response = await api.requirements.getAllRequirements();
            setRequirements(response.data);
        } catch (error) {
            console.error("Error al cargar las personas:", error);
            toast.error("Error al cargar los datos");
        }
    };

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://backend-sipe.onrender.com/api/";

    const handleSearch = async () => {
        if (!identification) {
            const defaultResponse = await api.requirements.getAllRequirements();
            setRequirements(defaultResponse.data);
            setPersonName("");
            return;
        }

        setLoading(true);
        try {
            const response = await api.requirements.getRequirementByIdentification(identification);
            if (response && Array.isArray(response.data)) {
                setRequirements(response.data);
                const personResponse = await api.persons.getPersonByIdentification(identification);
                const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                setPersonName(fullName);
            } else {
                console.error("La respuesta de la API no es un array de requerimientos:", response);
                toast.error("No se encontraron requerimientos con esa identificación.");
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
        const foundObservation = requirements.find(obs => obs.identificacion === identification);

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

    const handleEdit = async (id_requisito: number) => {
        try {
            const response = await api.requirements.getRequirementById(id_requisito);
            setSelectedRequirement(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los requerimientos:", error);
            toast.error("No se puede acceder a este pago inactiva");
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Lista de Requisitos", 14, 10);

        autoTable(doc, {
            startY: 20,
            head: [["ID Persona", "Tipo", "Estado", "Fecha Vigencia", "Fecha Vencimiento", "Observaciones"]],
            body: requirements.map(req => [
                req.id_persona,
                req.tipo_requisito,
                req.estado,
                new Date(req.fecha_vigencia).toLocaleDateString(),
                new Date(req.fecha_vencimiento).toLocaleDateString(),
                req.observaciones || "N/A"
            ]),
        });

        doc.save("Requisitos.pdf");
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
                            sx={{ marginRight: 1 }}
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

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedRequirements = requirements.slice(startIndex, endIndex);

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
                    Agregar Requerimientos
                </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <TextField
                    fullWidth
                    label="Identificación"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px" }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Nombre de la persona"
                    value={personName}
                    InputProps={{ readOnly: true }}
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px" }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDownloadPDF}
                    sx={{ marginBottom: 2, height: "56px" }}
                >
                    Descargar PDF
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
                                    ID de la persona
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Tipo de requisito
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha de Vigencia
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha de vencimiento
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Observaciones
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Archivo
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Realizar Cambios
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRequirements.map((requirement) => (
                                <TableRow key={requirement.id_requisito}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{requirement.id_persona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{requirement.tipo_requisito}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{requirement.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(requirement.fecha_vigencia).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(requirement.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{requirement.observaciones}</TableCell>
                                    <TableCell align="center">{handleFileUrl(requirement.archivo)}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="info"
                                            sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px" }}
                                            onClick={() => handleEdit(requirement.id_requisito)}
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
                count={requirements.length}
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
                <DialogTitle>Agregar Requerimiento</DialogTitle>
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
                    <RequirementRegister identificationPerson={identification} person={personName} idPersona={selectedIdPersona ?? 0} loadAccess={loadAccess} ></RequirementRegister>
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
                    {selectedRequirement && (<UpdateRequirements requirementsData={selectedRequirement} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
};