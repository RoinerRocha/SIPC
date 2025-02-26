import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent,
    Card,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    FormHelperText,
    styled
} from "@mui/material";

import { FieldValues, Form, useForm } from 'react-hook-form';
import { paymentsModel } from "../../app/models/paymentsModel";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { personModel } from "../../app/models/persons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../app/api/api";
import { t } from "i18next";

interface Prop {
    idPersona: number;
    person: string;
    identificationPerson: string;
    loadAccess: () => void;
}

export default function PaymentRegister({ idPersona: idPersona, person: person, identificationPerson: identificationPerson, loadAccess: loadAccess }: Prop) {
    const { user } = useAppSelector(state => state.account);
    const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
    const [newPayment, setNewPayment] = useState<Partial<paymentsModel>>({
        id_persona: idPersona,
        identificacion: identificationPerson,
        comprobante: "",
        tipo_pago: "",
        fecha_pago: new Date(),
        fecha_presentacion: new Date(),
        estado: "",
        monto: 0,
        moneda: "",
        usuario: user?.nombre_usuario,
        observaciones: "",
        archivo: null,
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
            // data.fecha_pago = formatDate(new Date(data.fecha_pago));
            // data.fecha_presentacion = formatDate(new Date(data.fecha_presentacion));

            console.log("Datos enviados al backend:", data); // Para verificar antes de enviarlo

            await api.payments.savePayments(data);
            toast.success("Pago registrado correctamente");
            loadAccess();
        } catch (error) {
            console.error("Error en el registro de pago:", error);
            toast.error("Error al registrar el pago");
        }
    };

    const handleFormSubmit = (data: FieldValues) => {
        const formData = new FormData();
        formData.append("id_persona", (newPayment.id_persona?.toString() ?? ''));
        formData.append("identificacion", (identificationPerson?.toString() ?? ''));
        formData.append("comprobante", (newPayment.comprobante?.toString() ?? ''));
        formData.append("tipo_pago", (newPayment.tipo_pago?.toString() ?? ''));
        formData.append("fecha_pago", (newPayment.fecha_pago?.toString() ?? ''));
        formData.append("fecha_presentacion", (newPayment.fecha_presentacion?.toString() ?? ''));
        formData.append("estado", (newPayment.estado?.toString() ?? ''));
        formData.append("monto", (newPayment.monto?.toString() ?? ''));
        formData.append("moneda", (newPayment.moneda?.toString() ?? ''));
        formData.append("usuario", (user?.nombre_usuario || ""));
        formData.append("observaciones", (newPayment.observaciones?.toString() ?? ''));
        if (newPayment.archivo) {
            formData.append("archivo", newPayment.archivo);
        }
        formData.append("tipo_movimiento", (newPayment.tipo_movimiento?.toString() ?? ''));

        onSubmit(formData);

    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewPayment((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof paymentsModel;
        const value = event.target.value;

        setNewPayment((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));

        // Cambiar los tipos de pagos según el tipo de movimiento
        if (name === "tipo_movimiento") {
            if (value === "PAGO") {
                setPaymentTypes([
                    "PAGO_HONORARIOS",
                    "PAGO_POLIZA",
                    "PAGO_FISCALIZACION",
                    "PAGO_TRABAJO_SOCIAL",
                    "PAGO_ESTUDIO_SOCIAL",
                    "PAGO_GASTOS_FORMALIZACION",
                    "PAGO_APORTE_FAMILIA"
                ]);
            } else if (value === "DEPOSITO") {
                setPaymentTypes([
                    "DEPOSITO_GASTO_FORMALIZACION",
                    "DEPOSITO_APORTE_CONSTRUCCION"
                ]);
            } else {
                setPaymentTypes([]); // Si se borra el tipo de movimiento
            }
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = event.target;
        if (files && files.length > 0) {
            setNewPayment((prevAsset) => ({
                ...prevAsset,
                [name]: files[0],
            }));
        }
    };

    const VisuallyHiddenInput = styled("input")({
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: 1,
        overflow: "hidden",
        position: "absolute",
        bottom: 0,
        left: 0,
        whiteSpace: "nowrap",
        width: 1,
    });

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '65vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('id_persona', { required: 'Se necesita el id de la persona' })}
                                name="id_persona"
                                label="Id de la persona"
                                value={newPayment.id_persona?.toString() || ''}
                                onChange={handleInputChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Nombre de la persona"
                                value={person}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('identificacion', { required: 'Se necesita el id de la persona' })}
                                name="identificacion"
                                label="Identificacion"
                                value={newPayment.identificacion?.toString() || ''}
                                onChange={handleInputChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('comprobante', { required: 'Se necesita el comprobante' })}
                                name="comprobante"
                                label="Comprobante"
                                value={newPayment.comprobante?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo_movimiento-label">Tipo de Movimiento</InputLabel>
                                <Select
                                    labelId="tipo_movimiento-label"
                                    {...register('tipo_movimiento', { required: 'Se necesita el comprobante' })}
                                    name="tipo_movimiento"
                                    value={newPayment.tipo_movimiento?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="PAGO">Pago</MenuItem>
                                    <MenuItem value="DEPOSITO">Deposito</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo_pago-label">Tipo de Pago</InputLabel>
                                <Select
                                    labelId="tipo_pago-label"
                                    {...register('tipo_pago', { required: 'Se necesita el comprobante' })}
                                    name="tipo_pago"
                                    value={newPayment.tipo_pago?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    disabled={!newPayment.tipo_movimiento} // Deshabilita el select si no hay tipo de movimiento seleccionado
                                >
                                    {paymentTypes.map((paymentType) => (
                                        <MenuItem key={paymentType} value={paymentType}>
                                            {paymentType.replace(/_/g, ' ')} {/* Formatea el texto con espacios */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('fecha_pago', { required: 'Se necesita la fecha de pago' })}
                                type="date"
                                name="fecha_pago"
                                label="Fecha de pago"
                                value={newPayment.fecha_pago?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('fecha_presentacion', { required: 'Se necesita la fecha de nacimiento' })}
                                type="date"
                                name="fecha_presentacion"
                                label="Fecha de presentacion"
                                value={newPayment.fecha_presentacion?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el comprobante' })}
                                    name="estado"
                                    value={newPayment.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Realizado">Realizado</MenuItem>
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('monto', { required: 'Se necesita el tipo de moneda' })}
                                name="monto"
                                label="Monto"
                                value={newPayment.monto?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="moneda-label">Moneda</InputLabel>
                                <Select
                                    labelId="moneda-label"
                                    {...register('moneda', { required: 'Se necesita el comprobante' })}
                                    name="moneda"
                                    value={newPayment.moneda?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Dolares">Dolares</MenuItem>
                                    <MenuItem value="Colones">Colones</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('usuario', { required: 'Se necesita el usuario' })}
                                name="usuario"
                                label="Nombre de usuario"
                                value={newPayment.usuario?.toString() || ''}
                                onChange={handleInputChange}
                                disabled
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
                                value={newPayment.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" component="label" fullWidth>
                                Agregar Archivo
                                <VisuallyHiddenInput
                                    type="file"
                                    name="archivo"
                                    onChange={handleFileInputChange}
                                />
                            </Button>
                            {newPayment.archivo && <FormHelperText>{t('EditarLista-TituloArchivo')}: {newPayment.archivo.name}</FormHelperText>}
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
