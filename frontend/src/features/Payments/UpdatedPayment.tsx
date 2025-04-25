import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { useEffect, useState } from 'react';
import { paymentsModel } from "../../app/models/paymentsModel";
import { statesModels } from '../../app/models/states';
import '../../sweetStyles.css';
import Swal from 'sweetalert2';

interface UpdatePaymentsProps {
    PaymentsData: paymentsModel;
    loadAccess: () => void;
}

export default function UpdatePayment({ PaymentsData, loadAccess }: UpdatePaymentsProps) {
    const navigate = useNavigate();
    const [currentPayment, setCurrentPayment] = useState<Partial<paymentsModel>>(PaymentsData);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [limitsData] = await Promise.all([
                    api.payments.getFieldLimits()
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
        if (!currentPayment) return;

        const result = await Swal.fire({
            title: '¿Desea actualizar este pago?',
            text: 'Se guardarán los cambios realizados en el pago.',
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
                await api.payments.updatePayments(Number(currentPayment.id_pago), data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Pago actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el pago:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el pago.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Actualización cancelada',
                text: 'No se realizaron cambios en el pago.',
                showConfirmButton: false,
                timer: 2000
            });
        }
        // Si el usuario presiona "Cancelar", no se realiza ninguna acción.
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
                <form id="update-payments-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    label="Estado"
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
                                {...register('observaciones', {
                                    required: 'Se necesita la nueva observacion',
                                    maxLength: {
                                        value: limits.observaciones, // fallback si no está disponible
                                        message: `Límite de ${limits.observaciones} caracteres excedido`
                                    }
                                })}
                                name="observaciones"
                                label="Observaciones"
                                value={currentPayment.observaciones?.toString() || ''}
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
