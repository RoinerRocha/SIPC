import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { useEffect, useState } from 'react';
import { requirementsModel } from "../../app/models/requirementsModel";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


interface UpdateRequirementsProps {
    requirementsData: requirementsModel;
    loadAccess: () => void;
}

export default function UpdateRequirements({ requirementsData, loadAccess }: UpdateRequirementsProps) {
    const [currentRequirement, setCurrentRequirement] = useState<Partial<requirementsModel>>(requirementsData);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (requirementsData) {
            setCurrentRequirement(requirementsData);
            console.log(requirementsData.id_requisito);
        }
    }, [requirementsData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [limitsData] = await Promise.all([
                    api.requirements.getFieldLimits()
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
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
        if (!currentRequirement) return;
    
        const result = await Swal.fire({
            title: '¿Desea actualizar este requerimiento?',
            text: 'Se guardarán los cambios realizados.',
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
                data.fecha_pago = formatDate(new Date(data.fecha_vigencia));
                data.fecha_presentacion = formatDate(new Date(data.fecha_vencimiento));
                await api.requirements.updateRequirement(Number(currentRequirement.id_requisito), data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Requerimiento actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el Requerimiento:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el requerimiento.',
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
        // Si se presiona "Cancelar", no se ejecuta ninguna acción.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentRequirement((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentRequirement((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="update-requirement-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('id_persona', { required: 'Se necesita el id de la persona' })}
                                name="id_persona"
                                label="Id de la persona"
                                value={currentRequirement.id_persona?.toString() || ''}
                                onChange={handleInputChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el comprobante' })}
                                    name="estado"
                                    value={currentRequirement.estado?.toString() || ''}
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
                                value={currentRequirement.fecha_vigencia?.toString() || ''}
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
                                value={currentRequirement.fecha_vencimiento?.toString() || ''}
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
                                {...register('observaciones', { required: 'Se necesitan algunas observaciones', 
                                    maxLength: {
                                        value: limits.observaciones, // fallback si no está disponible
                                        message: `Límite de ${limits.observaciones} caracteres excedido`
                                    }
                                 })}
                                name="observaciones"
                                label="Observaciones"
                                value={currentRequirement.observaciones?.toString() || ''}
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
                    </Grid>
                </form>
            </Box>
        </Card>
    )

}
