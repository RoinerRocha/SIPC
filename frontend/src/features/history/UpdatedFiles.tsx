import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {
    Button, Card, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem,
    Select, SelectChangeEvent, Stepper, Step, StepLabel,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { useEffect, useState } from 'react';
import { filesModel } from "../../app/models/filesModel";
import HistoryFiles from "./FilesHistory";
import { historyFilesModel } from "../../app/models/historyFilesModel";
import { statesFilesModel } from "../../app/models/stateFilesModel";
import { CompanySituationModel } from "../../app/models/companySituationModel";
import { companyProgramModel } from "../../app/models/companyProgramModel";
import { banhviStateModel } from "../../app/models/banhviStateModel";
import { banhviPurposeModel } from "../../app/models/banhviPurposeModel";
import { entityModel } from "../../app/models/EntityModel";
import { stateEntityModel } from "../../app/models/stateEntityModel";
import { constructionAnalystModel } from "../../app/models/constructionAnalystModel";
import { entityAnalystModel } from "../../app/models/entityAnalystModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


interface UpdateFilesProps {
    FilesData: filesModel;
    loadAccess: () => void;
}

interface PersonaResponsable {
    nombre: string;
    tipo: string;
}



export default function UpdateFiles({ FilesData, loadAccess }: UpdateFilesProps) {
    const [currentFile, setCurrentFile] = useState<Partial<filesModel>>(FilesData);
    const [stateFile, setStateFile] = useState<statesFilesModel[]>([]);
    const [companySituation, setCompanySituation] = useState<CompanySituationModel[]>([]);
    const [companyProgram, setCompanyProgram] = useState<companyProgramModel[]>([]);
    const [banhviState, setBanhviState] = useState<banhviStateModel[]>([]);
    const [banhviPurpose, setBanhviPurpose] = useState<banhviPurposeModel[]>([]);
    const [entity, setEntity] = useState<entityModel[]>([]);
    const [stataeEntity, setStateEntity] = useState<stateEntityModel[]>([]);
    const [selectedFile, setSelectedFile] = useState<historyFilesModel[] | null>(null);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const [fiscalesIngenieros, setFiscalesIngenieros] = useState<PersonaResponsable[]>([]);
    const [constructionAnalyt, setConstructionAnalyst] = useState<constructionAnalystModel[]>([]);
    const [entityAnalyst, setEntityAnalystModel] = useState<entityAnalystModel[]>([]);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const { user } = useAppSelector(state => state.account);
    const [activeStep, setActiveStep] = useState(0);

    const steps = [{ label: "Empresa", icon: <BusinessIcon /> },
    { label: "Entidad", icon: <AccountBalanceIcon /> },
    { label: "Banhvi", icon: <AccountBalanceWalletIcon /> },
    { label: "Lote", icon: <HomeWorkIcon /> },
    { label: "Montos y Comprobantes", icon: <AttachMoneyIcon /> },
    { label: "Fechas de movimientos", icon: <EventNoteIcon /> }]; // Títulos de los pasos


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
                const [stateFilesData, companySituationData, companyProgramData, banhviStateData,
                    banhviPurposeData, entityData, stateEntityData, constructionAnalytData, entityAnalystData, limitsData] = await Promise.all([
                        api.StateFiles.getAllStateFiles(),
                        api.SubStateFiles.getAllCompanySituation(),
                        api.SubStateFiles.getAllCompanyProgram(),
                        api.SubStateFiles.getAllBanhviState(),
                        api.SubStateFiles.getAllBanhviPurpose(),
                        api.SubStateFiles.getAllEntity(),
                        api.SubStateFiles.getAllStateEntity(),
                        api.normalizers.getAnalistasConstructora(),
                        api.normalizers.getAnalistasEntidad(),
                        api.history.getFieldLimits()
                    ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (stateFilesData && Array.isArray(stateFilesData.data)) {
                    setStateFile(stateFilesData.data);
                } else {
                    console.error("StateFile data is not an array", stateFilesData);
                }
                if (companySituationData && Array.isArray(companySituationData.data)) {
                    setCompanySituation(companySituationData.data);
                } else {
                    console.error("companySituation data is not an array", companySituationData);
                }
                if (companyProgramData && Array.isArray(companyProgramData.data)) {
                    setCompanyProgram(companyProgramData.data);
                } else {
                    console.error("companyProgram data is not an array", companyProgramData);
                }
                if (banhviStateData && Array.isArray(banhviStateData.data)) {
                    setBanhviState(banhviStateData.data);
                } else {
                    console.error("banhviState data is not an array", banhviStateData);
                }
                if (banhviPurposeData && Array.isArray(banhviPurposeData.data)) {
                    setBanhviPurpose(banhviPurposeData.data);
                } else {
                    console.error("banhviState data is not an array", banhviPurposeData);
                }
                if (entityData && Array.isArray(entityData.data)) {
                    setEntity(entityData.data);
                } else {
                    console.error("entity data is not an array", entityData);
                }
                if (stateEntityData && Array.isArray(stateEntityData.data)) {
                    setStateEntity(stateEntityData.data);
                } else {
                    console.error("state entity data is not an array", stateEntityData);
                }
                if (constructionAnalytData && Array.isArray(constructionAnalytData.data)) {
                    setConstructionAnalyst(constructionAnalytData.data);
                } else {
                    console.error("analyst entity data is not an array", constructionAnalytData);
                }
                if (entityAnalystData && Array.isArray(entityAnalystData.data)) {
                    setEntityAnalystModel(entityAnalystData.data);
                } else {
                    console.error("analyst data is not an array", entityAnalystData);
                }
                if (limitsData) setLimits(limitsData);

            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al cargar los datos",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: FieldValues) => {
        if (!currentFile || !user?.nombre_usuario) return;

        const result = await Swal.fire({
            title: '¿Desea actualizar este expediente?',
            text: 'Se guardarán los cambios realizados en el expediente.',
            icon: 'question',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, actualizar',
            denyButtonText: 'No actualizar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                popup: 'swal-z-index',
                confirmButton: 'swal-confirm-btn',
                denyButton: 'swal-deny-btn'
            }
        });

        if (result.isConfirmed) {
            try {
                await api.history.updateFiles(String(currentFile.codigo), user.nombre_usuario, currentFile);
                await Swal.fire({
                    icon: 'success',
                    title: 'Expediente actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el expediente:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el expediente.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Actualización cancelada',
                text: 'No se realizaron cambios en el expediente.',
                showConfirmButton: false,
                timer: 2000
            });
        }
        // Si presiona "Cancelar", simplemente se cierra el modal sin realizar acción.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentFile((prev) => ({
            ...prev,
            [name]: name === 'dias_emitido' || name === 'dias_desde_entrega' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSelectChange = async (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentFile(prev => ({ ...prev, [name]: value }));

        if (name === "entidad") {
            try {
                console.log(`Obteniendo fiscales e ingenieros para la entidad: ${value}`);
                const response = await api.normalizers.getFiscalesAndIngenierosByEmpresa(value);
                console.log("Respuesta de la API:", response.data);
                setFiscalesIngenieros(response.data || []);
            } catch (error) {
                console.error("Error al obtener fiscales e ingenieros:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al cargar los ingenieros y los fiscales",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        }
    };

    const handleEdit = async (codigo: string) => {
        try {
            const response = await api.history.getHistoryFiles(codigo);
            setSelectedFile(response.data);
            setOpenHistoryDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los pagos:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error, no se puede acceder a este expediente",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const formatDecimal = (value: any): string => {
        const numberValue = parseFloat(value);
        return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    return (
        <Card>
            <Button
                variant="contained"
                color="info"
                sx={{ margin: "20px", textTransform: "none" }}
                onClick={() => handleEdit(String(FilesData.codigo))}
            >
                Ver historial de cambios del expediente
            </Button>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ marginBottom: '20px' }}>
                {steps.map((step, index) => (
                    <Step key={index}>
                        <StepLabel
                            onClick={() => setActiveStep(index)}
                            style={{ cursor: "pointer" }}
                            icon={
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        border: "2px solid #1976D2", // Azul similar al encabezado de la tabla
                                        backgroundColor: activeStep === index ? "#1976D2" : "white",
                                        color: activeStep === index ? "white" : "#1976D2",
                                    }}
                                >
                                    {step.icon}
                                </Box>
                            }
                        >
                            {step.label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box p={2} sx={{
                maxHeight: '50vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="update-file-form" onSubmit={handleSubmit(onSubmit)}>
                    {activeStep === 0 && (

                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('expediente', {
                                        maxLength: {
                                            value: limits.expediente,
                                            message: `Límite de ${limits.expediente} caracteres excedido`
                                        }
                                     })}
                                    name="expediente"
                                    label="Expediente"
                                    value={currentFile.expediente?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.expediente}
                                    helperText={errors?.expediente?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Beneficiario"
                                    value={currentFile.beneficiario?.toString() || ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.tipo_expediente}>
                                    <InputLabel id="tipo-label">Tipo de expediente</InputLabel>
                                    <Select
                                        labelId="tipo-label"
                                        {...register('tipo_expediente')}
                                        name="tipo_expediente"
                                        value={currentFile.tipo_expediente?.toString() || ''}
                                        onChange={handleSelectChange}
                                        fullWidth
                                        label="Tipo de expediente"
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
                                    {errors.tipo_expediente && (
                                        <FormHelperText>{errors.tipo_expediente.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl fullWidth error={!!errors.estado}>
                                    <InputLabel id="estado-label">Estado del Expediente</InputLabel>
                                    <Select
                                        labelId="estado-label"
                                        {...register('estado')}
                                        name="estado"
                                        value={currentFile.estado?.toString() || ''}
                                        onChange={handleSelectChange}
                                        label="Estado del Expediente"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 620,
                                                },
                                            },
                                        }}
                                    >
                                        {Array.isArray(stateFile) && stateFile.map((stateFile) => (
                                            <MenuItem key={stateFile.id} value={stateFile.nombre}>
                                                {stateFile.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.estado && (
                                        <FormHelperText>{errors.estado.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl fullWidth error={!!errors.proposito_bono}>
                                    <InputLabel id="proposito_bono-label">Proposito Bono</InputLabel>
                                    <Select
                                        labelId="proposito_bono-label"
                                        {...register('proposito_bono')}
                                        name="proposito_bono"
                                        value={currentFile.proposito_bono?.toString() || ''}
                                        onChange={handleSelectChange}
                                        fullWidth
                                        label="Proposito Bono"
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
                                    {errors.proposito_bono && (
                                        <FormHelperText>{errors.proposito_bono.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl fullWidth error={!!errors.programa_empresa}>
                                    <InputLabel id="programa_empresa-label">Programa de la empresa</InputLabel>
                                    <Select
                                        labelId="programa_empresa-label"
                                        {...register('programa_empresa')}
                                        name="programa_empresa"
                                        value={currentFile.programa_empresa || ""}
                                        onChange={handleSelectChange}
                                        label="Programa de la empresa"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 500,
                                                },
                                            },
                                        }}
                                    >
                                        {companyProgram.map(companyProgram => (
                                            <MenuItem key={companyProgram.id} value={companyProgram.nombre}>
                                                {companyProgram.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.programa_empresa && (
                                        <FormHelperText>{errors.programa_empresa.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl fullWidth error={!!errors.situacion_empresa}>
                                    <InputLabel id="entidad-label">Situacion de empresa</InputLabel>
                                    <Select
                                        labelId="entidad-label"
                                        {...register('situacion_empresa')}
                                        name="situacion_empresa"
                                        value={currentFile.situacion_empresa || ""}
                                        onChange={handleSelectChange}
                                        label="Situacion de empresa"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 250,
                                                },
                                            },
                                        }}
                                    >
                                        {companySituation.map(companySituation => (
                                            <MenuItem key={companySituation.id} value={companySituation.nombre}>
                                                {companySituation.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.situacion_empresa && (
                                        <FormHelperText>{errors.situacion_empresa.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('contrato_empresa', {
                                        maxLength: {
                                            value: limits.contrato_empresa,
                                            message: `Límite de ${limits.contrato_empresa} caracteres excedido`
                                        }
                                    })}
                                    name="contrato_empresa"
                                    label="Contrato de la Empresa"
                                    value={currentFile.contrato_empresa?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.contrato_empresa}
                                    helperText={errors?.contrato_empresa?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('nuevo_bono', {
                                        maxLength: {
                                            value: limits.nuevo_bono,
                                            message: `Límite de ${limits.nuevo_bono} caracteres excedido`
                                        }
                                    })}
                                    name="nuevo_bono"
                                    label="Nuevo Bono"
                                    value={currentFile.nuevo_bono?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.nuevo_bono}
                                    helperText={errors?.nuevo_bono?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('codigo_apc', {
                                        maxLength: {
                                            value: limits.codigo_apc,
                                            message: `Límite de ${limits.codigo_apc} caracteres excedido`
                                        }
                                    })}
                                    name="codigo_apc"
                                    label="Codigo APC"
                                    value={currentFile.codigo_apc?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.codigo_apc}
                                    helperText={errors?.codigo_apc?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('exoneracion_ley_9635', {
                                        maxLength: {
                                            value: limits.exoneracion_ley_9635,
                                            message: `Límite de ${limits.exoneracion_ley_9635} caracteres excedido`
                                        }
                                    })}
                                    name="exoneracion_ley_9635"
                                    label="Exoneracion de ley 9635"
                                    value={currentFile.exoneracion_ley_9635?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.exoneracion_ley_9635}
                                    helperText={errors?.exoneracion_ley_9635?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <FormControl fullWidth error={!!errors.patrimonio_familiar}>
                                    <InputLabel id="tipo-label">Patrimonio Familiar</InputLabel>
                                    <Select
                                        labelId="tipo-label"
                                        {...register('patrimonio_familiar')}
                                        name="patrimonio_familiar"
                                        value={currentFile.patrimonio_familiar?.toString() || ''}
                                        onChange={handleSelectChange}
                                        fullWidth
                                        label="Patrimonio Familiar"
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
                                    {errors.patrimonio_familiar && (
                                        <FormHelperText>{errors.patrimonio_familiar.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('profesional', {
                                        maxLength: {
                                            value: limits.profesional,
                                            message: `Límite de ${limits.profesional} caracteres excedido`
                                        }
                                    })}
                                    name="profesional"
                                    label="Profesional"
                                    value={currentFile.profesional?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.profesional}
                                    helperText={errors?.profesional?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('contacto', {
                                        maxLength: {
                                            value: limits.contacto,
                                            message: `Límite de ${limits.contacto} caracteres excedido`
                                        }
                                    })}
                                    name="contacto"
                                    label="Contacto"
                                    value={currentFile.contacto?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.contacto}
                                    helperText={errors?.contacto?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.constructora_asignada}>
                                    <InputLabel id="tipo-label">Constructora</InputLabel>
                                    <Select
                                        labelId="tipo-label"
                                        {...register('constructora_asignada')}
                                        name="constructora_asignada"
                                        value={currentFile.constructora_asignada?.toString() || ''}
                                        onChange={handleSelectChange}
                                        fullWidth
                                        label="Constructora"
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
                                    {errors.constructora_asignada && (
                                        <FormHelperText>{errors.constructora_asignada.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.responsable}>
                                    <InputLabel id="responsable-label">Responsable</InputLabel>
                                    <Select
                                        labelId="responsable-label"
                                        {...register('responsable')}
                                        name="responsable"
                                        value={currentFile.responsable || ""}
                                        onChange={handleSelectChange}
                                        label="Responsable"
                                    >
                                        {entity.map(entity => (
                                            <MenuItem key={entity.id} value={entity.nombre}>
                                                {entity.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.responsable && (
                                        <FormHelperText>{errors.responsable.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.analista_constructora}>
                                    <InputLabel id="analista_constructora-label">Analista de la constructora</InputLabel>
                                    <Select
                                        labelId="analista_constructora-label"
                                        {...register('analista_constructora')}
                                        name="analista_constructora"
                                        value={currentFile.analista_constructora?.toString() || ''}
                                        onChange={handleSelectChange}
                                        label="Analista de la constructora"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 200,
                                                },
                                            },
                                        }}
                                    >
                                        {Array.isArray(constructionAnalyt) && constructionAnalyt.map((constructionAnalyt) => (
                                            <MenuItem key={constructionAnalyt.id} value={constructionAnalyt.nombre}>
                                                {constructionAnalyt.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.analista_constructora && (
                                        <FormHelperText>{errors.analista_constructora.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('remitente', {
                                        maxLength: {
                                            value: limits.remitente,
                                            message: `Límite de ${limits.remitente} caracteres excedido`
                                        }
                                    })}
                                    name="remitente"
                                    label="Remitente"
                                    value={currentFile.remitente?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.remitente}
                                    helperText={errors?.remitente?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('asignadoa', {
                                        maxLength: {
                                            value: limits.asignadoa,
                                            message: `Límite de ${limits.asignadoa} caracteres excedido`
                                        }
                                    })}
                                    name="asignadoa"
                                    label="Asignado(a)"
                                    value={currentFile.asignadoa?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.asignadoa}
                                    helperText={errors?.asignadoa?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Usuario"
                                    {...register('usuario_sistema')}
                                    name="usuario_sistema"
                                    value={user?.nombre_usuario}
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    {...register('observaciones', {
                                        maxLength: {
                                            value: limits.observaciones,
                                            message: `Límite de ${limits.observaciones} caracteres excedido`
                                        }
                                    })}
                                    name="observaciones"
                                    label="Observaciones del Expediente"
                                    value={currentFile.observaciones?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.observaciones}
                                    helperText={errors?.observaciones?.message as string}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                    {activeStep === 1 && (
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.entidad}>
                                    <InputLabel id="entidad-label">Entidad</InputLabel>
                                    <Select
                                        labelId="entidad-label"
                                        {...register('entidad')}
                                        name="entidad"
                                        value={currentFile.entidad || ""}
                                        onChange={handleSelectChange}
                                        label="Entidad"
                                    >
                                        {entity.map(entity => (
                                            <MenuItem key={entity.id} value={entity.nombre}>
                                                {entity.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.entidad && (
                                        <FormHelperText>{errors.entidad.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl fullWidth error={!!errors.estado_entidad}>
                                    <InputLabel id="estado_entidad-label">Estado de la Entidad</InputLabel>
                                    <Select
                                        labelId="estado_entidad-label"
                                        {...register('estado_entidad')}
                                        name="estado_entidad"
                                        value={currentFile.estado_entidad?.toString() || ""}
                                        onChange={handleSelectChange}
                                        label="Estado de la Entidad"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 350,
                                                },
                                            },
                                        }}
                                    >
                                        {Array.isArray(stataeEntity) && stataeEntity.map((stataeEntity) => (
                                            <MenuItem key={stataeEntity.id} value={stataeEntity.nombre}>
                                                {stataeEntity.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.estado_entidad && (
                                        <FormHelperText>{errors.estado_entidad.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_enviado_entidad')}
                                    type="date"
                                    name="fecha_enviado_entidad"
                                    label="Fecha Envio entidad"
                                    value={currentFile.fecha_enviado_entidad?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.fecha_enviado_entidad}
                                    helperText={errors?.fecha_enviado_entidad?.message as string}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.analista_ente}>
                                    <InputLabel id="analista_ente-label">Analista del ente</InputLabel>
                                    <Select
                                        labelId="analista_ente-label"
                                        {...register('analista_ente')}
                                        name="analista_ente"
                                        value={currentFile.analista_ente?.toString() || ''}
                                        onChange={handleSelectChange}
                                        label="Analista del ente"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 200,
                                                },
                                            },
                                        }}
                                    >
                                        {Array.isArray(entityAnalyst) && entityAnalyst.map((entityAnalyst) => (
                                            <MenuItem key={entityAnalyst.id} value={entityAnalyst.nombre}>
                                                {entityAnalyst.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.analista_constructora && (
                                        <FormHelperText>{errors.analista_constructora.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.ingeniero_responsable}>
                                    <InputLabel id="ingeniero-label">Ingeniero Responsable</InputLabel>
                                    <Select
                                        labelId="ingeniero-label"
                                        {...register('ingeniero_responsable')}
                                        name="ingeniero_responsable"
                                        value={currentFile.ingeniero_responsable || ""}
                                        onChange={handleSelectChange}
                                        label="Ingeniero Responsable"
                                    >
                                        {fiscalesIngenieros.filter(p => p.tipo === 'INGENIEROS').map(persona => (
                                            <MenuItem key={persona.nombre} value={persona.nombre}>
                                                {persona.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.ingeniero_responsable && (
                                        <FormHelperText>{errors.ingeniero_responsable.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.ingeniero_responsable}>
                                    <InputLabel id="fiscal-label">Fiscal</InputLabel>
                                    <Select
                                        labelId="fiscal-label"
                                        {...register('fiscal')}
                                        name="fiscal"
                                        value={currentFile.fiscal || ""}
                                        onChange={handleSelectChange}
                                        label="Fiscal"
                                    >
                                        {fiscalesIngenieros.filter(p => p.tipo === 'FISCALES').map(persona => (
                                            <MenuItem key={persona.nombre} value={persona.nombre}>
                                                {persona.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.ingeniero_responsable && (
                                        <FormHelperText>{errors.ingeniero_responsable.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    {...register('observaciones_ente', {
                                        maxLength: {
                                            value: limits.observaciones_ente,
                                            message: `Límite de ${limits.observaciones_ente} caracteres excedido`
                                        }
                                    })}
                                    name="observaciones_ente"
                                    label="Observaciones del Ente"
                                    value={currentFile.observaciones_ente?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.observaciones_ente}
                                    helperText={errors?.observaciones_ente?.message as string}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                    {activeStep === 2 && (
                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('numero_bono', {
                                        maxLength: {
                                            value: limits.numero_bono,
                                            message: `Límite de ${limits.numero_bono} caracteres excedido`
                                        }
                                    })}
                                    name="numero_bono"
                                    label="Número de bono"
                                    value={currentFile.numero_bono?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.numero_bono}
                                    helperText={errors?.numero_bono?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.estado_banhvi}>
                                    <InputLabel id="estado_banhvi-label">Estado de Banhvi</InputLabel>
                                    <Select
                                        labelId="estado_banhvi-label"
                                        {...register('estado_banhvi')}
                                        name="estado_banhvi"
                                        value={currentFile.estado_banhvi || ""}
                                        onChange={handleSelectChange}
                                        label="Estado de Banhvi"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 250,
                                                },
                                            },
                                        }}
                                    >
                                        {banhviState.map(banhviState => (
                                            <MenuItem key={banhviState.id} value={banhviState.nombre}>
                                                {banhviState.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.estado_banhvi && (
                                        <FormHelperText>{errors.estado_banhvi.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth error={!!errors.estado_emitido}>
                                    <InputLabel id="tipo-label">Estado Emitido</InputLabel>
                                    <Select
                                        labelId="tipo-label"
                                        {...register('estado_emitido')}
                                        name="estado_emitido"
                                        value={currentFile.estado_emitido?.toString() || ''}
                                        onChange={handleSelectChange}
                                        fullWidth
                                        label="Estado Emitido"
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
                                    {errors.estado_emitido && (
                                        <FormHelperText>{errors.estado_emitido.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_emitido')}
                                    type="date"
                                    name="fecha_emitido"
                                    label="Fecha de Emitido"
                                    value={currentFile.fecha_emitido?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_emitido}
                                    helperText={errors?.fecha_emitido?.message as string}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_enviado_banhvi')}
                                    type="date"
                                    name="fecha_enviado_banhvi"
                                    label="Fecha de Envio a Banhvi"
                                    value={currentFile.fecha_enviado_banhvi?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_enviado_banhvi}
                                    helperText={errors?.fecha_enviado_banhvi?.message as string}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth error={!!errors.proposito_banhvi}>
                                    <InputLabel id="proposito_banhvi-label">Proposito Banhvi</InputLabel>
                                    <Select
                                        labelId="proposito_banhvi-label"
                                        {...register('proposito_banhvi')}
                                        name="proposito_banhvi"
                                        value={currentFile.proposito_banhvi || ""}
                                        onChange={handleSelectChange}
                                        label="Proposito Banhvi"
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200, // Limita la altura del menú desplegable
                                                    width: 250,
                                                },
                                            },
                                        }}
                                    >
                                        {banhviPurpose.map(banhviPurpose => (
                                            <MenuItem key={banhviPurpose.id} value={banhviPurpose.nombre}>
                                                {banhviPurpose.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.proposito_banhvi && (
                                        <FormHelperText>{errors.proposito_banhvi.message as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('contrato_CFIA', {
                                        maxLength: {
                                            value: limits.contrato_CFIA,
                                            message: `Límite de ${limits.contrato_CFIA} caracteres excedido`
                                        }
                                    })}
                                    name="contrato_CFIA"
                                    label="Contrato CFIA"
                                    value={currentFile.contrato_CFIA?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.contrato_CFIA}
                                    helperText={errors?.contrato_CFIA?.message as string}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_ingreso_cfia')}
                                    type="date"
                                    name="fecha_ingreso_cfia"
                                    label="Fecha de Ingreso CFIA"
                                    value={currentFile.fecha_ingreso_cfia?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_ingreso_cfia}
                                    helperText={errors?.fecha_ingreso_cfia?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_salida_cfia')}
                                    type="date"
                                    name="fecha_salida_cfia"
                                    label="Fecha de Salida CFIA"
                                    value={currentFile.fecha_salida_cfia?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_salida_cfia}
                                    helperText={errors?.fecha_salida_cfia?.message as string}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_sello_cfia')}
                                    type="date"
                                    name="fecha_sello_cfia"
                                    label="Fecha del Sello CFIA"
                                    value={currentFile.fecha_sello_cfia?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_sello_cfia}
                                    helperText={errors?.fecha_sello_cfia?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('dias_emitido')}
                                    name="dias_emitido"
                                    label="Dias Emitidos"
                                    value={currentFile.dias_emitido}
                                    onChange={handleInputChange}
                                    error={!!errors.dias_emitido}
                                    helperText={errors?.dias_emitido?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('dias_desde_entrega')}
                                    name="dias_desde_entrega"
                                    label="Dias Desde la entrega"
                                    value={currentFile.dias_desde_entrega}
                                    onChange={handleInputChange}
                                    error={!!errors.dias_desde_entrega}
                                    helperText={errors?.dias_desde_entrega?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('etiqueta', {
                                        maxLength: {
                                            value: limits.etiqueta,
                                            message: `Límite de ${limits.etiqueta} caracteres excedido`
                                        }
                                    })}
                                    name="etiqueta"
                                    label="Etiqueta"
                                    value={currentFile.etiqueta?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.etiqueta}
                                    helperText={errors?.etiqueta?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('acta_traslado', {
                                        maxLength: {
                                            value: limits.acta_traslado,
                                            message: `Límite de ${limits.acta_traslado} caracteres excedido`
                                        }
                                    })}
                                    name="acta_traslado"
                                    label="Acta traslado"
                                    value={currentFile.acta_traslado?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.acta_traslado}
                                    helperText={errors?.acta_traslado?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_envio_acta')}
                                    type="date"
                                    name="fecha_envio_acta"
                                    label="Fecha de envío del acta"
                                    value={currentFile.fecha_envio_acta ? new Date(currentFile.fecha_envio_acta).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    error={!!errors.fecha_envio_acta}
                                    helperText={errors?.fecha_envio_acta?.message as string}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('boleta', {
                                        maxLength: {
                                            value: limits.boleta,
                                            message: `Límite de ${limits.boleta} caracteres excedido`
                                        }
                                    })}
                                    name="boleta"
                                    label="Boleta"
                                    value={currentFile.boleta?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.boleta}
                                    helperText={errors?.boleta?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('acuerdo_aprobacion', {
                                        maxLength: {
                                            value: limits.acuerdo_aprobacion,
                                            message: `Límite de ${limits.acuerdo_aprobacion} caracteres excedido`
                                        }
                                    })}
                                    name="acuerdo_aprobacion"
                                    label="Acuerdo aprobación"
                                    value={currentFile.acuerdo_aprobacion?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.acuerdo_aprobacion}
                                    helperText={errors?.acuerdo_aprobacion?.message as string}
                                />
                            </Grid>
                        </Grid>
                    )}
                    {activeStep === 3 && (
                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('folio_real', {
                                        maxLength: {
                                            value: limits.folio_real,
                                            message: `Límite de ${limits.folio_real} caracteres excedido`
                                        }
                                    })}
                                    name="folio_real"
                                    label="Folio real"
                                    value={currentFile.folio_real?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.folio_real}
                                    helperText={errors?.folio_real?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('area_construccion')}
                                    name="area_construccion"
                                    label="Área de construcción (m²)"
                                    value={currentFile.area_construccion?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.area_construccion}
                                    helperText={errors?.area_construccion?.message as string}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('numero_plano', {
                                        maxLength: {
                                            value: limits.numero_plano,
                                            message: `Límite de ${limits.numero_plano} caracteres excedido`
                                        }
                                    })}
                                    name="numero_plano"
                                    label="Número plano"
                                    value={currentFile.numero_plano?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.numero_plano}
                                    helperText={errors?.numero_plano?.message as string}
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('ubicacion', {
                                        maxLength: {
                                            value: limits.ubicacion,
                                            message: `Límite de ${limits.ubicacion} caracteres excedido`
                                        }
                                    })}
                                    name="ubicacion"
                                    label="Ubicacion"
                                    value={currentFile.ubicacion?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.ubicacion}
                                    helperText={errors?.ubicacion?.message as string}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('inscrito_hacienda', {
                                        maxLength: {
                                            value: limits.inscrito_hacienda,
                                            message: `Límite de ${limits.inscrito_hacienda} caracteres excedido`
                                        }
                                    })}
                                    name="inscrito_hacienda"
                                    label="Inscrito en Hacienda"
                                    value={currentFile.inscrito_hacienda?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.inscrito_hacienda}
                                    helperText={errors?.inscrito_hacienda?.message as string}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 4 && (

                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_bono')}
                                    name="monto_bono"
                                    label="Monto del bono"
                                    value={formatDecimal(currentFile.monto_bono)}
                                    onChange={handleInputChange}
                                    error={!!errors.monto_bono}
                                    helperText={errors?.monto_bono?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_solucion')}
                                    name="monto_solucion"
                                    label="Monto de Solucion    "
                                    value={formatDecimal(currentFile.monto_solucion)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_construccion')}
                                    name="monto_construccion"
                                    label="Monto construcción"
                                    value={formatDecimal(currentFile.monto_construccion)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_compra_venta')}
                                    name="monto_compra_venta"
                                    label="Monto compra-venta"
                                    value={formatDecimal(currentFile.monto_compra_venta)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_presupuesto')}
                                    name="monto_presupuesto"
                                    label="Monto presupuesto"
                                    value={formatDecimal(currentFile.monto_presupuesto)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_comision')}
                                    name="monto_comision"
                                    label="Monto de Comision"
                                    value={formatDecimal(currentFile.monto_comision)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_costo_terreno')}
                                    name="monto_costo_terreno"
                                    label="Monto Costo de Terreno"
                                    value={formatDecimal(currentFile.monto_costo_terreno)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_honorarios_abogado')}
                                    name="monto_honorarios_abogado"
                                    label="Monto Honorarios de Abogados"
                                    value={formatDecimal(currentFile.monto_honorarios_abogado)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_patrimonio_familiar')}
                                    name="monto_patrimonio_familiar"
                                    label="Monto Patrimonio Familiar"
                                    value={formatDecimal(currentFile.monto_patrimonio_familiar)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_poliza')}
                                    name="monto_poliza"
                                    label="Monto Poliza"
                                    value={formatDecimal(currentFile.monto_poliza)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_fiscalizacion')}
                                    name="monto_fiscalizacion"
                                    label="Monto Fiscalizacion"
                                    value={formatDecimal(currentFile.monto_fiscalizacion)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_kilometraje')}
                                    name="monto_kilometraje"
                                    label="Monto Kilometraje"
                                    value={formatDecimal(currentFile.monto_kilometraje)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_afiliacion')}
                                    name="monto_afiliacion"
                                    label="Monto Afiliacion"
                                    value={formatDecimal(currentFile.monto_afiliacion)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_gastos_formalizacion')}
                                    name="monto_gastos_formalizacion"
                                    label="Monto de Gastos de formalizacion"
                                    value={formatDecimal(currentFile.monto_gastos_formalizacion)}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_aporte_gastos')}
                                    name="monto_aporte_gastos"
                                    label="Monto de Aporte de Gastos"
                                    value={formatDecimal(currentFile.monto_aporte_gastos)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_prima_seguros')}
                                    name="monto_prima_seguros"
                                    label="Monto de Prima de Seguros"
                                    value={formatDecimal(currentFile.monto_prima_seguros)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('comprobante_pago_avaluo', {
                                        maxLength: {
                                            value: limits.comprobante_pago_avaluo,
                                            message: `Límite de ${limits.comprobante_pago_avaluo} caracteres excedido`
                                        }
                                    })}
                                    name="comprobante_pago_avaluo"
                                    label="Comprobante del Pago de Avaluo"
                                    value={currentFile.comprobante_pago_avaluo?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.comprobante_pago_avaluo}
                                    helperText={errors?.comprobante_pago_avaluo?.message as string}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('monto_pago_avaluo')}
                                    name="monto_pago_avaluo"
                                    label="Monto del Pago de Avaluo"
                                    value={formatDecimal(currentFile.monto_pago_avaluo)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_pago_avaluo')}
                                    type="date"
                                    name="fecha_pago_avaluo"
                                    label="Fecha de Pago de Avaluo"
                                    value={currentFile.fecha_pago_avaluo?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_pago_avaluo}
                                    helperText={errors?.fecha_pago_avaluo?.message as string}
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('comprobante_pago_formalizacion', {
                                        maxLength: {
                                            value: limits.comprobante_pago_formalizacion,
                                            message: `Límite de ${limits.comprobante_pago_formalizacion} caracteres excedido`
                                        }
                                    })}
                                    name="comprobante_pago_formalizacion"
                                    label="Comprobante del Pago de Formalizacion"
                                    value={currentFile.comprobante_pago_formalizacion?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.comprobante_pago_formalizacion}
                                    helperText={errors?.comprobante_pago_formalizacion?.message as string}
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('monto_pago_formalizacion')}
                                    name="monto_pago_formalizacion"
                                    label="Monto del Pago de Formalizacion"
                                    value={formatDecimal(currentFile.monto_pago_formalizacion)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_pago_formalizacion')}
                                    type="date"
                                    name="fecha_pago_formalizacion"
                                    label="Fecha de Pago de Formalizacion"
                                    value={currentFile.fecha_pago_formalizacion?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_pago_formalizacion}
                                    helperText={errors?.fecha_pago_formalizacion?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_estudio_social')}
                                    name="monto_estudio_social"
                                    label="Monto Estudio Social"
                                    value={formatDecimal(currentFile.monto_estudio_social)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('comprobante_trabrajo_social', {
                                        maxLength: {
                                            value: limits.comprobante_trabrajo_social,
                                            message: `Límite de ${limits.comprobante_trabrajo_social} caracteres excedido`
                                        }
                                    })}
                                    name="comprobante_trabrajo_social"
                                    label="Comprobante del Trabajo Social"
                                    value={currentFile.comprobante_trabrajo_social?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.comprobante_trabrajo_social}
                                    helperText={errors?.comprobante_trabrajo_social?.message as string}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_pago_trabajo_social')}
                                    name="monto_pago_trabajo_social"
                                    label="Monto del Pago de Trabajo Social"
                                    value={formatDecimal(currentFile.monto_pago_trabajo_social)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_pago_ts')}
                                    type="date"
                                    name="fecha_pago_ts"
                                    label="Fecha de Pago de Trabajo Social"
                                    value={currentFile.fecha_pago_ts?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_pago_ts}
                                    helperText={errors?.fecha_pago_ts?.message as string}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('monto_aporte_familia')}
                                    name="monto_aporte_familia"
                                    label="Monto Aporte Familiar"
                                    value={formatDecimal(currentFile.monto_aporte_familia)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('comprobante_aporte', {
                                        maxLength: {
                                            value: limits.comprobante_aporte,
                                            message: `Límite de ${limits.comprobante_aporte} caracteres excedido`
                                        }
                                    })}
                                    name="comprobante_aporte"
                                    label="Comprobante del Aporte"
                                    value={currentFile.comprobante_aporte?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.comprobante_aporte}
                                    helperText={errors?.comprobante_aporte?.message as string}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('monto_aporte')}
                                    name="monto_aporte"
                                    label="Monto del Pago de Aporte"
                                    value={formatDecimal(currentFile.monto_aporte)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('monto_diferencia_aporte')}
                                    name="monto_diferencia_aporte"
                                    label="Monto de Diferencia de Aporte"
                                    value={formatDecimal(currentFile.monto_diferencia_aporte)}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_pago_aporte')}
                                    type="date"
                                    name="fecha_pago_aporte"
                                    label="Fecha de Pago Aporte"
                                    value={currentFile.fecha_pago_aporte?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_pago_aporte}
                                    helperText={errors?.fecha_pago_aporte?.message as string}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 5 && (

                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_creacion')}
                                    type="date"
                                    name="fecha_creacion"
                                    label="Fecha de Creacion"
                                    value={currentFile.fecha_creacion?.toString() || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.fecha_creacion}
                                    helperText={errors?.fecha_creacion?.message as string}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_aprobado')}
                                    type="date"
                                    name="fecha_aprobado"
                                    label="Fecha de aprobado"
                                    value={currentFile.fecha_aprobado ? new Date(currentFile.fecha_aprobado).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    error={!!errors.fecha_aprobado}
                                    helperText={errors?.fecha_aprobado?.message as string}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_entrega')}
                                    type="date"
                                    name="fecha_entrega"
                                    label="Fecha de Entrega"
                                    value={currentFile.fecha_entrega?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_entrega}
                                    helperText={errors?.fecha_entrega?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_devuelto')}
                                    type="date"
                                    name="fecha_devuelto"
                                    label="Fecha Devuelto"
                                    value={currentFile.fecha_devuelto?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_devuelto}
                                    helperText={errors?.fecha_devuelto?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_entrega_recuperado')}
                                    type="date"
                                    name="fecha_entrega_recuperado"
                                    label="Fecha de Entrega de Recuperado"
                                    value={currentFile.fecha_entrega_recuperado?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_entrega_recuperado}
                                    helperText={errors?.fecha_entrega_recuperado?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_reingreso')}
                                    type="date"
                                    name="fecha_reingreso"
                                    label="Fecha de Reingreso"
                                    value={currentFile.fecha_reingreso?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_reingreso}
                                    helperText={errors?.fecha_reingreso?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_299')}
                                    type="date"
                                    name="fecha_299"
                                    label="Fecha 299"
                                    value={currentFile.fecha_299?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_299}
                                    helperText={errors?.fecha_299?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_carta_agua_recibida')}
                                    type="date"
                                    name="fecha_carta_agua_recibida"
                                    label="Fecha de recibo de la Carta de Agua"
                                    value={currentFile.fecha_carta_agua_recibida?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_carta_agua_recibida}
                                    helperText={errors?.fecha_carta_agua_recibida?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_entrega_declaratoria')}
                                    type="date"
                                    name="fecha_entrega_declaratoria"
                                    label="Fecha de Entrega de la Declaratoria"
                                    value={currentFile.fecha_entrega_declaratoria?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_entrega_declaratoria}
                                    helperText={errors?.fecha_entrega_declaratoria?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_entregado_para_enviar')}
                                    type="date"
                                    name="fecha_entregado_para_enviar"
                                    label="Fecha de Entrega para Envio"
                                    value={currentFile.fecha_entregado_para_enviar?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_entregado_para_enviar}
                                    helperText={errors?.fecha_entregado_para_enviar?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_envio_docs_beneficiario')}
                                    type="date"
                                    name="fecha_envio_docs_beneficiario"
                                    label="Fecha de envio de Documentos del Beneficiario"
                                    value={currentFile.fecha_envio_docs_beneficiario?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_envio_docs_beneficiario}
                                    helperText={errors?.fecha_envio_docs_beneficiario?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_llegada_oficina')}
                                    type="date"
                                    name="fecha_llegada_oficina"
                                    label="Fecha de llegada a la Oficina"
                                    value={currentFile.fecha_llegada_oficina?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_llegada_oficina}
                                    helperText={errors?.fecha_llegada_oficina?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_permiso_ente')}
                                    type="date"
                                    name="fecha_permiso_ente"
                                    label="Fecha de permiso de la Entidad"
                                    value={currentFile.fecha_permiso_ente?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_permiso_ente}
                                    helperText={errors?.fecha_permiso_ente?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_formalizacion')}
                                    type="date"
                                    name="fecha_formalizacion"
                                    label="Fecha de Formalizacion"
                                    value={currentFile.fecha_formalizacion?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_formalizacion}
                                    helperText={errors?.fecha_formalizacion?.message as string}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    {...register('fecha_enviado_construir')}
                                    type="date"
                                    name="fecha_enviado_construir"
                                    label="Fecha de Envio para Construccion"
                                    value={currentFile.fecha_enviado_construir?.toString() || ''}
                                    onChange={handleInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={!!errors.fecha_enviado_construir}
                                    helperText={errors?.fecha_enviado_construir?.message as string}
                                />
                            </Grid>
                        </Grid>
                    )}
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
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenHistoryDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}
