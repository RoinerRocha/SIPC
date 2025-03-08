import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from "@mui/material";

import { filesModel } from "../../app/models/filesModel";
import { useState, useEffect } from "react";
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

    const handleAddObservation = () => {
        const foundObservation = files.find(obs => obs.identificacion === identification);
        if (foundObservation) {
            setSelectedIdPersona(foundObservation.id_persona);
        } else {
            setSelectedIdPersona(null);
            toast.warning("No se encontró un ID de persona para este expediente.");
            return;
        }
        setOpenAddDialog(true);
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

    // const formatDecimal = (value: any): string => {
    //     const numberValue = parseFloat(value);
    //     return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
    // };


    const handleDownloadExcel = async (files: filesModel[]): Promise<void> => {
        if (!files || files.length === 0) {
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
            "Fecha de llegada a la Oficina", "Fecha de Permiso del Ente",  "Fecha de Formalizacion", "Fecha de Pagado", "Fecha de Enviado a Construir", "Fecha de Pago de Avaluo",
            "Fecha de Pago de Formalizacion", "Fecha de Pago TS",
            "Etiqueta", "Remitente",
            "Asignado(a)", "Monto bono", 
            "Monto compra venta", "Monto presupuesto", "Monto solución", "Monto comisión",
            "Monto costo terreno", "Monto honorarios abogado", "Monto patrimonio familiar", "Monto póliza", "Monto fiscalización",
            "Monto kilometraje", "Monto afiliación", "Monto trabajo social", "Monto construcción",
            "Monto de Estudio Social", "Monto de Aporte Familiar", "Monto de Gastos de Formalización",
            "Monto de Aporte de Gastos", "Monto de Diferencia de Aporte", "Monto de Prima de Seguros"
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
        files.forEach((file: filesModel) => {
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
                new Date(file.fecha_creacion).toLocaleDateString(),
                new Date(file.fecha_emitido).toLocaleDateString(),
                new Date(file.fecha_enviado_entidad).toLocaleDateString(),
                new Date(file.fecha_envio_acta).toLocaleDateString(),
                new Date(file.fecha_aprobado).toLocaleDateString(),
                new Date(file.fecha_sello_cfia).toLocaleDateString(),
                new Date(file.fecha_entrega).toLocaleDateString(),
                new Date(file.fecha_devuelto).toLocaleDateString(),
                new Date(file.fecha_entrega_recuperado).toLocaleDateString(),
                new Date(file.fecha_reingreso).toLocaleDateString(),
                new Date(file.fecha_299).toLocaleDateString(),
                new Date(file.fecha_enviado_banhvi).toLocaleDateString(),
                new Date(file.fecha_carta_agua_recibida).toLocaleDateString(),
                new Date(file.fecha_entrega_declaratoria).toLocaleDateString(),
                new Date(file.fecha_ingreso_cfia).toLocaleDateString(),
                new Date(file.fecha_salida_cfia).toLocaleDateString(),
                new Date(file.fecha_entregado_para_enviar).toLocaleDateString(),
                new Date(file.fecha_envio_docs_beneficiario).toLocaleDateString(),
                new Date(file.fecha_llegada_oficina).toLocaleDateString(),
                new Date(file.fecha_permiso_ente).toLocaleDateString(),
                new Date(file.fecha_formalizacion).toLocaleDateString(),
                new Date(file.fecha_pagado).toLocaleDateString(),
                new Date(file.fecha_enviado_construir).toLocaleDateString(),
                new Date(file.fecha_pago_avaluo).toLocaleDateString(),
                new Date(file.fecha_pago_formalizacion).toLocaleDateString(),
                new Date(file.fecha_pago_ts).toLocaleDateString(),
                file.etiqueta,
                file.remitente,
                file.asignadoa,
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
            ]);
        });

        // Exportar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "Expedientes_Con_Formato.xlsx");
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return (
        <Grid container spacing={1}>
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
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                    disabled={loading}
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
            <Grid item xs={12} sm={6} md={3}>
                <Button
                    variant="contained"
                    color="success"
                    sx={{ marginBottom: 2, height: "45px", textTransform: "none" }}
                    onClick={() => handleDownloadExcel(files)} // Aquí pasamos el id_remision
                >
                    Descargar Excel
                </Button>
            </Grid>
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Código
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    ID de la persona
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Identificación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Fecha de creación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Fecha de emisión
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Fecha envío entidad
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Ubicación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Etiqueta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Entidad
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Observaciones
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Remitente
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Asignado(a)
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Tipo de expediente
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Número de bono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Propósito bono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '100px', border: '1px solid black' }}>
                                    Monto bono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '110px', border: '1px solid black' }}>
                                    Contrato CFIA
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '110px', border: '1px solid black' }}>
                                    Acta traslado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '130px', border: '1px solid black' }}>
                                    Fecha envío acta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Estado emitido
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Fecha aprobado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '100px', border: '1px solid black' }}>
                                    Folio real
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '110px', border: '1px solid black' }}>
                                    Número plano
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Área construcción
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '160px', border: '1px solid black' }}>
                                    Ingeniero responsable
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Fiscal
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Monto compra venta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Monto presupuesto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Monto solución
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Monto comisión
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Monto costo terreno
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '190px', border: '1px solid black' }}>
                                    Monto honorarios abogado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '180px', border: '1px solid black' }}>
                                    Monto patrimonio familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Monto póliza
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Monto fiscalización
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '130px', border: '1px solid black' }}>
                                    Monto kilometraje
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '120px', border: '1px solid black' }}>
                                    Monto afiliación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Monto trabajo social
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Monto construcción
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '160px', border: '1px solid black' }}>
                                    Constructora asignada
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Boleta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '150px', border: '1px solid black' }}>
                                    Acuerdo aprobación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '170px', border: '1px solid black' }}>
                                    Monto de Estudio Social
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '180px', border: '1px solid black' }}>
                                    Monto de Aporte Familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '140px', border: '1px solid black' }}>
                                    Patrimonio Familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '230px', border: '1px solid black' }}>
                                    Monto de Gastos de Formalizacion
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '190px', border: '1px solid black' }}>
                                    Monto de Aporte de Gastos
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '210px', border: '1px solid black' }}>
                                    Monto de Diferencia de Aporte
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", padding: '12px', minWidth: '190px', border: '1px solid black' }}>
                                    Monto de Prima de Seguros
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.75rem", border: '1px solid black' }}>
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedFiles.map((files) => (
                                <TableRow key={files.codigo}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.codigo}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.id_persona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.identificacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(files.fecha_creacion).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(files.fecha_emitido).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(files.fecha_enviado_entidad).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.ubicacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.etiqueta}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.entidad}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.observaciones}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.remitente}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.asignadoa}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.tipo_expediente}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.numero_bono}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.proposito_bono}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_bono)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.contrato_CFIA}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.acta_traslado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(files.fecha_envio_acta).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.estado_emitido}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{new Date(files.fecha_aprobado).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.folio_real}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.numero_plano}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.area_construccion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.ingeniero_responsable}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.fiscal}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_compra_venta)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_presupuesto)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_solucion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_comision)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_costo_terreno)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_honorarios_abogado)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_patrimonio_familiar)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_poliza)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_fiscalizacion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_kilometraje)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_afiliacion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_trabajo_social)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_construccion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.constructora_asignada}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.boleta}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.acuerdo_aprobacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_estudio_social)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_aporte_familia)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{files.patrimonio_familiar}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_gastos_formalizacion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_aporte_gastos)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_diferencia_aporte)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem", border: '1px solid black' }}>{formatDecimal(files.monto_prima_seguros)}</TableCell>
                                    <TableCell align="center" sx={{ border: '1px solid black' }}>
                                        <Button
                                            variant="contained"
                                            color="info"
                                            sx={{ fontSize: "0.65rem", minWidth: "40px", minHeight: "20px", textTransform: "none" }}
                                            onClick={() => handleEdit(files.codigo)}
                                        >
                                            Editar Expediente
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
                count={files.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 5))}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
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
        </Grid>
    )
}