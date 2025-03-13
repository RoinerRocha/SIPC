import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TablePagination, TextField, CircularProgress,
    Box, IconButton, Tooltip,
} from "@mui/material";
import { personModel } from "../../app/models/persons";
import { useMemo, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import TableAddData from "./TableAddData";
import TableUpdateData from "./TableUpdateData";
import { contactsModel } from "../../app/models/contactsModel";
import { directionsModel } from "../../app/models/directionsModel";
import { familyModel } from "../../app/models/familyModel";
import { incomesModel } from "../../app/models/incomesModel";
import { filesModel } from "../../app/models/filesModel";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, FileDownload as FileDownloadIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon, } from "@mui/icons-material";

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
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [personName, setPersonName] = useState("");
    const [identification, setIdentification] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [globalFilter, setGlobalFilter] = useState("");

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
        try {
            // Obtener la persona por ID
            const response = await api.persons.getPersonById(id_persona);
            const personToDownload: personModel = response.data;

            if (!personToDownload) {
                toast.error("No se encontró la persona para descargar.");
                return;
            }

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

            // Encabezado del PDF
            doc.setFontSize(16);
            doc.text("Información de la Persona", 14, 10);

            // Tabla con los datos principales de la persona
            autoTable(doc, {
                startY: 20,
                head: [["ID", "Identificación", "Nombre Completo", "Fecha Nacimiento", "Género", "Estado Civil", "Nacionalidad", "Nivel de Estudios", "Asesor"]],
                body: [[
                    personToDownload.id_persona,
                    `${personToDownload.numero_identifiacion}`,
                    `${personToDownload.nombre} ${personToDownload.primer_apellido} ${personToDownload.segundo_apellido}`,
                    new Date(personToDownload.fecha_nacimiento).toLocaleDateString(),
                    personToDownload.genero,
                    personToDownload.estado_civil,
                    personToDownload.nacionalidad,
                    personToDownload.nivel_estudios,
                    personToDownload.asesor || "N/A"
                ]],
            });

            // Obtener la posición de la última tabla agregada
            let lastTable = (doc as any).lastAutoTable;
            let nextTableY = lastTable ? lastTable.finalY + 10 : 30;

            // Función auxiliar para agregar secciones de detalles
            const agregarSeccion = (titulo: string, columnas: string[], datos: any[]) => {
                doc.setFontSize(14);
                doc.text(titulo, 14, nextTableY - 5);

                if (datos.length > 0) {
                    autoTable(doc, {
                        startY: nextTableY,
                        head: [columnas],
                        body: datos,
                    });
                    nextTableY = (doc as any).lastAutoTable.finalY + 10;
                } else {
                    doc.setFontSize(12);
                    doc.text("No hay información disponible.", 14, nextTableY);
                    nextTableY += 10;
                }
            };

            // Agregar datos de detalles
            agregarSeccion("Núcleo Familiar", ["Cédula", "Nombre", "Fecha Nacimiento", "Relación", "Ingresos", "Observaciones"],
                familyDetails.map(fam => [
                    fam.cedula,
                    fam.nombre_completo,
                    new Date(fam.fecha_nacimiento).toLocaleDateString(),
                    fam.relacion,
                    fam.ingresos,
                    fam.observaciones || "N/A"
                ])
            );

            agregarSeccion("Direcciones", ["Provincia", "Cantón", "Distrito", "Barrio", "Otras Señales", "Tipo", "Estado"],
                directionsDetails.map(dir => [
                    dir.provincia,
                    dir.canton,
                    dir.distrito,
                    dir.barrio,
                    dir.otras_senas || "N/A",
                    dir.tipo_direccion,
                    dir.estado
                ])
            );

            agregarSeccion("Contactos", ["Tipo", "Identificador", "Estado", "Fecha Registro", "Comentarios"],
                contactsDetails.map(cont => [
                    cont.tipo_contacto,
                    cont.identificador,
                    cont.estado,
                    new Date(cont.fecha_registro).toLocaleDateString(),
                    cont.comentarios || "N/A"
                ])
            );

            agregarSeccion("Ingresos", ["Segmento", "Subsegmento", "Patrono", "Ocupación", "Salario Bruto", "Salario Neto", "Fecha Ingreso"],
                incomesDetails.map(inc => [
                    inc.segmento,
                    inc.subsegmento,
                    inc.patrono || "N/A",
                    inc.ocupacion,
                    `$${inc.salario_bruto.toFixed(2)}`,
                    `$${inc.salario_neto.toFixed(2)}`,
                    new Date(inc.fecha_ingreso).toLocaleDateString()
                ])
            );

            agregarSeccion("Expediente", ["Código", "Tipo", "Estado", "Fecha Creación", "Ubicación", "Observaciones"],
                filesDetails.map(file => [
                    file.codigo,
                    file.tipo_expediente,
                    file.estado,
                    new Date(file.fecha_creacion).toLocaleDateString(),
                    file.ubicacion || "N/A",
                    file.observaciones || "N/A"
                ])
            );

            // Guardar el PDF
            doc.save(`Persona_${personToDownload.id_persona}.pdf`);
            toast.success("PDF generado con éxito.");
        } catch (error) {
            console.error("Error al obtener detalles de la persona:", error);
            toast.error("Error al obtener detalles de la persona.");
        }
    };

    const handleDownloadPDFHistory = async () => {
        if (!identification.trim()) {
            toast.error("Ingrese un número de identificación para descargar el historial.");
            return;
        }

        try {
            const response = await api.persons.getPersonByIdentification(identification);

            if (!response || !response.data) {
                toast.error("No se encontró una persona con esa identificación.");
                return;
            }

            const personData = Array.isArray(response.data) ? response.data[0] : response.data;

            if (!personData || !personData.id_persona) {
                toast.error("No se encontró el ID de la persona.");
                return;
            }

            const personId = personData.id_persona;
            const personName = `${personData.nombre} ${personData.primer_apellido} ${personData.segundo_apellido}`.trim();

            const historyResponse = await api.persons.getPersonHistoryChanges(personId);
            const historyData = historyResponse.data;

            if (!historyData || historyData.length === 0) {
                toast.warning("No hay historial de cambios para esta persona.");
                return;
            }

            const doc = new jsPDF();
            let yPos = 10;
            doc.setFontSize(16);
            doc.text(`Historial de Cambios - Persona ${personName}`, 14, yPos);
            yPos += 10;

            autoTable(doc, {
                startY: yPos,
                head: [["Fecha", "Objeto", "Campo Modificado", "Valor Anterior", "Valor Nuevo", "Usuario"]],
                body: historyData.map((item: any) => [
                    new Date(item.fecha).toLocaleDateString(),
                    item.objeto,
                    item.campo_modificado,
                    item.valor_anterior,
                    item.valor_nuevo,
                    item.usuario,
                ]),
            });

            const safePersonName = personName.replace(/[^a-zA-Z0-9]/g, "_");

            doc.save(`Historial_Cambios_Persona_${safePersonName}.pdf`);
        } catch (error) {
            console.error("Error al obtener historial de cambios:", error);
            toast.error("Error al obtener historial de cambios.");
        }
    };

    const columns = useMemo<MRT_ColumnDef<personModel>[]>(() => [
        {
            accessorKey: "acciones",
            header: "Acciones",
            size: 120,
            Cell: ({ row }) => (
                <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="Editar">
                        <IconButton color="info" onClick={() => handleEdit(row.original.id_persona)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar">
                        <IconButton color="error" onClick={() => handleDelete(row.original.id_persona)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar PDF">
                        <IconButton color="success" onClick={() => handleDownloadPDF(row.original.id_persona)}>
                            <PdfIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
        { accessorKey: "id_persona", header: "ID Persona", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "tipo_identificacion", header: "Tipo de Identificacion", size: 180, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "numero_identifiacion", header: "Número de Identificación", size: 180, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "nombre", header: "Nombre", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "primer_apellido", header: "Primer Apellido", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "segundo_apellido", header: "Segundo Apellido", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        {
            accessorKey: "fecha_nacimiento", header: "Fecha Nacimiento", size: 150, muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" }, Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString()
        },
        { accessorKey: "genero", header: "Género", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "estado_civil", header: "Estado Civil", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "nacionalidad", header: "Nacionalidad", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        {
            accessorKey: "fecha_registro", header: "Fecha de Registro", size: 150, muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" }, Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString()
        },
        { accessorKey: "usuario_registro", header: "Usuario", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "nivel_estudios", header: "Nivel de Estudios", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "discapacidad", header: "Discapacidad", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "asesor", header: "Asesor", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
        { accessorKey: "estado", header: "Estado", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: persons,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        onGlobalFilterChange: (value) => {
            const newValue = value ?? "";
            setGlobalFilter(newValue);

            if (newValue.trim() === "") {
                setIdentification("");
                setPersonName("");
            } else {
                setIdentification(newValue);
            }
        },
        state: { globalFilter },
        localization: MRT_Localization_ES,
        muiTopToolbarProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en la barra de herramientas
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en la barra inferior (paginación)
            },
        },
        muiTablePaperProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en toda la tabla
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en el fondo del contenedor de la tabla
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976D2", // Azul primario para encabezados
                color: "white",
                fontWeight: "bold",
                border: "2px solid #1565C0",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: "white", // Blanco para las celdas
                borderBottom: "1px solid #BDBDBD",
                border: "1px solid #BDBDBD", // Gris medio para bordes
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "#E3F2FD", borderRadius: "8px" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddDialog(true)}
                    fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                >
                    Agregar Persona
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadPDFHistory}
                    fullWidth
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                >
                    Descargar Historial
                </Button>
            </Box>
        )
    });

    return (
        <Grid container spacing={2}>
            <Paper sx={{ width: "100%", p: 2 }}>
                {loading ? <CircularProgress sx={{ margin: "20px auto", display: "block" }} /> : <MaterialReactTable table={table} />}
            </Paper>

            <Dialog
                open={openAddDialog}
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
                        <Button sx={{ textTransform: "none" }} type="submit" form="register-person-form" variant="contained" color="primary">
                            Ingresar Persona
                        </Button>
                    )}
                    {selectedTab === 1 && ( // Personas
                        <Button sx={{ textTransform: "none" }} type="submit" form="register-directions-form" variant="contained" color="primary">
                            Ingresar Direccion
                        </Button>
                    )}
                    {selectedTab === 2 && ( // Personas
                        <Button sx={{ textTransform: "none" }} type="submit" form="register-contacts-form" variant="contained" color="primary">
                            Ingresar Contactos
                        </Button>
                    )}
                    {selectedTab === 3 && ( // Personas
                        <Button sx={{ textTransform: "none" }} type="submit" form="register-incomes-form" variant="contained" color="primary">
                            Agregar Ingresos
                        </Button>
                    )}
                    {selectedTab === 4 && ( // Personas
                        <Button sx={{ textTransform: "none" }} type="submit" form="register-family-form" variant="contained" color="primary">
                            Ingresar Familiar
                        </Button>
                    )}
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
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
                        <Button sx={{ textTransform: "none" }} type="submit" form="update-person-form" variant="contained" color="primary">
                            Actualizar Persona
                        </Button>
                    )}
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}
