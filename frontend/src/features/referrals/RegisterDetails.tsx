import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent,
    Card, Box, FormControl, InputLabel, MenuItem, Select, TextField,
    Typography
} from "@mui/material";

import { FieldValues, Form, useForm } from 'react-hook-form';
import { referralDetailsModel } from "../../app/models/referralDetailsModel";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../app/api/api";

interface DetailProp {
    idRemision: number;
    loadAccess: () => void;
}

export default function DetailsRegister({ idRemision: idRemision, loadAccess: loadAccess }: DetailProp) {
    const [newDetails, setNewDetails] = useState<Partial<referralDetailsModel>>({
        id_remision: idRemision,
        identificacion: "",
        tipo_documento: "",
        estado: "",
        observaciones: "",
    });

    const [referralDetails, setReferralDetails] = useState<referralDetailsModel[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    const loadDetails = async () => {
        setLoadingDetails(true);
        try {
            const response = await api.referralsDetails.getReferralDetailByIdRemision(idRemision);
            setReferralDetails(response.data);
        } catch (error) {
            console.error("Error al cargar los detalles", error);
            toast.error("Error al cargar los detalles");
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        loadDetails();
    }, [idRemision]);

    const onSubmit = async (data: FieldValues) => {
        try {
            // Formateamos las fechas antes de enviarlas
            console.log("Datos enviados al backend:", data); // Para verificar antes de enviarlo

            await api.referralsDetails.saveReferralDetails(data);
            toast.success("Detalle registrado correctamente");
            loadAccess();
            loadDetails();
        } catch (error) {
            console.error("Error en el registro de detalle:", error);
            toast.error("Error al registrar el detalle");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewDetails((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof referralDetailsModel;
        const value = event.target.value;
        setNewDetails((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedReferralsDetails = referralDetails.slice(startIndex, endIndex);

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '65vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('id_remision', { required: 'Se necesita el codigo de remision' })}
                                name="id_remision"
                                label="Id de la remision"
                                value={idRemision}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('identificacion', { required: 'Se necesita la identificacion' })}
                                name="identificacion"
                                label="Identificacion"
                                value={newDetails.identificacion?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="documento-label">Tipo de documento</InputLabel>
                                <Select
                                    labelId="documento-label"
                                    {...register('tipo_documento', { required: 'Se necesita el tipo de documento' })}
                                    name="tipo_documento"
                                    value={newDetails.tipo_documento?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Realizado">Realizado</MenuItem>
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el comprobante' })}
                                    name="estado"
                                    value={newDetails.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
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
                                {...register('observaciones', { required: 'Se necesitan algunas observaciones' })}
                                name="observaciones"
                                label="Observaciones"
                                value={newDetails.observaciones?.toString() || ''}
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
                <Box mt={4} textAlign="center" mb={2}>
                    <Typography variant="h5" component="h3" align="center">
                        Detalles de la Remisión
                    </Typography>
                    {loadingDetails ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Identificación</TableCell>
                                            <TableCell>Tipo Documento</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Observaciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {referralDetails.map(detail => (
                                            <TableRow key={detail.id_dremision}>
                                                <TableCell>{detail.identificacion}</TableCell>
                                                <TableCell>{detail.tipo_documento}</TableCell>
                                                <TableCell>{detail.estado}</TableCell>
                                                <TableCell>{detail.observaciones}</TableCell>
                                            </TableRow>
                                        ))}
                                        {referralDetails.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No hay detalles registrados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 15]}
                                component="div"
                                count={referralDetails.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(event, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                            />
                        </>
                    )}
                </Box>
            </Box>
        </Card>
    )
}