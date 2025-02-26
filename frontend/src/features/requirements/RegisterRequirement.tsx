import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent,
    Card,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    styled,
    FormHelperText
} from "@mui/material";
import { FieldValues, Form, useForm } from 'react-hook-form';
import { requirementsModel } from '../../app/models/requirementsModel';
import { BaseRequirementsModel } from '../../app/models/baseRequerimentsModel';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../app/api/api";
import { t } from "i18next";

interface Prop {
    idPersona: number;
    person: string;
    identificationPerson: string;
    loadAccess: () => void;
}

export default function RequirementRegister({ idPersona: idPersona, person: person, identificationPerson: identificationPerson, loadAccess:loadAccess }: Prop) {
    const { user } = useAppSelector(state => state.account);
    const [baseRequeriments, setBaseRequeriments] = useState<BaseRequirementsModel[]>([]);
    const [newRequirement, setNewRequirement] = useState<Partial<requirementsModel>>({
        id_persona: idPersona,
        tipo_requisito: 0,
        estado: "",
        fecha_vigencia: new Date(),
        fecha_vencimiento: new Date(),
        observaciones: "",
        archivo: null,
    });

    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [baseRequerimentsData] = await Promise.all([
                    api.requirements.getAllBaseRequirements(),
                ]);
                console.error(baseRequerimentsData);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (baseRequerimentsData && Array.isArray(baseRequerimentsData.data)) {
                    setBaseRequeriments(baseRequerimentsData.data);
                } else {
                    console.error("Base requirement data is not an array", baseRequerimentsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("error");
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
            toast.success("Requerimiento registrado correctamente");
            loadAccess();
        } catch (error) {
            console.error("Error en el registro de Requerimiento:", error);
            toast.error("Error al registrar el Requerimiento");
        }
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
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Nombre de la persona"
                                value={person}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Identificacion"
                                value={identificationPerson}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="usuario-label">Tipo requisito</InputLabel>
                                <Select
                                    labelId="usuario-label"
                                    {...register('tipo_requisito', { required: 'Se necesita el usuario' })}
                                    name="tipo_requisito"
                                    value={newRequirement.tipo_requisito}
                                    onChange={handleSelectChangeNumber}
                                    label="Seleccionar Tipo de registro"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}

                                >
                                    {Array.isArray(baseRequeriments) && baseRequeriments.map((user) => (
                                        <MenuItem key={user.id_requisito} value={user.id_requisito}>
                                            {user.requisito}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el comprobante' })}
                                    name="estado"
                                    value={newRequirement.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                                    <MenuItem value="Cumplido">Cumplido</MenuItem>
                                    <MenuItem value="Degradado">Degradado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
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
                            />
                        </Grid>
                        <Grid item xs={6}>
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
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', { required: 'Se necesitan algunas observaciones' })}
                                name="observaciones"
                                label="Observaciones"
                                value={newRequirement.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" component="label" fullWidth>
                                Agregar Archivo
                                <VisuallyHiddenInput
                                    type="file"
                                    name="archivo"
                                    onChange={handleFileInputChange}
                                />
                            </Button>
                            {newRequirement.archivo && <FormHelperText>{t('EditarLista-TituloArchivo')}: {newRequirement.archivo.name}</FormHelperText>}
                        </Grid>
                        <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                            Agregar
                        </Button>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}