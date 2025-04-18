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
                                value={newReferral.fecha_preparacion?.toString() || ''}
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
                                value={newReferral.fecha_envio?.toString() || ''}
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
                            <FormControl fullWidth error={!!errors.entidad_destino}>
                                <InputLabel id="entidad-label">Entidad Destinada</InputLabel>
                                <Select
                                    error={!!errors.entidad_destino}
                                    labelId="entidad-label"
                                    label="Entidad Destinada"
                                    {...register('entidad_destino', { required: 'Se necesita la Entidad' })}
                                    name="entidad_destino"
                                    value={newReferral.entidad_destino?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 230,
                                            },
                                        },
                                    }}
                                >
                                    {/* Bancos Públicos */}
                                    <MenuItem value="Banhvi">Banhvi</MenuItem>
                                    <MenuItem value="Banco Nacional de Costa Rica">Banco Nacional de Costa Rica</MenuItem>
                                    <MenuItem value="Banco de Costa Rica">Banco de Costa Rica</MenuItem>
                                    <MenuItem value="Banco Popular y de Desarrollo Comunal">Banco Popular y de Desarrollo Comunal</MenuItem>
                                    <MenuItem value="Banco Hipotecario de la Vivienda (BANHVI)">Banco Hipotecario de la Vivienda (BANHVI)</MenuItem>

                                    {/* Bancos Privados */}
                                    <MenuItem value="BAC Credomatic">BAC Credomatic</MenuItem>
                                    <MenuItem value="Banco Davivienda (Costa Rica)">Banco Davivienda (Costa Rica)</MenuItem>
                                    <MenuItem value="Scotiabank de Costa Rica">Scotiabank de Costa Rica</MenuItem>
                                    <MenuItem value="Banco Promerica de Costa Rica">Banco Promerica de Costa Rica</MenuItem>
                                    <MenuItem value="Banco CMB (Costa Rica)">Banco CMB (Costa Rica)</MenuItem>
                                    <MenuItem value="Banco Lafise">Banco Lafise</MenuItem>
                                    <MenuItem value="Banco BCT">Banco BCT</MenuItem>
                                    <MenuItem value="Banco Improsa">Banco Improsa</MenuItem>
                                    <MenuItem value="Banco General (Costa Rica)">Banco General (Costa Rica)</MenuItem>
                                    <MenuItem value="Banco Cathay de Costa Rica">Banco Cathay de Costa Rica</MenuItem>
                                    <MenuItem value="Prival Bank (Costa Rica)">Prival Bank (Costa Rica)</MenuItem>

                                    {/* Mutuales */}
                                    <MenuItem value="Grupo Mutual Alajuela">Grupo Mutual Alajuela</MenuItem>
                                    <MenuItem value="Mutual Cartago de Ahorro y Préstamo">Mutual Cartago de Ahorro y Préstamo</MenuItem>

                                    {/* Financieras No Bancarias */}
                                    <MenuItem value="Financiera Cafsa">Financiera Cafsa</MenuItem>
                                    <MenuItem value="Financiera Comeca">Financiera Comeca</MenuItem>
                                    <MenuItem value="Financiera Desyfin">Financiera Desyfin</MenuItem>
                                    <MenuItem value="Financiera Gente">Financiera Gente</MenuItem>
                                    <MenuItem value="Financiera Monge">Financiera Monge</MenuItem>

                                    {/* Cooperativas de Ahorro y Crédito */}
                                    <MenuItem value="Coocique R.L.">Coocique R.L.</MenuItem>
                                    <MenuItem value="Coopealianza R.L.">Coopealianza R.L.</MenuItem>
                                    <MenuItem value="Coopenae R.L.">Coopenae R.L.</MenuItem>
                                    <MenuItem value="Coopemep R.L.">Coopemep R.L.</MenuItem>
                                    <MenuItem value="Coopeservidores R.L.">Coopeservidores R.L.</MenuItem>

                                    {/* Entidades de Gobierno - Servicios Públicos */}
                                    <MenuItem value="Instituto Costarricense de Electricidad (ICE)">Instituto Costarricense de Electricidad (ICE)</MenuItem>
                                    <MenuItem value="Acueductos y Alcantarillados (AyA)">Acueductos y Alcantarillados (AyA)</MenuItem>
                                    <MenuItem value="Caja Costarricense de Seguro Social (CCSS)">Caja Costarricense de Seguro Social (CCSS)</MenuItem>
                                    <MenuItem value="Autoridad Reguladora de los Servicios Públicos (ARESEP)">Autoridad Reguladora de los Servicios Públicos (ARESEP)</MenuItem>
                                    <MenuItem value="Comisión Nacional de Prevención de Riesgos y Atención de Emergencias (CNE)">Comisión Nacional de Prevención de Riesgos y Atención de Emergencias (CNE)</MenuItem>
                                </Select>
                                {errors.entidad_destino && (
                                    <FormHelperText>{errors.entidad_destino.message as string}</FormHelperText>
                                )}
                            </FormControl>
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