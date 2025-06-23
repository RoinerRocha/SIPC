import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent,
    Card, Box, FormControl, InputLabel, MenuItem, Select, TextField,
    FormHelperText
} from "@mui/material";
import { FieldValues, Form, useForm } from 'react-hook-form';
import { useState, useEffect } from "react";
import { normalizerModel } from "../../app/models/normalizerModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { entityModel } from "../../app/models/EntityModel";
import api from "../../app/api/api";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


interface LoadNormalizerProps {
    loadAccess: () => void;
}

export default function RegisterNormalizer({ loadAccess }: LoadNormalizerProps) {
    const { user } = useAppSelector(state => state.account);
    const [entity, setEntity] = useState<entityModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});
    const [newNormalizer, setNewNormalizer] = useState<Partial<normalizerModel>>({
        nombre: "",
        tipo: "",
        empresa: "",
        estado: "Activo",
        fecha_registro: new Date(),
    });

    const { register, handleSubmit, setError, reset, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entityData, limitsData] = await Promise.all([
                    api.SubStateFiles.getAllEntity(),
                    api.normalizers.getFieldLimits()
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (entityData && Array.isArray(entityData.data)) {
                    setEntity(entityData.data);
                } else {
                    console.error("entity data is not an array", entityData);
                }
                if (limitsData) setLimits(limitsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al cargar datos",
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

    const resetFormAfterSubmit = () => {
        const resetData: Partial<normalizerModel> = {
            nombre: "",
            tipo: "",
            empresa: "",
            estado: "Activo",
            fecha_registro:  new Date(),
        };

        setNewNormalizer(resetData);

        reset({
            nombre: "",
            tipo: "",
            empresa: "",
            estado: "Activo",
            fecha_registro:  new Date(),
        });
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            // Formateamos las fechas antes de enviarlas
            data.fecha_registro = formatDate(new Date(data.fecha_registro));

            console.log("Datos enviados al backend:", data); // Para verificar antes de enviarlo

            await api.normalizers.saveNormalizer(data);
            Swal.fire({
                icon: "success",
                title: "Nuevo normalizador",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado al normalizador",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            loadAccess();
            resetFormAfterSubmit();
        } catch (error) {
            console.error("Error en el registro de Normalizacion:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha generado un error al normalizador",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewNormalizer((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof normalizerModel;
        const value = event.target.value;
        setNewNormalizer((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="register-normalizer-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('nombre', {
                                    required: 'Se necesita el nombre',
                                    maxLength: {
                                        value: limits.nombre, // fallback si no está disponible
                                        message: `Límite de ${limits.nombre} caracteres excedido`
                                    }
                                })}
                                name="nombre"
                                label="Nombre"
                                value={newNormalizer.nombre?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.nombre}
                                helperText={errors?.nombre?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.tipo}>
                                <InputLabel id="tipo-label">Tipo</InputLabel>
                                <Select
                                    error={!!errors.tipo}
                                    labelId="tipo-label"
                                    label="Tipo"
                                    {...register('tipo', { required: 'Se necesita el tipo' })}
                                    name="tipo"
                                    value={newNormalizer.tipo?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="INGENIEROS">Ingenieros</MenuItem>
                                    <MenuItem value="FISCALES">Fiscales</MenuItem>
                                    <MenuItem value="ABOGADOS">Abogados</MenuItem>
                                    <MenuItem value="ANALISTA DE CONSTRUCTORA">Analista de Constructora</MenuItem>
                                    <MenuItem value="ANALISTA DE ENTIDAD">Analista de Entidad</MenuItem>
                                </Select>
                                {errors.tipo && (
                                    <FormHelperText>{errors.tipo.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.empresa}>
                                <InputLabel id="empresa-label">Empresa</InputLabel>
                                <Select
                                    error={!!errors.empresa}
                                    labelId="empresa-label"
                                    label="Empresa"
                                    {...register('empresa', { required: 'Se necesita la empresa' })}
                                    name="empresa"
                                    value={newNormalizer.empresa || ""}
                                    onChange={handleSelectChange}
                                >
                                    {entity.map(entity => (
                                        <MenuItem key={entity.id} value={entity.nombre}>
                                            {entity.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.empresa && (
                                    <FormHelperText>{errors.empresa.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newNormalizer.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="ACTIVO">Activo</MenuItem>
                                    <MenuItem value="INACTIVO">Inactivo</MenuItem>
                                </Select>
                                {errors.estado && (
                                    <FormHelperText>{errors.estado.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro', { required: 'Se necesita la fecha de registro' })}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={
                                    newNormalizer.fecha_registro
                                        ? new Date(newNormalizer.fecha_registro).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_registro}
                                helperText={errors?.fecha_registro?.message as string}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )

}