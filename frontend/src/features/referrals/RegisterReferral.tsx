import {
    Grid, SelectChangeEvent,
    Card, Box, FormControl, InputLabel, MenuItem, Select, TextField,
    FormHelperText
} from "@mui/material";

import { FieldValues, Form, useForm } from 'react-hook-form';
import { useState, useEffect } from "react";
import { referralsModel } from "../../app/models/referralsModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import api from "../../app/api/api";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';
import Autocomplete from '@mui/material/Autocomplete';

interface LoadReferralsProps {
    loadAccess: () => void;
}

export default function ReferralRegister({ loadAccess }: LoadReferralsProps) {
    const { user } = useAppSelector(state => state.account);
    const [newReferral, setNewReferral] = useState<Partial<referralsModel>>({
        fecha_preparacion: new Date(),
        fecha_envio: new Date(),
        usuario_prepara: user?.correo_electronico,
        entidad_destino: "",
        estado: "",
    });

    const entidades = [
        "Banhvi", "Banco Nacional de Costa Rica", "Banco de Costa Rica",
        "Banco Popular y de Desarrollo Comunal", "Banco Hipotecario de la Vivienda (BANHVI)",
        "BAC Credomatic", "Banco Davivienda (Costa Rica)", "Scotiabank de Costa Rica",
        "Banco Promerica de Costa Rica", "Banco CMB (Costa Rica)", "Banco Lafise",
        "Banco BCT", "Banco Improsa", "Banco General (Costa Rica)", "Banco Cathay de Costa Rica",
        "Prival Bank (Costa Rica)", "Grupo Mutual Alajuela", "Mutual Cartago de Ahorro y Préstamo",
        "Financiera Cafsa", "Financiera Comeca", "Financiera Desyfin", "Financiera Gente",
        "Financiera Monge", "Coocique R.L.", "Coopealianza R.L.", "Coopenae R.L.",
        "Coopemep R.L.", "Coopeservidores R.L.",
        "Instituto Costarricense de Electricidad (ICE)", "Acueductos y Alcantarillados (AyA)",
        "Caja Costarricense de Seguro Social (CCSS)", "Autoridad Reguladora de los Servicios Públicos (ARESEP)",
        "Comisión Nacional de Prevención de Riesgos y Atención de Emergencias (CNE)"
    ].map(nombre => ({ label: nombre, id: nombre }));

    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0]; // Convierte a YYYY-MM-DD
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            // Formateamos las fechas antes de enviarlas
            data.fecha_preparacion = formatDate(new Date(data.fecha_preparacion));
            data.fecha_envio = formatDate(new Date(data.fecha_envio));

            console.log("Datos enviados al backend:", data); // Para verificar antes de enviarlo

            await api.referrals.saveReferrals(data);
            Swal.fire({
                icon: "success",
                title: "Nueva remision",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado una nueva remision",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            loadAccess();
        } catch (error) {
            console.error("Error en el registro de Remision:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha generado un error al agregar la remision",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewReferral((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof referralsModel;
        const value = event.target.value;
        setNewReferral((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="register-referral-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_preparacion', { required: 'Se necesita la fecha de preparacion' })}
                                type="date"
                                name="fecha_preparacion"
                                label="Fecha de Preparacion"
                                value={
                                    newReferral.fecha_preparacion
                                        ? new Date(newReferral.fecha_preparacion).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_preparacion}
                                helperText={errors?.fecha_preparacion?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_envio', { required: 'Se necesita la fecha de envio' })}
                                type="date"
                                name="fecha_envio"
                                label="Fecha de Envio"
                                value={
                                    newReferral.fecha_envio
                                        ? new Date(newReferral.fecha_envio).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_envio}
                                helperText={errors?.fecha_envio?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newReferral.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                    <MenuItem value="Procesado">Procesado</MenuItem>
                                </Select>
                                {errors.estado && (
                                    <FormHelperText>{errors.estado.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                fullWidth
                                disablePortal
                                options={entidades}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={
                                    entidades.find(e => e.id === newReferral.entidad_destino) || null
                                }
                                onChange={(event, newValue) => {
                                    setNewReferral(prev => ({
                                        ...prev,
                                        entidad_destino: newValue?.id || ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Entidad Destinada"
                                        error={!!errors.entidad_destino}
                                        helperText={errors.entidad_destino?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('usuario_prepara', { required: 'Se necesita la fecha de envio' })}
                                label="Correo del usuario"
                                value={user?.correo_electronico}
                                disabled
                            />
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}