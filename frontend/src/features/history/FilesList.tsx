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
import { Edit as EditIcon, FileDownload as FileDownloadIcon  } from "@mui/icons-material";


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

    const handleDownloadExcel = async (files: filesModel[]): Promise<void> => {
        let dataToExport = files;
        if (identification.trim()) {
            dataToExport = files.filter(file => file.identificacion === identification);
        }

        if (!dataToExport || dataToExport.length === 0) {
            toast.error("No hay expedientes disponibles para exportar.");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Expedientes");

        // Definir las cabeceras
        const columns = [
            "Código", "ID de la persona", "Identificación", "Nombre completo", "Provincia", "Cantón", "Distrito", "Barrio", "Otras señas",
            "Expediente", "Tipo de Expediente", "Estado", "Proposito de Bono", "Nuevo Bono", "Numero de Bono", "Contrato CFIA", "Acta traslado",
            "Folio real", "Codigo APC", "Acuerdo de Aprobación", "Exoneracion de ley 9635", "Patrimonio Familiar", "Inscrito en Hacienda", "Boleta",
            "Responsable", "Profesional", "Contacto", "Área de construcción", "Número plano", "Ubicación", "Constructora", "Entidad", "Ingeniero responsable",
            "Fiscal", "Analista de Constructora", "Analista del Ente", "Contrato de la Empresa", "Programa de la Empresa", "Situacion de la Empresa",
            "Proposito Banhvi", "Observaciones del Expediente", "Obserevaciones del Ente", "Estado emitido", "Estado de Entidad", "Estado Banhvi",
            "Fecha de creación", "Fecha de emisión", "Fecha envío entidad", "Fecha envío acta", "Fecha aprobado", "Fecha de Sello CFIA", "Fecha de Entrega",
            "Fecha de Devuelto", "Fecha de Entrega de Recuperado", "Fecha de Entrega de Reingreso", "Fecha 299", "Fecha de Envio a Banhvi", "Fecha de Recibido la Carta de Agua",
            "Fecha de Entrega de Declaratoria", "Fecha de Ingreso CFIA", "Fecha de Salida CFIA", "Fecha de Entregado para Enviar", "Fecha de Envio de Documentos del Beneficiario",
            "Fecha de llegada a la Oficina", "Fecha de Permiso del Ente", "Fecha de Formalizacion", "Fecha de Pagado", "Fecha de Enviado a Construir", "Fecha de Pago de Avaluo",
            "Fecha de Pago de Formalizacion", "Fecha de Pago TS", "Monto bono", "Monto compra venta", "Monto presupuesto", "Monto solución", "Monto comisión",
            "Monto costo terreno", "Monto honorarios abogado", "Monto patrimonio familiar", "Monto póliza", "Monto fiscalización",
            "Monto kilometraje", "Monto afiliación", "Monto trabajo social", "Monto construcción", "Monto de Estudio Social", "Monto de Aporte Familiar", "Monto de Gastos de Formalización",
            "Monto de Aporte de Gastos", "Monto de Diferencia de Aporte", "Monto de Prima de Seguros", "Monto de Pago de Avalauo", "Monto del Pago de Aporte",
            "Monto del Pago de Formalizacion ", "Monto del Pago de Trabajo Social", "Comprobante del Trabajo Social", "Comprobante del Pago de Avaluo",
            "Comprobante del Pago de Formalizacion", "Comprobante del Aporte", "Dias Emitidos", "Dias desde la Entrega", "Etiqueta", "Remitente", "Asignado(a)"
        ];

        worksheet.columns = columns.map((header) => ({
            header,
            width: 20,
        }));

        // Aplicar estilos al encabezado
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "1E3A8A" }, // Azul oscuro
            };
            cell.font = {
                color: { argb: "FFFFFF" }, // Blanco
                bold: true,
                size: 12,
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Agregar datos a la hoja
        dataToExport.forEach((file: filesModel) => {
            worksheet.addRow([
                file.codigo,
                file.id_persona,
                file.identificacion,
                file.beneficiario,
                file.provincia || "N/A",
                file.canton || "N/A",
                file.distrito || "N/A",
                file.barrio || "N/A",
                file.otras_senas || "N/A",
                file.expediente,
                file.tipo_expediente,
                file.estado,
                file.proposito_bono,
                file.nuevo_bono,
                file.numero_bono,
                file.contrato_CFIA,
                file.acta_traslado,
                file.folio_real,
                file.codigo_apc,
                file.acuerdo_aprobacion,
                file.exoneracion_ley_9635,
                file.patrimonio_familiar,
                file.inscrito_hacienda,
                file.boleta,
                file.responsable,
                file.profesional,
                file.contacto,
                formatDecimal(file.area_construccion),
                file.numero_plano,
                file.ubicacion,
                file.constructora_asignada,
                file.entidad,
                file.ingeniero_responsable,
                file.fiscal,
                file.analista_constructora,
                file.analista_ente,
                file.contrato_empresa,
                file.programa_empresa,
                file.situacion_empresa,
                file.proposito_banhvi,
                file.observaciones,
                file.observaciones_ente,
                file.estado_emitido,
                file.estado_entidad,
                file.estado_banhvi,
                formatDate(file.fecha_creacion),
                formatDate(file.fecha_emitido),
                formatDate(file.fecha_enviado_entidad),
                formatDate(file.fecha_envio_acta),
                formatDate(file.fecha_aprobado),
                formatDate(file.fecha_sello_cfia),
                formatDate(file.fecha_entrega),
                formatDate(file.fecha_devuelto),
                formatDate(file.fecha_entrega_recuperado),
                formatDate(file.fecha_reingreso),
                formatDate(file.fecha_299),
                formatDate(file.fecha_enviado_banhvi),
                formatDate(file.fecha_carta_agua_recibida),
                formatDate(file.fecha_entrega_declaratoria),
                formatDate(file.fecha_ingreso_cfia),
                formatDate(file.fecha_salida_cfia),
                formatDate(file.fecha_entregado_para_enviar),
                formatDate(file.fecha_envio_docs_beneficiario),
                formatDate(file.fecha_llegada_oficina),
                formatDate(file.fecha_permiso_ente),
                formatDate(file.fecha_formalizacion),
                formatDate(file.fecha_pagado),
                formatDate(file.fecha_enviado_construir),
                formatDate(file.fecha_pago_avaluo),
                formatDate(file.fecha_pago_formalizacion),
                formatDate(file.fecha_pago_ts),
                formatDecimal(file.monto_bono),
                formatDecimal(file.monto_compra_venta),
                formatDecimal(file.monto_presupuesto),
                formatDecimal(file.monto_solucion),
                formatDecimal(file.monto_comision),
                formatDecimal(file.monto_costo_terreno),
                formatDecimal(file.monto_honorarios_abogado),
                formatDecimal(file.monto_patrimonio_familiar),
                formatDecimal(file.monto_poliza),
                formatDecimal(file.monto_fiscalizacion),
                formatDecimal(file.monto_kilometraje),
                formatDecimal(file.monto_afiliacion),
                formatDecimal(file.monto_trabajo_social),
                formatDecimal(file.monto_construccion),
                formatDecimal(file.monto_estudio_social),
                formatDecimal(file.monto_aporte_familia),
                formatDecimal(file.monto_gastos_formalizacion),
                formatDecimal(file.monto_aporte_gastos),
                formatDecimal(file.monto_diferencia_aporte),
                formatDecimal(file.monto_prima_seguros),
                formatDecimal(file.monto_pago_avaluo),
                formatDecimal(file.monto_aporte),
                formatDecimal(file.monto_pago_formalizacion),
                formatDecimal(file.monto_pago_trabajo_social),
                file.comprobante_trabrajo_social,
                file.comprobante_pago_avaluo,
                file.comprobante_pago_formalizacion,
                file.comprobante_aporte,
                file.dias_emitido,
                file.dias_desde_entrega,
                file.etiqueta,
                file.remitente,
                file.asignadoa,
            ]);
        });

        // Exportar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "Expedientes_Con_Formato.xlsx");
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
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            { accessorKey: "expediente", header: "Expediente", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "identificacion", header: "Identificación", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "beneficiario", header: "Nombre Completo", size: 200, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "entidad", header: "Entidad", size: 150, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "proposito_banhvi", header: "Proposito Banhvi", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "estado", header: "Estado", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "estado_emitido", header: "Estado Emitido", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "estado_entidad", header: "Estado Entidad", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
            { accessorKey: "estado_banhvi", header: "Estado Banhvi", size: 120, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" }, },
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
                    color="success"
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                    onClick={() => handleDownloadExcel(files)} // Aquí pasamos el id_remision
                >
                    Descargar Excel
                </Button>
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
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Expediente</DialogTitle>
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