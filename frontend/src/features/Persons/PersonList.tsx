import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TablePagination, TextField,
    Box,
} from "@mui/material";
import { personModel } from "../../app/models/persons";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "@mui/material/styles";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';
import TableAddData from "./TableAddData";
import TableUpdateData from "./TableUpdateData";
import { contactsModel } from "../../app/models/contactsModel";
import { directionsModel } from "../../app/models/directionsModel";
import { familyModel } from "../../app/models/familyModel";
import { incomesModel } from "../../app/models/incomesModel";
import { filesModel } from "../../app/models/filesModel";

interface Props {
    persons: personModel[];
    setPersons: React.Dispatch<React.SetStateAction<personModel[]>>;
}

export default function PersonList({
    persons: persons,
    setPersons: setPersons
}: Props) {
    const [selectedPerson, setSelectedPerson] = useState<personModel | null>(
        null
    );
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [personName, setPersonName] = useState("");
    const [identification, setIdentification] = useState("");
    const [loading, setLoading] = useState(false);
    const [newPerson, setNewPerson] = useState<Partial<personModel>>({
        id_persona: 0,
        tipo_identificacion: "",
        numero_identifiacion: "",
        nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        fecha_nacimiento: new Date(),
        genero: "",
        estado_civil: "",
        nacionalidad: "",
        fecha_registro: new Date(),
        usuario_registro: "",
        nivel_estudios: "",
        asesor: "",
        estado: "",
    });
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    const loadAccess = async () => {
        try {
            const response = await api.persons.getPersons();
            setPersons(response.data);
        } catch (error) {
            console.error("Error al cargar las personas:", error);
            toast.error("Error al cargar los datos");
        }
    };

    const handleDelete = async (id_persona: number) => {
        try {
            await api.persons.deletePersons(id_persona);
            toast.success("Persona Desactivada correctamente");
            loadAccess();
        } catch (error) {
            console.error("Error al eliminar la persona:", error);
            toast.error("Error al desactivar a la persona");
        }
    };

    const handleEdit = async (id_persona: number) => {
        try {
            const response = await api.persons.getPersonById(id_persona);
            setSelectedPerson(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de la persona:", error);
            toast.error("Persona Inactiva");
        }
    };


    const handleSearch = async () => {
        if (!identification.trim()) {
            try {
                const defaultResponse = await api.persons.getPersons();
                setPersons(defaultResponse.data);
                setPersonName("");
            } catch (error) {
                console.error("Error al cargar la lista de personas:", error);
                toast.error("Error al obtener los datos.");
            }
            return;
        }

        setLoading(true);
        try {
            const response = await api.persons.getPersonByIdentification(identification);

            if (response && response.data) {
                let personsData = Array.isArray(response.data) ? response.data : [response.data];

                if (personsData.length > 0) {
                    setPersons(personsData);
                    const firstPerson = personsData[0];
                    const fullName = `${firstPerson.nombre || ""} ${firstPerson.primer_apellido || ""} ${firstPerson.segundo_apellido || ""}`.trim();
                    setPersonName(fullName);
                } else {
                    setPersons([]);
                    setPersonName("");
                    toast.warning("No se encontraron personas con esa identificación.");
                }
            } else {
                setPersons([]);
                setPersonName("");
                toast.warning("No se encontraron datos.");
            }
        } catch (error) {
            console.error("Error al obtener personas:", error);
            toast.error("Error al obtener personas.");
            setPersons([]);
            setPersonName("");
        } finally {
            setLoading(false);
        }
    };


    const handleDownloadPDF = async (id_persona: number) => {
        const person = persons.find(p => p.id_persona === id_persona);

        if (!person) {
            toast.error("No se encontró la persona para descargar.");
            return;
        }

        try {
            // Obtener detalles adicionales de la persona
            const [familyRes, directionsRes, contactsRes, incomesRes, filesRes] = await Promise.allSettled([
                api.family.getMembersByPerson(id_persona),
                api.directions.getDireccionesByPersona(id_persona),
                api.contacts.getContactsByPerson(id_persona),
                api.incomes.getIncomesByPerson(id_persona),
                api.history.getFilesByIdPerson(id_persona)
            ]);

            const familyDetails: familyModel[] = familyRes.status === "fulfilled" ? familyRes.value.data || [] : [];
            const directionsDetails: directionsModel[] = directionsRes.status === "fulfilled" ? directionsRes.value.data || [] : [];
            const contactsDetails: contactsModel[] = contactsRes.status === "fulfilled" ? contactsRes.value.data || [] : [];
            const incomesDetails: incomesModel[] = incomesRes.status === "fulfilled" ? incomesRes.value.data || [] : [];
            const filesDetails: filesModel[] = filesRes.status === "fulfilled" ? filesRes.value.data || [] : [];

            const doc = new jsPDF();
            let yPos = 10;

            // Título principal
            doc.setFontSize(16);
            doc.text("Información de la Persona", 14, yPos);
            yPos += 10;

            // Tabla de información personal
            autoTable(doc, {
                startY: yPos,
                head: [["ID", "Identificación", "Nombre Completo", "Fecha Nacimiento", "Género", "Estado Civil", "Nacionalidad", "Nivel de Estudios", "Asesor"]],
                body: [[
                    person.id_persona,
                    `${person.numero_identifiacion}`,
                    `${person.nombre} ${person.primer_apellido} ${person.segundo_apellido}`,
                    new Date(person.fecha_nacimiento).toLocaleDateString(),
                    person.genero,
                    person.estado_civil,
                    person.nacionalidad,
                    person.nivel_estudios,
                    person.asesor
                ]],
            });

            yPos = (doc as any).lastAutoTable?.finalY || 30;

            // Función auxiliar para generar tablas
            const generarTabla = (titulo: string, columnas: string[], data: any[]) => {
                doc.setFontSize(14);
                doc.text(titulo, 14, yPos + 10);

                autoTable(doc, {
                    startY: yPos + 15,
                    head: [columnas],
                    body: data.length > 0 ? data : [["Aún no se ingresa información"]],
                });

                yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
            };

            // Generar cada tabla con validación de datos
            generarTabla("Núcleo Familiar", ["Cédula", "Nombre", "Fecha Nacimiento", "Relación", "Ingresos", "Observaciones"],
                familyDetails.length > 0 ? familyDetails.map(fam => [
                    fam.cedula,
                    fam.nombre_completo,
                    new Date(fam.fecha_nacimiento).toLocaleDateString(),
                    fam.relacion,
                    fam.ingresos,
                    fam.observaciones || "N/A"
                ]) : []
            );

            generarTabla("Direcciones", ["Provincia", "Cantón", "Distrito", "Barrio", "Otras Señales", "Tipo", "Estado"],
                directionsDetails.length > 0 ? directionsDetails.map(dir => [
                    dir.provincia,
                    dir.canton,
                    dir.distrito,
                    dir.barrio,
                    dir.otras_senas || "N/A",
                    dir.tipo_direccion,
                    dir.estado
                ]) : []
            );

            generarTabla("Contactos", ["Tipo", "Identificador", "Estado", "Fecha Registro", "Comentarios"],
                contactsDetails.length > 0 ? contactsDetails.map(cont => [
                    cont.tipo_contacto,
                    cont.identificador,
                    cont.estado,
                    new Date(cont.fecha_registro).toLocaleDateString(),
                    cont.comentarios || "N/A"
                ]) : []
            );

            generarTabla("Ingresos", ["Segmento", "Subsegmento", "Patrono", "Ocupación", "Salario Bruto", "Salario Neto", "Fecha Ingreso"],
                incomesDetails.length > 0 ? incomesDetails.map(inc => [
                    inc.segmento,
                    inc.subsegmento,
                    inc.patrono || "N/A",
                    inc.ocupacion,
                    `$${inc.salario_bruto.toFixed(2)}`,
                    `$${inc.salario_neto.toFixed(2)}`,
                    new Date(inc.fecha_ingreso).toLocaleDateString()
                ]) : []
            );

            generarTabla("Expediente", ["Código", "Tipo", "Estado", "Fecha Creación", "Ubicación", "Observaciones"],
                filesDetails.length > 0 ? filesDetails.map(file => [
                    file.codigo,
                    file.tipo_expediente,
                    file.estado,
                    new Date(file.fecha_creacion).toLocaleDateString(),
                    file.ubicacion || "N/A",
                    file.observaciones || "N/A"
                ]) : []
            );

            // Guardar el PDF
            doc.save(`Persona_${person.id_persona}.pdf`);
        } catch (error) {
            console.error("Error al obtener detalles de la persona:", error);
            toast.error("Error al obtener detalles de la persona.");
        }
    };

    const handleDownloadPDFHistory = async () => {
        // Se utiliza la primera persona del arreglo filtrado (ajusta la lógica según tu necesidad)
        if (!persons || persons.length === 0) {
            toast.error("No hay una persona seleccionada para descargar el historial de cambios.");
            return;
        }
        const personId = persons[0].id_persona;

        try {
            const response = await api.persons.getPersonHistoryChanges(personId);
            const historyData = response.data; // Se espera un arreglo de personHistoryModel

            const doc = new jsPDF();
            let yPos = 10;
            doc.setFontSize(16);
            doc.text(`Historial de Cambios - Persona ${personId}`, 14, yPos);
            yPos += 10;

            autoTable(doc, {
                startY: yPos,
                head: [["Fecha", "Objeto", "Campo Modificado", "Valor Anterior", "Valor Nuevo", "Usuario"]],
                body: historyData.length > 0 ? historyData.map((item: any) => [
                    new Date(item.fecha).toLocaleDateString(),
                    item.objeto,
                    item.campo_modificado,
                    item.valor_anterior,
                    item.valor_nuevo,
                    item.usuario,
                ]) : [["No hay historial de cambios disponible"]],
            });

            doc.save(`Historial_Cambios_Persona_${personId}.pdf`);
        } catch (error) {
            console.error("Error al obtener historial de cambios:", error);
            toast.error("Error al obtener historial de cambios.");
        }
    };


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPersons = persons.slice(startIndex, endIndex);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddDialog(true)}
                    fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                >
                    Agregar Persona
                </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Número de Identificación"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px", height: "45px",
                        "& .MuiInputBase-root": { height: "45px" } }}
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
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px", height: "45px",
                        "& .MuiInputBase-root": { height: "45px" } }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadPDFHistory}
                    fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                >
                    Descargar Historial
                </Button>
            </Grid>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                        <TableRow>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}
                            >
                                ID de la persona
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '160px', border: '1px solid black' }}
                            >
                                Tipo de identificacion
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '180px', border: '1px solid black' }}
                            >
                                Numero de identificacion
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Nombre
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}
                            >
                                Primer Apellido
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '130px', border: '1px solid black' }}
                            >
                                Segundo Apellido
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}
                            >
                                Fecha de Nacimiento
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Genero
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Estado Civil
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Nacionalidad
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}
                            >
                                Fecha de Registro
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem",  border: '1px solid black' }}
                            >
                                Usuario
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}
                            >
                                Nivel de estudio
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Discapacidad
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Asesor
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}
                            >
                                Estado
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
                        {paginatedPersons.map((person) => (
                            <TableRow key={person.id_persona}>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.id_persona}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.tipo_identificacion}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.numero_identifiacion}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.nombre}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.primer_apellido}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.segundo_apellido}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(person.fecha_nacimiento).toLocaleDateString()}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.genero}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.estado_civil}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.nacionalidad}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(person.fecha_registro).toLocaleDateString()}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.usuario_registro}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.nivel_estudios}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.discapacidad}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.asesor}</TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{person.estado}</TableCell>
                                <TableCell align="center" sx={{ border: '1px solid black' }}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <Box display="flex" justifyContent="center" gap={1}>
                                            <Button
                                                variant="contained"
                                                color="info"
                                                sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", textTransform: "none" }}
                                                onClick={() => handleEdit(person.id_persona)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                sx={{ fontSize: "0.65rem", minWidth: "40px", minHeight: "20px", textTransform: "none" }}
                                                onClick={() => handleDelete(person.id_persona)}
                                            >
                                                Desactivar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                sx={{ fontSize: "0.65rem", minWidth: "50px", minHeight: "20px", textTransform: "none" }}
                                                onClick={() => handleDownloadPDF(person.id_persona)} // Aquí pasamos el id_remision
                                            >
                                                Descargar PDF
                                            </Button>
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component="div"
                count={persons.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) =>
                    setRowsPerPage(parseInt(event.target.value, 10))
                }
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />

            <Dialog
                open={openAddDialog}
                // onClose={() => setOpenAddDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Agregar Persona</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    <TableAddData loadAccess={loadAccess} setSelectedTab={setSelectedTab} ></TableAddData>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    {selectedTab === 0 && ( // Personas
                        <Button sx={{ textTransform: "none"}} type="submit" form="register-person-form" variant="contained" color="primary">
                            Ingresar Persona
                        </Button>
                    )}
                    {selectedTab === 1 && ( // Personas
                        <Button sx={{ textTransform: "none"}} type="submit" form="register-directions-form" variant="contained" color="primary">
                            Ingresar Direccion
                        </Button>
                    )}
                    {selectedTab === 2 && ( // Personas
                        <Button sx={{ textTransform: "none"}} type="submit" form="register-contacts-form" variant="contained" color="primary">
                            Ingresar Contactos
                        </Button>
                    )}
                    {selectedTab === 3 && ( // Personas
                        <Button sx={{ textTransform: "none"}} type="submit" form="register-incomes-form" variant="contained" color="primary">
                            Agregar Ingresos
                        </Button>
                    )}
                    {selectedTab === 4 && ( // Personas
                        <Button sx={{ textTransform: "none"}} type="submit" form="register-family-form" variant="contained" color="primary">
                            Ingresar Familiar
                        </Button>
                    )}
                    <Button sx={{ textTransform: "none"}} onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Persona</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedPerson && (<TableUpdateData person={selectedPerson} loadAccess={loadAccess} setSelectedTab={setSelectedTab} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    {selectedTab === 0 && ( // Personas
                        <Button sx={{ textTransform: "none"}} type="submit" form="update-person-form" variant="contained" color="primary">
                            Actualizar Persona
                        </Button>
                    )}
                    <Button sx={{ textTransform: "none"}} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}
