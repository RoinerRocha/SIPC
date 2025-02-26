import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { paymentsModel } from "../../app/models/paymentsModel";
import { statesModels } from '../../app/models/states';

interface UpdatePaymentsProps {
    PaymentsData: paymentsModel;
    loadAccess: () => void;
}

export default function UpdatePayment({ PaymentsData, loadAccess }: UpdatePaymentsProps) {
    const navigate = useNavigate();
    const [currentPayment, setCurrentPayment] = useState<Partial<paymentsModel>>(PaymentsData);
    const [state, setState] = useState<statesModels[]>([]);
    console.log(PaymentsData);

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (PaymentsData) {
            setCurrentPayment(PaymentsData);
            console.log(PaymentsData.id_pago);
        }
    }, [PaymentsData]);

    const onSubmit = async (data: FieldValues) => {
        if (currentPayment) {
            try {
                await api.payments.updatePayments(Number(currentPayment.id_pago), data);
                toast.success('Pago actualizado con éxito.');
                loadAccess();
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar el pago.');
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentPayment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentPayment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el tipo de estado' })}
                                    name="estado"
                                    value={currentPayment.estado?.toString() || ''}
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
                                    <MenuItem value="Realizado">Realizado</MenuItem>
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                </Select>
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
                                value={currentPayment.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Button  variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                        Actualizar
                    </Button>
                </form>
            </Box>
        </Card>
    )


}
