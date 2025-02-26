import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { familyModel } from '../../../app/models/familyModel';

interface UpdateFamiilyMemberProps {
    member: familyModel;
    loadAccess: () => void;
}

export default function UpdateFamilyMember({ member, loadAccess }: UpdateFamiilyMemberProps) {
    const [currentMember, setCurrentMember] = useState<Partial<familyModel>>(member);

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (member) {
            setCurrentMember(member);
            console.log("currentDirection set:", member);
        } 
    }, [member]);

    const onSubmit = async (data: FieldValues) => {
        if (currentMember) {
            try {
                await api.family.updateMember(currentMember.idnucleo, data);
                toast.success('Miembro familiar actualizado con éxito.');
                loadAccess();
            } catch (error) {
              console.error(error);
              toast.error('Error al actualizar al miembro familiar.');
            }
        }
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
            <Box>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('cedula', { required: 'Se necesita la cedula' })}
                                name="cedula"
                                label="Cedula del miembro familiar"
                                value={currentMember.cedula?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('nombre_completo', { required: 'Se necesita el nombre completo' })}
                                name="nombre_completo"
                                label="Nombre completo del miembro familiar"
                                value={currentMember.nombre_completo?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
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
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="relacion-label">Relacion del miembro familiar</InputLabel>
                                    <Select
                                        labelId="relacion-label"
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
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('ingresos', { required: 'Se necesita los ingresos' })}
                                name="ingresos"
                                label="Ingresos del miembro familiar"
                                value={currentMember.ingresos?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', { required: 'Se necesita la observacion' })}
                                name="observaciones"
                                label="Observaciones"
                                value={currentMember.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                        <Button  variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                            Agregar
                        </Button>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}