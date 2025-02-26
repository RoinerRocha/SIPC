import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent,
    Card, Box, FormControl, InputLabel, MenuItem, Select, TextField
} from "@mui/material";
import { FieldValues, Form, useForm } from 'react-hook-form';
import { useState, useEffect } from "react";
import { normalizerModel } from "../../app/models/normalizerModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../app/api/api";

interface LoadNormalizerProps {
    loadAccess: () => void;
}

export default function RegisterNormalizer({ loadAccess }: LoadNormalizerProps) {
    const { user } = useAppSelector(state => state.account);
    const [newNormalizer, setNewNormalizer] = useState<Partial<normalizerModel>>({
        nombre: "",
        tipo: "",
        empresa: "",
        estado: "",
        fecha_registro: new Date(),
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
            data.fecha_registro = formatDate(new Date(data.fecha_registro));

            console.log("Datos enviados al backend:", data); // Para verificar antes de enviarlo

            await api.normalizers.saveNormalizer(data);
            toast.success("Normalizacion registrada correctamente");
            loadAccess();
        } catch (error) {
            console.error("Error en el registro de Normalizacion:", error);
            toast.error("Error al registrar la normalizacion");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewNormalizer((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof normalizerModel;
        const value = event.target.value;
        setNewNormalizer((prevAsset) => ({
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
                                {...register('nombre', { required: 'Se necesita el nombre' })}
                                name="nombre"
                                label="Nombre"
                                value={newNormalizer.nombre?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-label">Tipo</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    {...register('tipo', { required: 'Se necesita el tipo' })}
                                    name="tipo"
                                    value={newNormalizer.tipo?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="INGENIEROS">Ingenieros</MenuItem>
                                    <MenuItem value="FISCALES">Fiscales</MenuItem>
                                    <MenuItem value="ABOGADOS">Abogados</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('empresa', { required: 'Se necesita la empresa' })}
                                name="empresa"
                                label="Empresa"
                                value={newNormalizer.empresa?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newNormalizer.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="ACTIVO">Activo</MenuItem>
                                    <MenuItem value="INACTIVO">Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro', { required: 'Se necesita la fecha de registro' })}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={newNormalizer.fecha_registro?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
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