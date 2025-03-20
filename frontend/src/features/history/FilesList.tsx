import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField,
    IconButton,
    Tooltip,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select
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
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import UpdateFiles from "./UpdatedFiles";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("small");
    const [fileFilter, setFileFilter] = useState("Por estados");

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
            toast.error("Error al cargar los datos");
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
                toast.error("No se encontraron expedientes con esa identificación.");
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

    const handleEdit = async (codigo: number) => {
        try {
            const response = await api.history.getFilesByCode(codigo);
            setSelectedFile(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los pagos:", error);
            toast.error("No se puede acceder a este expediente");
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
            toast.error("No hay expedientes disponibles para exportar.");
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

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    const columns = useMemo<MRT_ColumnDef<filesModel>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                size: 100,
                Cell: ({ row }) => (
                    <Tooltip title="Editar Expediente">
                        <IconButton color="primary" onClick={() => handleEdit(row.original.codigo)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                ),
            },
            { accessorKey: "expediente", header: "Expediente", size: 120 },
            { accessorKey: "identificacion", header: "Identificación", size: 150 },
            { accessorKey: "beneficiario", header: "Beneficiario", size: 200 },
            { accessorKey: "entidad", header: "Entidad", size: 150 },
            { accessorKey: "proposito_banhvi", header: "Proposito Banhvi", size: 120 },
            { accessorKey: "estado", header: "Estado", size: 120 },
            { accessorKey: "estado_emitido", header: "Estado Emitido", size: 120 },
            { accessorKey: "estado_entidad", header: "Estado Entidad", size: 120 },
            { accessorKey: "estado_banhvi", header: "Estado Banhvi", size: 120 },
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
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "#E3F2FD", borderRadius: "8px" }}>

                <Button
                    variant="contained"
                    color="success"
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
            {loading ? <CircularProgress sx={{ margin: "20px auto", display: "block" }} /> : <MaterialReactTable table={table} />}
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar expediente</DialogTitle>
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
                    {selectedFile && (<UpdateFiles FilesData={selectedFile} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="update-file-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar el expediente
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}