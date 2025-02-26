import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from "@mui/material";

import { observationModel } from "../../app/models/observationModel";
import { useState, useEffect } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ObservationRegister from "./RegisterObservations";
import { personModel } from "../../app/models/persons";

interface ObservationsProps {
    observations: observationModel[];
    setObservations: React.Dispatch<React.SetStateAction<observationModel[]>>;
}

export default function ObservationList({ observations, setObservations }: ObservationsProps) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState<observationModel | null>(null);
    const [identification, setIdentification] = useState("");
    const [selectedIdPersona, setSelectedIdPersona] = useState<number | null>(null);
    const [personName, setPersonName] = useState("");

    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    const loadAccess = async () => {
        try {
            const response = await api.observations.getAllObservations();
            setObservations(response.data);
        } catch (error) {
            console.error("Error al cargar las personas:", error);
            toast.error("Error al cargar los datos");
        }
    };

    const handleSearch = async () => {
        if (!identification) {
            const defaultResponse = await api.observations.getAllObservations();
            setObservations(defaultResponse.data);
            setPersonName("");
            return;
        }

        setLoading(true);
        try {
            const response = await api.observations.getObservationsByIdentification(identification);
            if (response && Array.isArray(response.data) && response.data.length > 0) {
                setObservations(response.data);
                const personResponse = await api.persons.getPersonByIdentification(identification);
                const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                setPersonName(fullName);
            } else {
                console.error("No se encontraron observaciones:", response);
                toast.error("No se encontraron observaciones con esa identificación.");
                setPersonName("");
            }
        } catch (error) {
            console.error("Error al obtener observaciones:", error);
            toast.error("Error al obtener observaciones.");
            setPersonName("");
        } finally {
            setLoading(false);
        }
    };


    const handleAddObservation = async () => {
        // Primero intentamos encontrar el pago en los pagos existentes
        const foundObservation = observations.find(obs => obs.identificacion === identification);
    
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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedObservations = observations.slice(startIndex, endIndex);

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
                    Agregar Observaciones
                </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Número de Identificación"
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
                    disabled={loading}
                    fullWidth
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
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead  sx={{ backgroundColor: "#B3E5FC" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Persona
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Identificador
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Observacion
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedObservations.map((obs) => (
                                <TableRow key={obs.id_observ}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{obs.id_persona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{obs.identificacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(obs.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{obs.observacion}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component="div"
                count={observations.length}
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
                <DialogTitle>Agregar Observaciones</DialogTitle>
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
                    <ObservationRegister  identificationPerson={identification} person={personName} idPersona={selectedIdPersona ?? 0} loadAccess={loadAccess} ></ObservationRegister>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
