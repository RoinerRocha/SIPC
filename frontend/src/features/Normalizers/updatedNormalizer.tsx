import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { useEffect, useState } from 'react';
import { normalizerModel } from "../../app/models/normalizerModel";
import { entityModel } from "../../app/models/EntityModel";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


interface UpdateNormalizerProps {
    NormalizerData: normalizerModel;
    loadAccess: () => void;
}

export default function UpdatedNormalizer({ NormalizerData, loadAccess }: UpdateNormalizerProps) {
    const [currentNormalizer, setCurrentNormalizer] = useState<Partial<normalizerModel>>(NormalizerData);
    const [entity, setEntity] = useState<entityModel[]>([]);

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (NormalizerData) {
            setCurrentNormalizer(NormalizerData);
            console.log(NormalizerData);
        }
    }, [NormalizerData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entityData] = await Promise.all([
                    api.SubStateFiles.getAllEntity(),
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (entityData && Array.isArray(entityData.data)) {
                    setEntity(entityData.data);
                } else {
                    console.error("entity data is not an array", entityData);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al obtener entidades",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: FieldValues) => {
        if (!currentNormalizer) return;
    
        const result = await Swal.fire({
            title: '¿Desea actualizar este normalizador?',
            text: 'Se guardarán los cambios realizados.',
            icon: 'question',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, actualizar',
            denyButtonText: 'No actualizar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
    
        if (result.isConfirmed) {
            try {
                await api.normalizers.updateNormalizers(Number(currentNormalizer.id), data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Normalizador actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el normalizador:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el normalizador.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Actualización cancelada',
                text: 'No se realizaron cambios.',
                showConfirmButton: false,
                timer: 2000
            });
        }
        // Si se presiona "Cancelar", simplemente se cierra el modal sin realizar acción.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentNormalizer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentNormalizer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="update-normalizer-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('nombre', { required: 'Se necesita el nombre' })}
                                name="nombre"
                                label="Nombre"
                                value={currentNormalizer.nombre?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.nombre}
                                helperText={errors?.nombre?.message as string}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Tipo</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    label="Tipo"
                                    {...register('tipo', { required: 'Se necesita el tipo' })}
                                    name="tipo"
                                    value={currentNormalizer.tipo?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="INGENIEROS">Ingenieros</MenuItem>
                                    <MenuItem value="FISCALES">Fiscales</MenuItem>
                                    <MenuItem value="ABOGADOS">Abogados</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={5}>
                            <FormControl fullWidth>
                                <InputLabel id="empresa-label">Empresa</InputLabel>
                                <Select
                                    labelId="empresa-label"
                                    label="Empresa"
                                    {...register('empresa', { required: 'Se necesita la empresa' })}
                                    name="empresa"
                                    value={currentNormalizer.empresa || ""}
                                    onChange={handleSelectChange}
                                >
                                    {entity.map(entity => (
                                        <MenuItem key={entity.id} value={entity.nombre}>
                                            {entity.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={currentNormalizer.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="ACTIVO">Activo</MenuItem>
                                    <MenuItem value="INACTIVO">Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro', { required: 'Se necesita la fecha de registro' })}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={currentNormalizer.fecha_registro?.toString() || ''}
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
