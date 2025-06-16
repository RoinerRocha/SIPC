import {
    Button,Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Tooltip, Box, FormControl,InputLabel,
    MenuItem, Select
} from "@mui/material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, FileDownload as FileDownloadIcon } from "@mui/icons-material";


import { filesModel } from "../../app/models/filesModel";
import { useMemo, useState, useEffect } from "react";
import api from "../../app/api/api";
import { useTranslation } from "react-i18next";
import UpdateFiles from "./UpdatedFiles";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';



interface FilesProps {
    files: filesModel[];
    setFiles: React.Dispatch<React.SetStateAction<filesModel[]>>;
}

export default function FilesList({ files, setFiles }: FilesProps) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<filesModel | null>(null);
    const [identification, setIdentification] = useState("");
    const [selectedIdPersona, setSelectedIdPersona] = useState<number | null>(null);
    const [personName, setPersonName] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const { fontSize } = useFontSize();
    const [fileFilter, setFileFilter] = useState("Por estados");


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
            const response = await api.history.getAllFiles();
            setFiles(response.data);
        } catch (error) {
            console.error("Error al cargar los expedientes:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar expedientes",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleSearch = async () => {
        if (!identification) {
            const defaultResponse = await api.history.getAllFiles();
            setFiles(defaultResponse.data);
            setPersonName("");
            return;
        }

        setLoading(true);
        try {
            const response = await api.history.getFilesByPerson(identification);
            if (response && Array.isArray(response.data)) {
                setFiles(response.data);
                const personResponse = await api.persons.getPersonByIdentification(identification);
                const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                setPersonName(fullName);
            } else {
                console.error("La respuesta de la API no es un array de pagos:", response);
                Swal.fire({
                    icon: "error",
                    title: "Error al buscar",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No se encontraron expedientes con esa identificacion",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                setPersonName("");
            }
        } catch (error) {
            console.error("Error al obtener expedientes:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al obtener expedientes",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            setPersonName("");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (codigo: string) => {
        try {
            const response = await api.history.getFilesByCode(codigo);
            setSelectedFile(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los pagos:", error);
            Swal.fire({
                icon: "error",
                title: "Error de obtencion",
                showConfirmButton: false,
                timer: 2000,
                text: "No se puede obtener ese expediente",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const formatDecimal = (value: number | string): string => {
        const numberValue = parseFloat(value as string);
        return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
    };

    const formatDate = (date: any) => {
        return date ? new Date(date).toLocaleDateString() : "N/A";
    };


    // const formatDecimal = (value: any): string => {
    //     const numberValue = parseFloat(value);
    //     return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
    // };

    const handleDownloadExcel = async (): Promise<void> => {
        if (!files || files.length === 0) {
            Swal.fire({
                icon: "error",
                title: "Error de exportacion",
                showConfirmButton: false,
                timer: 2000,
                text: "No hay expedientes disponibles para exportar",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            return;
        }

        const workbook = new ExcelJS.Workbook();

        if (fileFilter === "Completo") {
            // Crear una sola hoja de cálculo con todos los datos
            const worksheet = workbook.addWorksheet("Expedientes");

            const columns = [
                "Código", "ID de la persona", "Identificación", "Nombre completo", "Provincia", "Cantón", "Distrito",
                "Expediente", "Tipo de Expediente", "Estado", "Entidad", "Fecha de creación", "Monto bono"
            ];

            worksheet.columns = columns.map((header) => ({
                header,
                width: 20,
            }));

            worksheet.getRow(1).eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8A" } };
                cell.font = { color: { argb: "FFFFFF" }, bold: true, size: 12 };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
            });

            files.forEach((file: filesModel) => {
                worksheet.addRow([
                    file.codigo,
                    file.id_persona,
                    file.identificacion,
                    file.beneficiario,
                    file.provincia || "N/A",
                    file.canton || "N/A",
                    file.distrito || "N/A",
                    file.expediente,
                    file.tipo_expediente,
                    file.estado,
                    file.entidad,
                    formatDate(file.fecha_creacion),
                    formatDecimal(file.monto_bono)
                ]);
            });

        } else {
            // Dividir por estado
            const estadosUnicos = Array.from(new Set(files.map(file => file.estado)));

            estadosUnicos.forEach((estado) => {
                const worksheet = workbook.addWorksheet(estado);
                const columns = [
                    "Código", "ID de la persona", "Identificación", "Nombre completo", "Provincia", "Cantón", "Distrito",
                    "Expediente", "Tipo de Expediente", "Estado", "Entidad", "Fecha de creación", "Monto bono"
                ];

                worksheet.columns = columns.map((header) => ({
                    header,
                    width: 20,
                }));

                worksheet.getRow(1).eachCell((cell) => {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8A" } };
                    cell.font = { color: { argb: "FFFFFF" }, bold: true, size: 12 };
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                    cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
                });

                const dataFiltrada = files.filter(file => file.estado === estado);

                dataFiltrada.forEach((file: filesModel) => {
                    worksheet.addRow([
                        file.codigo,
                        file.id_persona,
                        file.identificacion,
                        file.beneficiario,
                        file.provincia || "N/A",
                        file.canton || "N/A",
                        file.distrito || "N/A",
                        file.expediente,
                        file.tipo_expediente,
                        file.estado,
                        file.entidad,
                        formatDate(file.fecha_creacion),
                        formatDecimal(file.monto_bono)
                    ]);
                });
            });
        }

        // Guardar y descargar el archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `Expedientes_${fileFilter}.xlsx`);
    };

    const columns = useMemo<MRT_ColumnDef<filesModel>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                size: 100,
                Cell: ({ row }) => (
                    <Tooltip title="Editar Expediente">
                        <IconButton color="primary" onClick={() => handleEdit(String(row.original.codigo))}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                ),
            },
            {
                accessorKey: "expediente",
                header: "Expediente",
                size: 120,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "identificacion",
                header: "Identificación",
                size: 150,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "beneficiario",
                header: "Beneficiario",
                size: 200,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: 'inline-block',
                                maxWidth: '180px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{value}</span>
                        </Tooltip>
                    );
                }
            },
            {
                accessorKey: "entidad",
                header: "Entidad",
                size: 150,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "proposito_banhvi",
                header: "Proposito Banhvi",
                size: 120,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "estado",
                header: "Estado",
                size: 120,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "estado_emitido",
                header: "Estado Emitido",
                size: 120,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "estado_entidad",
                header: "Estado Entidad",
                size: 120,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
                accessorKey: "estado_banhvi",
                header: "Estado Banhvi",
                size: 120,
                Cell: ({ cell }) => {
                    const rawValue = cell.getValue();
                    const value = rawValue ? String(rawValue) : "Sin Datos";
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
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: files,
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "white", borderRadius: "8px" }}>

                <Button
                    variant="contained"
                    sx={{ marginBottom: 2, height: "38px", textTransform: "none" }}
                    onClick={handleDownloadExcel} // Aquí pasamos el id_remision
                >
                    Descargar Excel
                </Button>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Formato de descarga</InputLabel>
                    <Select
                        label="Formato de descarga"
                        value={fileFilter}
                        onChange={(e) => setFileFilter(e.target.value)}
                        sx={{ marginBottom: 2, height: "38px", textTransform: "none" }}
                    >
                        <MenuItem value="Completo">Completo</MenuItem>
                        <MenuItem value="Por estados">Por estados</MenuItem>
                    </Select>
                </FormControl>
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
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "white" }}>Editar expediente</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedFile && (<UpdateFiles FilesData={selectedFile} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    <Button
                        type="submit"
                        form="update-file-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar el expediente
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}