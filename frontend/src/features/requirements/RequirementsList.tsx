import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField,
    IconButton,
    Tooltip,
    Box
} from "@mui/material";

import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, AddCircle as AddCircleIcon, PictureAsPdf as PictureAsPdfIcon, Visibility as VisibilityIcon } from "@mui/icons-material";


import { personModel } from "../../app/models/persons";
import RequirementRegister from "./RegisterRequirement";
import { useMemo, useState, useEffect } from "react";
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
    const [persons, setPersons] = useState<personModel[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    useEffect(() => {
        loadAccess();
    }, [identification]);


    const loadAccess = async () => {
        try {
            setLoading(true);

            if (identification.length === 9 && /^\d{9}$/.test(identification)) {
                // Buscar requerimientos por identificación
                const response = await api.requirements.getRequirementByIdentification(identification);
                if (response && Array.isArray(response.data)) {
                    setRequirements(response.data);

                    // Buscar datos de la persona asociada
                    const personResponse = await api.persons.getPersonByIdentification(identification);
                    const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                    setPersonName(fullName);
                } else {
                    setPersonName("");
                    setRequirements([]);
                    toast.error("No se encontraron requerimientos con esa identificación.");
                }
            } else if (identification.length === 0) {
                // Cargar datos generales solo si no hay identificación
                const personsResponse = await api.persons.getPersons();
                const personsData: personModel[] = personsResponse.data;
                setPersons(personsData);

                const requirementsResponse = await api.requirements.getAllRequirements();
                const requirementsData: requirementsModel[] = requirementsResponse.data;

                // Asignar identificaciones
                const requirementsWithIdentification = requirementsData.map((req: requirementsModel) => {
                    const person = personsData.find((p: personModel) => p.id_persona === req.id_persona);
                    return { ...req, identificacion: person ? person.numero_identifiacion : "No asignada" };
                });

                setRequirements(requirementsWithIdentification);
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
            toast.error("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://backend-sipe.onrender.com/api/";

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await api.requirements.getRequirementByIdentification(identification);
            if (response && Array.isArray(response.data)) {
                setRequirements(response.data);
                const personResponse = await api.persons.getPersonByIdentification(identification);
                const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                setPersonName(fullName);
            } else {
                toast.error("No se encontraron requerimientos con esa identificación.");
                setPersonName("");
            }
        } catch (error) {
            toast.error("Error al obtener los requerimientos.");
            setPersonName("");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRequirement = async () => {
        const foundRequirement = requirements.find(req => req.identificacion === identification);

        if (foundRequirement) {
            setSelectedIdPersona(foundRequirement.id_persona);
        } else {
            try {
                const personResponse = await api.persons.getPersonByIdentification(identification);
                if (personResponse.data) {
                    setSelectedIdPersona(personResponse.data.id_persona);
                    setPersonName(`${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim());
                } else {
                    toast.warning("No se encontró persona con esa identificación.");
                    return;
                }
            } catch (error) {
                toast.error("Error al obtener información de la persona.");
                return;
            }
        }
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
                        <Tooltip title="Ver Archivo">
                            <IconButton
                                color="secondary"
                                onClick={() => window.open(localFileUrl, '_blank')}
                            >
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
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
                        <Tooltip title="Ver Archivo">
                            <IconButton
                                color="secondary"
                                onClick={() => window.open(backendFileUrl, '_blank')}
                                sx={{ marginRight: 1 }}
                            >
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
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

    const columns = useMemo<MRT_ColumnDef<requirementsModel>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                Cell: ({ row }) => (
                    <Tooltip title="Editar">
                        <IconButton
                            color="primary"
                            onClick={() => handleEdit(row.original.id_requisito)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                ),
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            { accessorKey: "identificacion", header: "Identificación" },
            { accessorKey: "tipo_requisito", header: "Tipo de Requisito" },
            { accessorKey: "estado", header: "Estado" },
            { accessorKey: "fecha_vigencia", header: "Fecha de Vigencia" },
            { accessorKey: "fecha_vencimiento", header: "Fecha de Vencimiento" },
            { accessorKey: "observaciones", header: "Observaciones" },
            {
                accessorKey: "archivo",
                header: "Archivo",
                Cell: ({ row }) => handleFileUrl(row.original.archivo)
            }
        ],
        []
    );


    const table = useMaterialReactTable({
        columns,
        data: requirements,
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2 }}>
                <Button variant="contained" color="primary" onClick={handleAddRequirement}>
                    Agregar Requerimiento
                </Button>
                <Button variant="contained" color="error" onClick={handleDownloadPDF}>
                    Descargar PDF
                </Button>
                <TextField label="Identificación" value={identification} InputProps={{ readOnly: true }} sx={{ width: "220px" }} />
                <TextField label="Nombre de la persona" value={personName} InputProps={{ readOnly: true }} sx={{ width: "300px" }} />
            </Box>
        )
    });

    return (
        <>
            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "80vh", // Ocupa el 80% de la altura de la ventana
                        width: "100%", // Ocupa todo el ancho
                    }}
                >
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <MaterialReactTable table={table} />
            )}
            <Dialog
                open={openAddDialog}
                // onClose={() => setOpenAddDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Agregar Requerimiento</DialogTitle>
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
                    <RequirementRegister identificationPerson={identification} person={personName} idPersona={selectedIdPersona ?? 0} loadAccess={loadAccess} ></RequirementRegister>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="register-requirement-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Ingresar Requerimiento
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
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Direccion</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '350px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedRequirement && (<UpdateRequirements requirementsData={selectedRequirement} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="update-requirement-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Requerimiento
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
};