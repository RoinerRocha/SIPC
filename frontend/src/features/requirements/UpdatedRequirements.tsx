import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { requirementsModel } from "../../app/models/requirementsModel";

interface UpdateRequirementsProps {
    requirementsData: requirementsModel;
    loadAccess: () => void;
}

export default function UpdateRequirements({ requirementsData, loadAccess }: UpdateRequirementsProps) {
    const [currentRequirement, setCurrentRequirement] = useState<Partial<requirementsModel>>(requirementsData);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (requirementsData) {
            setCurrentRequirement(requirementsData);
            console.log(requirementsData.id_requisito);
        }
    }, [requirementsData]);

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0]; // Convierte a YYYY-MM-DD
    };


    const onSubmit = async (data: FieldValues) => {
        if (currentRequirement) {
            try {
                data.fecha_pago = formatDate(new Date(data.fecha_vigencia));
                data.fecha_presentacion = formatDate(new Date(data.fecha_vencimiento));
                await api.requirements.updateRequirement(Number(currentRequirement.id_requisito), data);
                toast.success('Requerimiento actualizado con éxito.');
                loadAccess();
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar el Requerimiento.');
            }
        }
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
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
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
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
                            />
                        </Grid>
                        <Grid item xs={6}>
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
                                value={currentRequirement.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
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
