import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { useEffect, useState } from 'react';
import { referralsModel } from "../../app/models/referralsModel";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';
import Autocomplete from '@mui/material/Autocomplete';

interface UpdateReferralsProps {
    ReferralsData: referralsModel;
    loadAccess: () => void;
}

export default function UpdatedReferral({ ReferralsData, loadAccess }: UpdateReferralsProps) {
    const [currentReferral, setCurrentReferral] = useState<Partial<referralsModel>>(ReferralsData);

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (ReferralsData) {
            setCurrentReferral(ReferralsData);
            console.log(ReferralsData.id_remision);
        }
    }, [ReferralsData]);

    const entidades = [
        "Banhvi", "Banco Nacional de Costa Rica", "Banco de Costa Rica",
        "Banco Popular y de Desarrollo Comunal", "Banco Hipotecario de la Vivienda (BANHVI)",
        "BAC Credomatic", "Banco Davivienda (Costa Rica)", "Scotiabank de Costa Rica",
        "Banco Promerica de Costa Rica", "Banco CMB (Costa Rica)", "Banco Lafise",
        "Banco BCT", "Banco Improsa", "Banco General (Costa Rica)", "Banco Cathay de Costa Rica",
        "Prival Bank (Costa Rica)", "Grupo Mutual Alajuela", "Mutual Cartago de Ahorro y Préstamo",
        "Financiera Cafsa", "Financiera Comeca", "Financiera Desyfin", "Financiera Gente",
        "Financiera Monge", "Coocique R.L.", "Coopealianza R.L.", "Coopenae R.L.",
        "Coopemep R.L.", "Coopeservidores R.L.", "Instituto Costarricense de Electricidad (ICE)",
        "Acueductos y Alcantarillados (AyA)", "Caja Costarricense de Seguro Social (CCSS)",
        "Autoridad Reguladora de los Servicios Públicos (ARESEP)",
        "Comisión Nacional de Prevención de Riesgos y Atención de Emergencias (CNE)"
    ];

    const onSubmit = async (data: FieldValues) => {
        if (!currentReferral) return;

        const result = await Swal.fire({
            title: '¿Desea actualizar esta remisión?',
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
                await api.referrals.updateReferrals(Number(currentReferral.id_remision), data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Remisión actualizada con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar la remisión:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar la remisión.',
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
        // Si se presiona "Cancelar", simplemente se cierra el modal sin acción.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentReferral((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentReferral((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="update-referral-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={currentReferral.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                    <MenuItem value="Procesado">Procesado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                fullWidth
                                disablePortal
                                options={entidades}
                                value={currentReferral.entidad_destino || ''}
                                onChange={(event, newValue) => {
                                    setCurrentReferral(prev => ({
                                        ...prev,
                                        entidad_destino: newValue || ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Entidad Destinada"
                                        {...register('entidad_destino', { required: 'Se necesita la Entidad' })}
                                        name="entidad_destino"
                                        error={!!errors.entidad_destino}
                                        helperText={errors.entidad_destino?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}
