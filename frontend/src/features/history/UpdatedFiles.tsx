import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { filesModel } from "../../app/models/filesModel";
import HistoryFiles from "./FilesHistory";
import { historyFilesModel } from "../../app/models/historyFilesModel";
import { normalizerModel } from "../../app/models/normalizerModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";


interface UpdateFilesProps {
    FilesData: filesModel;
    loadAccess: () => void;
}

export default function UpdateFiles({ FilesData, loadAccess }: UpdateFilesProps) {
    const [currentFile, setCurrentFile] = useState<Partial<filesModel>>(FilesData);
    const [normalize, setNormalize] = useState<normalizerModel[]>([]);
    const [selectedFile, setSelectedFile] = useState<historyFilesModel[] | null>(null);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const { user } = useAppSelector(state => state.account);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (FilesData) {
            setCurrentFile(FilesData);
            console.log(FilesData.codigo);
        }
    }, [FilesData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [normalizeData ] = await Promise.all([
                    api.normalizers.getUniqueCompanies(),
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (normalizeData && Array.isArray(normalizeData.data)) {
                    setNormalize(normalizeData.data);
                } else {
                    console.error("Normalize data is not an array", normalizeData);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("error al cargar datos");
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: FieldValues) => {
        if (currentFile && user?.nombre_usuario) {
            try {
                await api.history.updateFiles(currentFile.codigo, user?.nombre_usuario, data);
                toast.success('Expediente actualizado con éxito.');
                loadAccess();
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar el expediente.');
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentFile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentFile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEdit = async (codigo: number) => {
        try {
            const response = await api.history.getHistoryFiles(codigo);
            setSelectedFile(response.data);
            setOpenHistoryDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los pagos:", error);
            toast.error("No se puede acceder a este expediente");
        }
    };

    const formatDecimal = (value: any): string => {
        const numberValue = parseFloat(value);
        return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
    };

    return (
        <Card>
            <Button
                variant="contained"
                color="info"
                sx={{ margin: "20px" }}
                onClick={() => handleEdit(FilesData.codigo)}
            >
                Ver Historial de cambios del expediente
            </Button>
            <Box p={2} sx={{
                maxHeight: '65vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Tipo de expediente</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('tipo_expediente', { required: 'Se necesita el tipo de expediente' })}
                                    name="tipo_expediente"
                                    value={currentFile.tipo_expediente?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="DISCAPACIDAD">Discapacidad</MenuItem>
                                    <MenuItem value="ARTICULO 59">Articulo 59</MenuItem>
                                    <MenuItem value="EXTREMA NECESIDAD">Extrema Necesidad</MenuItem>
                                    <MenuItem value="REGULAR">Regular</MenuItem>
                                    <MenuItem value="REGULAR/RAMT">Regular/Ramt</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Proposito Bono</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('proposito_bono', { required: 'Se necesita el tipo de expediente' })}
                                    name="proposito_bono"
                                    value={currentFile.proposito_bono?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="COMPRA DE LOTE Y CONSTRUCCION">Compra de lote y construcción</MenuItem>
                                    <MenuItem value="CONSTRUCCION EN LOTE PROPIO">Construcción en lote propio</MenuItem>
                                    <MenuItem value="COMPRA DE VIVIENDA EXISTENTE">Compra de vivienda existente</MenuItem>
                                    <MenuItem value="COMPRA DE LOTE">Compra de lote</MenuItem>
                                    <MenuItem value="REMODELACIONES-AMPLIACIONES-MEJORAS">Remodelaciones-Ampliaciones-Mejoras</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Estado del Expediente</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('estado', { required: 'Se necesita el tipo de expediente' })}
                                    name="estado"
                                    value={currentFile.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="CASO_EN_AVALUO">Caso en Avaluo</MenuItem>
                                    <MenuItem value="CASO_EN_TRABAJO_SOCIAL">Caso en Trabajo Social</MenuItem>
                                    <MenuItem value="CASO_EN_TRAMITE_CON_LA_CONSTRUCTORA">Caso en Tramite con la Constructora</MenuItem>
                                    <MenuItem value="CASO_DE_ENVIADO_A_LA_ENTIDAD">Caso de Enviado a la Entidad</MenuItem>
                                    <MenuItem value="CASO_EN_ANALISIS_EN_ENTIDAD">Caso en Analisis en Entidad</MenuItem>
                                    <MenuItem value="CASO_CON_OBSERVACIONES_ENTIDAD">Caso con Observaciones Entidad</MenuItem>
                                    <MenuItem value="EXPEDIENTE_DIGITAL_COMPLETADO">Expediente Digital Completado</MenuItem>
                                    <MenuItem value="TRASLADO_DE_ENTIDAD">Traslado de Entidad</MenuItem>
                                    <MenuItem value="EXPEDIENTE_DIGITAL_REGISTRADO">Expediente Digital Registrado</MenuItem>
                                    <MenuItem value="EXPEDIENTE_APROBADO">Expediente Aprobado</MenuItem>
                                    <MenuItem value="EXPEDIENTE_CON_ANOMALIAS">Expediente Con Anomalias</MenuItem>
                                    <MenuItem value="INCONSISTENTE">Inconsistente</MenuItem>
                                    <MenuItem value="RECHAZADO">Rechazado</MenuItem>
                                    <MenuItem value="PRESENTADO_PARA_RE-POSTULACION">Presentado para Re-postulacion</MenuItem>
                                    <MenuItem value="APROBADO_EN_REVISION_BANHVI">Aprobado en Revision BANHVI</MenuItem>
                                    <MenuItem value="EMITIDO">Emitido</MenuItem>
                                    <MenuItem value="FORMALIZADO">Formalizado</MenuItem>
                                    <MenuItem value="FORMALIZACION_REVERSADA">Formalizacion Reversada</MenuItem>
                                    <MenuItem value="COBRADO">Cobrado</MenuItem>
                                    <MenuItem value="PAGADO">Pagado</MenuItem>
                                    <MenuItem value="DESENVOLSOS">Desenvolsos</MenuItem>
                                    <MenuItem value="CASO_LIQUIDADO">Caso Liquidado</MenuItem>
                                    <MenuItem value="ANULADO">Anulado</MenuItem>
                                    <MenuItem value="PAGADO_SALDO_DEVUELTO_PARCIALMENTE">Pagado Saldo Devuelto Parcialmente</MenuItem>
                                    <MenuItem value="REGISTRADO_BATCH">Registrado BATCH</MenuItem>
                                    <MenuItem value="RE-CALCULADO">Re-Calculado</MenuItem>
                                    <MenuItem value="REEMBOLSO_A_LA_ENTIDAD">Reembolso a la Entidad</MenuItem>
                                    <MenuItem value="REGISTRADO">Registrado</MenuItem>
                                    <MenuItem value="REINTEGRO_ANULADO">Reintegro Anulado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('numero_bono', { required: 'Se necesita el número de bono' })}
                                name="numero_bono"
                                label="Número de bono"
                                value={currentFile.numero_bono?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_bono', { required: 'Se necesita el monto del bono' })}
                                name="monto_bono"
                                label="Monto del bono"
                                value={formatDecimal(currentFile.monto_bono)}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('fecha_creacion', { required: 'Se necesita la fecha de creacion' })}
                                type="date"
                                name="fecha_creacion"
                                label="Fecha de Creacion"
                                value={currentFile.fecha_creacion?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('fecha_emitido', { required: 'Se necesita la fecha de emision' })}
                                type="date"
                                name="fecha_emitido"
                                label="Fecha de Emitido"
                                value={currentFile.fecha_emitido?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Estado Emitido</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('estado_emitido', { required: 'Se necesita el tipo de expediente' })}
                                    name="estado_emitido"
                                    value={currentFile.estado_emitido?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="APROBADO">Aprobado</MenuItem>
                                    <MenuItem value="RECHAZADO">Rechazado</MenuItem>
                                    <MenuItem value="CON ANOMALIAS">Con Anomalias</MenuItem>
                                    <MenuItem value="ANULADO">Anulado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('fecha_enviado_entidad', { required: 'Se necesita la fecha de emision' })}
                                type="date"
                                name="fecha_enviado_entidad"
                                label="Fecha Envio entidad"
                                value={currentFile.fecha_enviado_entidad?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('contrato_CFIA', { required: 'Se necesita el contrato CFIA' })}
                                name="contrato_CFIA"
                                label="Contrato CFIA"
                                value={currentFile.contrato_CFIA?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('acta_traslado', { required: 'Se necesita el acta de traslado' })}
                                name="acta_traslado"
                                label="Acta traslado"
                                value={currentFile.acta_traslado?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('fecha_envio_acta', { required: 'Se necesita la fecha de envío del acta' })}
                                type="date"
                                name="fecha_envio_acta"
                                label="Fecha de envío del acta"
                                value={currentFile.fecha_envio_acta ? new Date(currentFile.fecha_envio_acta).toISOString().split('T')[0] : ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('fecha_aprobado', { required: 'Se necesita la fecha de aprobación' })}
                                type="date"
                                name="fecha_aprobado"
                                label="Fecha de aprobado"
                                value={currentFile.fecha_aprobado ? new Date(currentFile.fecha_aprobado).toISOString().split('T')[0] : ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('usuario_sistema')}
                                name="usuario_sistema"
                                value={user?.nombre_usuario}
                                disabled
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('folio_real', { required: 'Se necesita el folio real' })}
                                name="folio_real"
                                label="Folio real"
                                value={currentFile.folio_real?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('numero_plano', { required: 'Se necesita el número de plano' })}
                                name="numero_plano"
                                label="Número plano"
                                value={currentFile.numero_plano?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('area_construccion', { required: 'Se necesita el área de construcción' })}
                                name="area_construccion"
                                label="Área de construcción (m²)"
                                value={currentFile.area_construccion?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_compra_venta', { required: 'Se necesita el monto de compra-venta' })}
                                name="monto_compra_venta"
                                label="Monto compra-venta"
                                value={formatDecimal(currentFile.monto_compra_venta)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('ingeniero_responsable', { required: 'Se necesita el nombre del ingeniero responsable' })}
                                name="ingeniero_responsable"
                                label="Ingeniero responsable"
                                value={currentFile.ingeniero_responsable?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                {...register('fiscal', { required: 'Se necesita el nombre del fiscal' })}
                                name="fiscal"
                                label="Fiscal"
                                value={currentFile.fiscal?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_presupuesto', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_presupuesto"
                                label="Monto presupuesto"
                                value={formatDecimal(currentFile.monto_presupuesto)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_solucion', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_solucion"
                                label="Monto de Solucion    "
                                value={formatDecimal(currentFile.monto_solucion)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_comision', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_comision"
                                label="Monto de Comision"
                                value={formatDecimal(currentFile.monto_comision)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_costo_terreno', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_costo_terreno"
                                label="Monto Costo de Terreno"
                                value={formatDecimal(currentFile.monto_costo_terreno)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_honorarios_abogado', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_honorarios_abogado"
                                label="Monto Honorarios de Abogados"
                                value={formatDecimal(currentFile.monto_honorarios_abogado)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Patrimonio Familiar</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('patrimonio_familiar', { required: 'Se necesita el tipo de expediente' })}
                                    name="patrimonio_familiar"
                                    value={currentFile.patrimonio_familiar?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="SI">Si</MenuItem>
                                    <MenuItem value="NO">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_patrimonio_familiar', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_patrimonio_familiar"
                                label="Monto Patrimonio Familiar"
                                value={formatDecimal(currentFile.monto_patrimonio_familiar)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_poliza', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_poliza"
                                label="Monto Poliza"
                                value={formatDecimal(currentFile.monto_poliza)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_fiscalizacion', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_fiscalizacion"
                                label="Monto Fiscalizacion"
                                value={formatDecimal(currentFile.monto_fiscalizacion)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_kilometraje', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_kilometraje"
                                label="Monto Kilometraje"
                                value={formatDecimal(currentFile.monto_kilometraje)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_afiliacion', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_afiliacion"
                                label="Monto Afiliacion"
                                value={formatDecimal(currentFile.monto_afiliacion)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_trabajo_social', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_trabajo_social"
                                label="Monto Trabajo Social"
                                value={formatDecimal(currentFile.monto_trabajo_social)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_construccion', { required: 'Se necesita el monto de construcción' })}
                                name="monto_construccion"
                                label="Monto construcción"
                                value={formatDecimal(currentFile.monto_construccion)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Constructora</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('constructora_asignada', { required: 'Se necesita el tipo de expediente' })}
                                    name="constructora_asignada"
                                    value={currentFile.constructora_asignada?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="DICASA">DICASA</MenuItem>
                                    <MenuItem value="ROQUE Y RIVERA">Roque y Rivera</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('boleta', { required: 'Se necesita la boleta' })}
                                name="boleta"
                                label="Boleta"
                                value={currentFile.boleta?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('acuerdo_aprobacion', { required: 'Se necesita el acuerdo de aprobación' })}
                                name="acuerdo_aprobacion"
                                label="Acuerdo aprobación"
                                value={currentFile.acuerdo_aprobacion?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_estudio_social', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_estudio_social"
                                label="Monto Estudio Social"
                                value={formatDecimal(currentFile.monto_estudio_social)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_aporte_familia', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_aporte_familia"
                                label="Monto Aporte Familiar"
                                value={formatDecimal(currentFile.monto_aporte_familia)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_gastos_formalizacion', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_gastos_formalizacion"
                                label="Monto de Gastos de formalizacion"
                                value={formatDecimal(currentFile.monto_gastos_formalizacion)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_aporte_gastos', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_aporte_gastos"
                                label="Monto de Aporte de Gastos"
                                value={formatDecimal(currentFile.monto_aporte_gastos)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_diferencia_aporte', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_diferencia_aporte"
                                label="Monto de Diferencia de Aporte"
                                value={formatDecimal(currentFile.monto_diferencia_aporte)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('monto_prima_seguros', { required: 'Se necesita el monto del presupuesto' })}
                                name="monto_prima_seguros"
                                label="Monto de Prima de Seguros"
                                value={formatDecimal(currentFile.monto_prima_seguros)}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('ubicacion', { required: 'Se necesita la nueva observacion' })}
                                name="ubicacion"
                                label="Ubicacion"
                                value={currentFile.ubicacion?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                {...register('remitente', { required: 'Se necesita la remision' })}
                                name="remitente"
                                label="Remitente"
                                value={currentFile.remitente?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('asignadoa', { required: 'Se necesita la asignacion' })}
                                name="asignadoa"
                                label="Asignado(a)"
                                value={currentFile.asignadoa?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('etiqueta', { required: 'Se necesita la nueva observacion' })}
                                name="etiqueta"
                                label="Etiqueta"
                                value={currentFile.etiqueta?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <FormControl fullWidth>
                                <InputLabel id="entidad-label">Entidad</InputLabel>
                                <Select
                                    labelId="entidad-label"
                                    {...register('entidad', { required: 'Se necesita el usuario' })}
                                    name="entidad"
                                    value={currentFile.entidad?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Seleccionar Entidad"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}

                                >
                                    {Array.isArray(normalize) && normalize.map((normalize) => (
                                        <MenuItem key={normalize.id} value={normalize.empresa}>
                                            {normalize.empresa}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', { required: 'Se necesita la nueva observacion' })}
                                name="observaciones"
                                label="Observaciones"
                                value={currentFile.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>

                    </Grid>
                    <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                        Actualizar
                    </Button>
                </form>
            </Box>
            <Dialog
                open={openHistoryDialog}
                onClose={() => setOpenHistoryDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Ver Hisotiral de cambios</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '1200px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedFile && (<HistoryFiles HistoryData={selectedFile} />)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}
