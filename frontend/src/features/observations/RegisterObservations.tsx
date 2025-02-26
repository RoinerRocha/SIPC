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
    TextField
} from "@mui/material";

import { FieldValues, Form, useForm } from 'react-hook-form';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { observationModel } from "../../app/models/observationModel";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../app/api/api";

interface Prop {
    idPersona: number;
    person: string;
    identificationPerson: string;
    loadAccess: () => void;
    
}

export default function ObservationRegister({ idPersona: idPersona, person: person, identificationPerson: identificationPerson, loadAccess: loadAccess}: Prop) {
    const [newObservation, setNewObservation] = useState<Partial<observationModel>>({
        id_persona: idPersona,
        identificacion: identificationPerson,
        fecha: new Date(),
        observacion: "",
    });
    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.observations.saveObservations(data);
            toast.success("Observacion registrada correctamente");
            loadAccess();
        } catch (error) {
            console.error("Error en el registro de observacion:", error);
            toast.error("Error al registrar la observacion");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewObservation((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof observationModel;
        const value = event.target.value;
        setNewObservation((prevAsset) => ({
            ...prevAsset,
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
                                label="Ingresar Persona"
                                value={newObservation.id_persona?.toString() || ''}
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
                                label="Identificacion de la persona"
                                value={newObservation.identificacion?.toString() || ''}
                                onChange={handleInputChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                {...register('fecha', { required: 'Se necesita la fecha de pago' })}
                                type="date"
                                name="fecha"
                                label="Fecha"
                                value={newObservation.fecha?.toString() || ''}
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
                                {...register('observacion', { required: 'Se necesita el id de la persona' })}
                                name="observacion"
                                label="observacion"
                                value={newObservation.observacion?.toString() || ''}
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
