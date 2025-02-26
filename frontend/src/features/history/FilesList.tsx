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
            "Estado", "Fecha de creación", "Fecha de emisión", "Fecha envío entidad", "Ubicación", "Etiqueta", "Entidad", "Observaciones",
            "Remitente", "Asignado(a)", "Tipo de expediente", "Número de bono", "Propósito bono", "Monto bono", "Contrato CFIA",
            "Acta traslado", "Fecha envío acta", "Estado emitido", "Fecha aprobado", "Folio real", "Número plano", "Área construcción",
            "Ingeniero responsable", "Fiscal", "Monto compra venta", "Monto presupuesto", "Monto solución", "Monto comisión",
            "Monto costo terreno", "Monto honorarios abogado", "Monto patrimonio familiar", "Monto póliza", "Monto fiscalización",
            "Monto kilometraje", "Monto afiliación", "Monto trabajo social", "Monto construcción", "Constructora asignada", "Boleta",
            "Acuerdo aprobación", "Monto de Estudio Social", "Monto de Aporte Familiar", "Patrimonio Familiar", "Monto de Gastos de Formalización",
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
                file.estado,
                new Date(file.fecha_creacion).toLocaleDateString(),
                new Date(file.fecha_emitido).toLocaleDateString(),
                new Date(file.fecha_enviado_entidad).toLocaleDateString(),
                file.ubicacion,
                file.etiqueta,
                file.entidad,
                file.observaciones,
                file.remitente,
                file.asignadoa,
                file.tipo_expediente,
                file.numero_bono,
                file.proposito_bono,
                formatDecimal(file.monto_bono),
                file.contrato_CFIA,
                file.acta_traslado,
                new Date(file.fecha_envio_acta).toLocaleDateString(),
                file.estado_emitido,
                new Date(file.fecha_aprobado).toLocaleDateString(),
                file.folio_real,
                file.numero_plano,
                formatDecimal(file.area_construccion),
                file.ingeniero_responsable,
                file.fiscal,
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
                file.constructora_asignada,
                file.boleta,
                file.acuerdo_aprobacion,
                formatDecimal(file.monto_estudio_social),
                formatDecimal(file.monto_aporte_familia),
                file.patrimonio_familiar,
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
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px" }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    fullWidth
                    sx={{ marginBottom: 2, height: "56px" }}
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
                    sx={{ marginBottom: 2, backgroundColor: "#F5F5DC", borderRadius: "5px" }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Button
                    variant="contained"
                    color="success"
                    sx={{ marginBottom: 2, height: "56px" }}
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
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Código
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    ID de la persona
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Identificación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha de creación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha de emisión
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha envío entidad
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Ubicación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Etiqueta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Entidad
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Observaciones
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Remitente
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Asignado(a)
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Tipo de expediente
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Número de bono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Propósito bono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto bono
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Contrato CFIA
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Acta traslado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha envío acta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Estado emitido
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fecha aprobado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Folio real
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Número plano
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Área construcción
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Ingeniero responsable
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Fiscal
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto compra venta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto presupuesto
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto solución
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto comisión
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto costo terreno
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto honorarios abogado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto patrimonio familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto póliza
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto fiscalización
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto kilometraje
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto afiliación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto trabajo social
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto construcción
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Constructora asignada
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Boleta
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Acuerdo aprobación
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto de Estudio Social
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto de Aporte Familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Patrimonio Familiar
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto de Gastos de Formalizacion
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto de Aporte de Gastos
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto de Diferencia de Aporte
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Monto de Prima de Seguros
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}>
                                    Realizar Cambios
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedFiles.map((files) => (
                                <TableRow key={files.codigo}>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.codigo}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.id_persona}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.identificacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.estado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(files.fecha_creacion).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(files.fecha_emitido).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(files.fecha_enviado_entidad).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.ubicacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.etiqueta}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.entidad}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.observaciones}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.remitente}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.asignadoa}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.tipo_expediente}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.numero_bono}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.proposito_bono}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_bono)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.contrato_CFIA}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.acta_traslado}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(files.fecha_envio_acta).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.estado_emitido}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{new Date(files.fecha_aprobado).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.folio_real}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.numero_plano}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.area_construccion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.ingeniero_responsable}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.fiscal}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_compra_venta)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_presupuesto)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_solucion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_comision)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_costo_terreno)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_honorarios_abogado)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_patrimonio_familiar)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_poliza)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_fiscalizacion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_kilometraje)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_afiliacion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_trabajo_social)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_construccion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.constructora_asignada}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.boleta}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.acuerdo_aprobacion}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_estudio_social)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_aporte_familia)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{files.patrimonio_familiar}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_gastos_formalizacion)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_aporte_gastos)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_diferencia_aporte)}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{formatDecimal(files.monto_prima_seguros)}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="info"
                                            sx={{ fontSize: "0.65rem", minWidth: "40px", minHeight: "20px" }}
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
            />
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Editar Expediente</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedFile && (<UpdateFiles FilesData={selectedFile} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}