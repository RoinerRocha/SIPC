import {
    Grid, Button, SelectChangeEvent, Card, Box,
    FormControl, InputLabel, MenuItem, Select,
    TextField, styled, FormHelperText
} from "@mui/material";
import { FieldValues, Form, useForm } from 'react-hook-form';
import { requirementsModel } from '../../app/models/requirementsModel';
import { BaseRequirementsModel } from '../../app/models/baseRequerimentsModel';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import api from "../../app/api/api";
import { t } from "i18next";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';
import Autocomplete from '@mui/material/Autocomplete';


interface Prop {
    idPersona: number;
    person: string;
    identificationPerson: string;
    loadAccess: () => void;
}

export default function RequirementRegister({ idPersona: idPersona, person: person, identificationPerson: identificationPerson, loadAccess: loadAccess }: Prop) {
    const { user } = useAppSelector(state => state.account);
    const [baseRequeriments, setBaseRequeriments] = useState<BaseRequirementsModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});
    const [newRequirement, setNewRequirement] = useState<Partial<requirementsModel>>({
        id_persona: idPersona,
        tipo_requisito: 0,
        estado: "",
        fecha_vigencia: new Date(),
        fecha_vencimiento: new Date(),
        observaciones: "",
        archivo: null,
    });

    const { register, handleSubmit, setError, reset, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [baseRequerimentsData, limitsData] = await Promise.all([
                    api.requirements.getAllBaseRequirements(),
                    api.requirements.getFieldLimits()
                ]);
                console.error(baseRequerimentsData);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (baseRequerimentsData && Array.isArray(baseRequerimentsData.data)) {
                    setBaseRequeriments(baseRequerimentsData.data);
                } else {
                    console.error("Base requirement data is not an array", baseRequerimentsData);
                }
                if (limitsData) setLimits(limitsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al obtener datos",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        };
        fetchData();
    }, []);


    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0]; // Convierte a YYYY-MM-DD
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            // data.fecha_vigencia = formatDate(new Date(data.fecha_vigencia));
            // data.fecha_vencimiento = formatDate(new Date(data.fecha_vencimiento));
            // console.log("Datos enviados al backend:", data); // Para verificar antes de enviarlo

            await api.requirements.saveRequirements(data);
            Swal.fire({
                icon: "success",
                title: "Nuevo requerimiento",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado un nuevo requerimiento",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            loadAccess();
            resetFormAfterSubmit();
        } catch (error) {
            console.error("Error en el registro de Requerimiento:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha generado un error al agregar el nuevo requerimiento",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const resetFormAfterSubmit = () => {
        const newId = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('generatedUserId2', newId);

        const resetData: Partial<requirementsModel> = {
            id_persona: idPersona, // si quieres que use newId, cambia a: parseInt(newId)
            tipo_requisito: 0,
            estado: "",
            fecha_vigencia: new Date(),
            fecha_vencimiento: new Date(),
            observaciones: "",
            archivo: null,
        };

        setNewRequirement(resetData);

        // También limpia los campos registrados por react-hook-form
        const resetDataForForm = {
            id_persona: idPersona.toString(),
            estado: "",
            fecha_vigencia: "",
            fecha_vencimiento: "",
            observaciones: ""
        };

        reset(resetDataForForm);
    };
    const handleFormSubmit = (data: FieldValues) => {
        const formData = new FormData();
        formData.append("id_persona", (idPersona?.toString() ?? ''));
        formData.append("tipo_requisito", (newRequirement.tipo_requisito?.toString() ?? ''));
        formData.append("estado", (newRequirement.estado?.toString() ?? ''));
        formData.append("fecha_vigencia", (newRequirement.fecha_vigencia?.toString() ?? ''));
        formData.append("fecha_vencimiento", (newRequirement.fecha_vencimiento?.toString() ?? ''));
        formData.append("observaciones", (newRequirement.observaciones?.toString() ?? ''));
        if (newRequirement.archivo) {
            formData.append("archivo", newRequirement.archivo);
        }
        onSubmit(formData);
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewRequirement((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof requirementsModel;
        const value = event.target.value;
        setNewRequirement((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChangeNumber = (event: SelectChangeEvent<number>) => {
        const { name, value } = event.target;
        setNewRequirement(prev => ({
            ...prev,
            [name]: Number(value), // Se asegura de convertirlo a número
        }));
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = event.target;
        if (files && files.length > 0) {
            setNewRequirement((prevAsset) => ({
                ...prevAsset,
                [name]: files[0],
            }));
        }
    };

    const VisuallyHiddenInput = styled("input")({
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: 1,
        overflow: "hidden",
        position: "absolute",
        bottom: 0,
        left: 0,
        whiteSpace: "nowrap",
        width: 1,
    });

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '70vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="register-requirement-form" onSubmit={handleSubmit(handleFormSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('id_persona', { required: 'Se necesita el id de la persona' })}
                                name="id_persona"
                                label="Id de la persona"
                                value={newRequirement.id_persona?.toString() || ''}
                                onChange={handleInputChange}
                                disabled

                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Nombre de la persona"
                                value={person}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Identificacion"
                                value={identificationPerson}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Autocomplete
                                disablePortal
                                fullWidth
                                options={baseRequeriments.map(req => ({
                                    label: req.requisito,
                                    id: req.id_requisito
                                }))}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={
                                    baseRequeriments
                                        .map(req => ({ label: req.requisito, id: req.id_requisito }))
                                        .find(opt => opt.id === newRequirement.tipo_requisito) || null
                                }
                                onChange={(event, newValue) => {
                                    setNewRequirement(prev => ({
                                        ...prev,
                                        tipo_requisito: newValue?.id || 0
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tipo requisito"
                                        error={!!errors.tipo_requisito}
                                        helperText={errors.tipo_requisito?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newRequirement.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                                    <MenuItem value="Cumplido">Cumplido</MenuItem>
                                    <MenuItem value="Degradado">Degradado</MenuItem>
                                </Select>
                                {errors.estado && (
                                    <FormHelperText>{errors.estado.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('fecha_vigencia', { required: 'Se necesita la fecha de vigencia' })}
                                type="date"
                                name="fecha_vigencia"
                                label="Fecha de Vigencia"
                                value={newRequirement.fecha_vigencia?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_vigencia}
                                helperText={errors?.fecha_vigencia?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('fecha_vencimiento', { required: 'Se necesita la fecha de vencimiento' })}
                                type="date"
                                name="fecha_vencimiento"
                                label="Fecha de Vencimiento"
                                value={newRequirement.fecha_vencimiento?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_vencimiento}
                                helperText={errors?.fecha_vencimiento?.message as string}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', {
                                    required: 'Se necesitan algunas observaciones',
                                    maxLength: {
                                        value: limits.observaciones, // fallback si no está disponible
                                        message: `Límite de ${limits.observaciones} caracteres excedido`
                                    }
                                })}
                                name="observaciones"
                                label="Observaciones"
                                value={newRequirement.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                                error={!!errors.observaciones}
                                helperText={errors?.observaciones?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button sx={{ textTransform: "none" }} variant="contained" component="label" fullWidth>
                                Agregar Archivo
                                <VisuallyHiddenInput
                                    type="file"
                                    name="archivo"
                                    onChange={handleFileInputChange}
                                />
                            </Button>
                            {newRequirement.archivo && <FormHelperText>{t('EditarLista-TituloArchivo')}: {newRequirement.archivo.name}</FormHelperText>}
                            {!!errors.archivo && (
                                <FormHelperText error>{errors?.archivo?.message as string}</FormHelperText>
                            )}
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}