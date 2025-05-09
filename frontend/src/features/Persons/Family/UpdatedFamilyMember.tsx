import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { useEffect, useState } from 'react';
import { familyModel } from '../../../app/models/familyModel';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface UpdateFamiilyMemberProps {
    member: familyModel;
    loadAccess: () => void;
}

export default function UpdateFamilyMember({ member, loadAccess }: UpdateFamiilyMemberProps) {
    const [currentMember, setCurrentMember] = useState<Partial<familyModel>>(member);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (member) {
            setCurrentMember(member);
            console.log("currentDirection set:", member);
        } 
    }, [member]);

    useEffect(() => {
            const fetchData = async () => {
                try {
                    const [limitsData] = await Promise.all([
                        api.family.getFieldLimits()
                    ]);
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

    const onSubmit = async (data: FieldValues) => {
        if (!currentMember) return;
    
        const result = await Swal.fire({
            title: '¿Desea actualizar este miembro del núcleo familiar?',
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
                await api.family.updateMember(currentMember.idnucleo, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Miembro familiar actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el miembro familiar:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el miembro familiar.',
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
        // Si se presiona "Cancelar", simplemente se cierra el modal sin hacer nada.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentMember((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentMember((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="update-family-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('cedula', { required: 'Se necesita la cedula',  maxLength: {
                                    value: limits.cedula, // fallback si no está disponible
                                    message: `Límite de ${limits.cedula} caracteres excedido`
                                } })}
                                name="cedula"
                                label="Cedula del miembro familiar"
                                value={currentMember.cedula?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.cedula}
                                helperText={errors?.cedula?.message as string}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('nombre_completo', { required: 'Se necesita el nombre completo',  maxLength: {
                                    value: limits.nombre_completo, // fallback si no está disponible
                                    message: `Límite de ${limits.nombre_completo} caracteres excedido`
                                } })}
                                name="nombre_completo"
                                label="Nombre completo del miembro familiar"
                                value={currentMember.nombre_completo?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.nombre_completo}
                                helperText={errors?.nombre_completo?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_nacimiento', { required: 'Se necesita la fecha de nacimiento' })}
                                type="date"
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                                value={currentMember.fecha_nacimiento?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_nacimiento}
                                helperText={errors?.fecha_nacimiento?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="relacion-label">Relacion del miembro familiar</InputLabel>
                                    <Select
                                        labelId="relacion-label"
                                        label="Relacion del miembro familiar"
                                        {...register('relacion', { required: 'Se necesita la relacion del miembro familiar' })}
                                        name="relacion"
                                        value={currentMember.relacion?.toString() || ''}
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
                                        <MenuItem value="Padre">Padre</MenuItem>
                                        <MenuItem value="Madre">Madre</MenuItem>
                                        <MenuItem value="Hermano(a)">Hermano(a)</MenuItem>
                                        <MenuItem value="Abuelo(a)">Abuelo(a)</MenuItem>
                                        <MenuItem value="Tio(a)">Tio(a)</MenuItem>
                                        <MenuItem value="Primo(a)">Primo(a)</MenuItem>
                                        <MenuItem value="Sobrino(a)">Sobrino(a)</MenuItem>
                                        <MenuItem value="Esposo(a)">Esposo(a)</MenuItem>
                                        <MenuItem value="Hijo(a)">Hijo(a)</MenuItem>
                                        <MenuItem value="Suegro(a)">Suegro(a)</MenuItem>
                                        <MenuItem value="Yerno">Yerno</MenuItem>
                                        <MenuItem value="Nuera">Nuera</MenuItem>
                                        <MenuItem value="Cuñado(a)">Nuera(a)</MenuItem>
                                    </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('ingresos', { required: 'Se necesita los ingresos' })}
                                name="ingresos"
                                label="Ingresos del miembro familiar"
                                value={currentMember.ingresos?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.ingresos}
                                helperText={errors?.ingresos?.message as string}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', { required: 'Se necesita la observacion', maxLength: {
                                    value: limits.observaciones, // fallback si no está disponible
                                    message: `Límite de ${limits.observaciones} caracteres excedido`
                                } })}
                                name="observaciones"
                                label="Observaciones"
                                value={currentMember.observaciones?.toString() || ''}
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