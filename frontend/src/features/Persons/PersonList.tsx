import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Box, IconButton, Tooltip
} from "@mui/material";
import { personModel } from "../../app/models/persons";
import { useMemo, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../app/api/api";
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
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


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
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };


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
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al obtener a las personas",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleDelete = async (id_persona: number) => {
        const result = await Swal.fire({
            title: '¿Desea deshabilitar a esta persona?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, deshabilitar',
            denyButtonText: 'No deshabilitar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            reverseButtons: true,
            customClass: {
                popup: 'swal-z-index',
                confirmButton: 'swal-confirm-btn',
                denyButton: 'swal-deny-btn'
            }
        });

        if (result.isConfirmed) {
            try {
                await api.persons.deletePersons(id_persona);
                await Swal.fire({
                    icon: "success",
                    title: "Persona deshabilitada",
                    text: "Se ha deshabilitado a la persona correctamente",
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                loadAccess();
            } catch (error) {
                console.error("Error al eliminar la persona:", error);
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al deshabilitar a la persona",
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Acción cancelada',
                text: 'La persona no fue deshabilitada.',
                showConfirmButton: false,
                timer: 2000,
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
        // Si presiona "Cancelar", no se hace nada.
    };

    const handleEdit = async (id_persona: number) => {
        try {
            const response = await api.persons.getPersonById(id_persona);
            setSelectedPerson(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de la persona:", error);
            Swal.fire({
                icon: "error",
                title: "Persona Deshabilitada",
                showConfirmButton: false,
                timer: 2000,
                text: "Esta persona se encuentra deshabilitada",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al obtener a los datos",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
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
                    Swal.fire({
                        icon: "warning",
                        title: "Error al buscar",
                        showConfirmButton: false,
                        timer: 2000,
                        text: "No se encontraron personas con esa identificacion",
                        customClass: {
                            popup: 'swal-z-index'
                        }
                    });
                }
            } else {
                setPersons([]);
                setPersonName("");
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No se encontraron datos de personas",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        } catch (error) {
            console.error("Error al obtener personas:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al obtener a las personas",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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
                Swal.fire({
                    icon: "warning",
                    title: "No encontrado",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al descargar el pdf",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
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

            // Calcular totales
            const totalIngresosFamiliares = familyDetails.reduce((sum, fam) => sum + (Number(fam.ingresos) || 0), 0);
            const totalSalarioNeto = incomesDetails.reduce((sum, inc) => sum + (Number(inc.salario_neto) || 0), 0);
            const totalIngresos = totalIngresosFamiliares + totalSalarioNeto;

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
                nextTableY += 5;
                doc.setFontSize(14);
                doc.text(titulo, 14, nextTableY - 5);
                nextTableY += 5;

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
            doc.setFontSize(14);
            doc.text("Total Ingresos del Grupo Familiar", 14, nextTableY);
            nextTableY += 8;
            autoTable(doc, {
                startY: nextTableY,
                head: [["Total ₡"]],
                body: [[`₡${totalIngresosFamiliares.toLocaleString("es-CR")}`]],
            });
            nextTableY = (doc as any).lastAutoTable.finalY + 10;

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

            doc.setFontSize(14);
            doc.text("Total Salario Neto", 14, nextTableY);
            nextTableY += 8;
            autoTable(doc, {
                startY: nextTableY,
                head: [["Total ₡"]],
                body: [[`₡${totalSalarioNeto.toLocaleString("es-CR")}`]],
            });
            nextTableY = (doc as any).lastAutoTable.finalY + 10;

            // Sección: Total Ingresos Combinados
            doc.setFontSize(14);
            doc.text("Total Ingresos (Grupo Familiar + Salario Neto)", 14, nextTableY);
            nextTableY += 8;
            autoTable(doc, {
                startY: nextTableY,
                head: [["Total ₡"]],
                body: [[`₡${totalIngresos.toLocaleString("es-CR")}`]],
            });
            nextTableY = (doc as any).lastAutoTable.finalY + 10;

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
            Swal.fire({
                icon: "success",
                title: "Descarga realizada",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ah procedido a descargar el pdf",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        } catch (error) {
            console.error("Error al obtener detalles de la persona:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                text: "No se puede descargar PDF de una persona deshabilitada",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleDownloadPDFHistory = async () => {
        if (!identification.trim()) {
            Swal.fire({
                icon: "error",
                title: "Error al descargar historial",
                showConfirmButton: false,
                timer: 2000,
                text: "Se debe ingresar una identificacion para descargar el historial",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            return;
        }

        try {
            const response = await api.persons.getPersonByIdentification(identification);

            if (!response || !response.data) {
                Swal.fire({
                    icon: "error",
                    title: "Error de busqueda",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No se pudo encontrar a la persona con esta identificacion",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                return;
            }

            const personData = Array.isArray(response.data) ? response.data[0] : response.data;

            if (!personData || !personData.id_persona) {
                Swal.fire({
                    icon: "error",
                    title: "Error en el id",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al obtener a la persona con ese id",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                return;
            }

            const personId = personData.id_persona;
            const personName = `${personData.nombre} ${personData.primer_apellido} ${personData.segundo_apellido}`.trim();

            const historyResponse = await api.persons.getPersonHistoryChanges(personId);
            const historyData = historyResponse.data;

            if (!historyData || historyData.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Sin cambios",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No existe un historial de cambios para esta persona",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
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
            Swal.fire({
                icon: "error",
                title: "Error en el historial",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al obtener el historial de cambios",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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
                        <IconButton color="error" onClick={() => handleDownloadPDF(row.original.id_persona)}>
                            <PdfIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
        { accessorKey: "id_persona", header: "ID Persona", size: 100 },
        {
            accessorKey: "tipo_identificacion",
            header: "Tipo Identificacion",
            size: 180,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '160px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "numero_identifiacion",
            header: "Identificación",
            size: 180,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '160px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "nombre_completo",
            header: "Nombre completo",
            size: 200,
            Cell: ({ row }) => {
                const { nombre, primer_apellido, segundo_apellido } = row.original;
                const fullName = `${nombre || ""} ${primer_apellido || ""} ${segundo_apellido || ""}`.trim();
                return (
                    <Tooltip title={fullName} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {fullName}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "fecha_nacimiento", header: "Fecha Nacimiento", size: 150, Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString()
        },
        {
            accessorKey: "genero",
            header: "Género",
            size: 120,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "estado_civil",
            header: "Estado Civil",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "nacionalidad",
            header: "Nacionalidad",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "fecha_registro", header: "Fecha Registro", size: 150, Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString()
        },
        {
            accessorKey: "usuario_registro",
            header: "Usuario",
            size: 120,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "nivel_estudios",
            header: "Nivel Estudios",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "discapacidad",
            header: "Discapacidad",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "asesor",
            header: "Asesor",
            size: 150,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '130px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "estado",
            header: "Estado",
            size: 120,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: persons,
        initialState: {
            columnVisibility: {
                id_persona: false,
                estado: false,
            },
        },
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
                backgroundColor: "white", // Azul claro en la barra de herramientas
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: "white", // Azul claro en la barra inferior (paginación)
            },
        },
        muiTablePaperProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en toda la tabla
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "white", // Azul claro en el fondo del contenedor de la tabla
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976D2", // Azul primario para encabezados
                color: "white",
                fontWeight: "bold",
                fontSize: fontSizeMap[fontSize],
                border: "2px solid #1565C0",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: "white", // Blanco para las celdas
                borderBottom: "1px solid #BDBDBD",
                fontSize: fontSizeMap[fontSize],
                border: "1px solid #BDBDBD", // Gris medio para bordes
            },
        },
        muiFilterTextFieldProps: {
            sx: {
                '& input::placeholder': {
                    color: 'white',
                    opacity: 1, // <-- importante para que se vea bien el color
                },
                '& .MuiInputBase-input': {
                    color: 'white',
                },
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                width: "50%",
                paddingY: 1,
                paddingX: 2,
                backgroundColor: "white", // Azul claro
                borderRadius: "8px",
            }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddDialog(true)}
                    fullWidth
                    sx={{ marginBottom: 2, height: "38px", width: "200px", textTransform: "none" }}
                >
                    Agregar Persona
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadPDFHistory}
                    fullWidth
                    sx={{ marginBottom: 2, height: "38px", width: "200px", textTransform: "none" }}
                >
                    Descargar Historial
                </Button>
            </Box>
        )
    });

    return (
        <>
            <Box
                sx={{
                    maxWidth: '95%',        // Limita el ancho al 96% del contenedor padre
                    margin: '0 auto',       // Centra horizontalmente
                    padding: 2,             // Espaciado interno
                    backgroundColor: '#f9f9f9', // Opcional: color de fondo para mejor separación visual
                    borderRadius: 2,        // Bordes redondeados
                    boxShadow: 2,           // Sombra ligera
                }}
            >
                <MaterialReactTable table={table} />
            </Box>
            <Dialog
                open={openAddDialog}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "white" }}>Agregar Persona</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '600px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    <TableAddData loadAccess={loadAccess} setSelectedTab={setSelectedTab} ></TableAddData>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
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
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "white" }}>Editar Persona</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '550px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedPerson && (<TableUpdateData person={selectedPerson} loadAccess={loadAccess} setSelectedTab={setSelectedTab} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    {selectedTab === 0 && ( // Personas
                        <Button sx={{ textTransform: "none" }} type="submit" form="update-person-form" variant="contained" color="primary">
                            Actualizar Persona
                        </Button>
                    )}
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
