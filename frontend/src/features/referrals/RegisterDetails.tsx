import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent,
    Card, Box, FormControl, InputLabel, MenuItem, Select, TextField,
    Typography,
    FormHelperText
} from "@mui/material";

import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';

import { MRT_Localization_ES } from "material-react-table/locales/es";

import { FieldValues, Form, useForm } from 'react-hook-form';
import { referralDetailsModel } from "../../app/models/referralDetailsModel";
import { useMemo, useState, useEffect } from "react";
import api from "../../app/api/api";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';

interface DetailProp {
    idRemision: number;
    loadAccess: () => void;
    onCloseRequest: () => void;
}

export default function DetailsRegister({ idRemision: idRemision, loadAccess: loadAccess, onCloseRequest: onCloseRequest }: DetailProp) {
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
            Swal.fire({
                icon: "warning",
                title: "Sin detalles",
                showConfirmButton: false,
                timer: 2000,
                text: "Esta remision no posee detalles",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        loadDetails();
    }, [idRemision]);

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.referralsDetails.saveReferralDetails(data);
    
            Swal.fire({
                icon: "success",
                title: "Nuevo detalle",
                showConfirmButton: false,
                timer: 1500,
                text: "Se ha agregado el detalle con éxito",
                customClass: {
                    popup: 'swal-z-index'
                }
            }).then(() => {
                Swal.fire({
                    title: "¿Desea ver los detalles de esta remisión?",
                    showCancelButton: true,
                    confirmButtonText: "Sí, ver detalles",
                    cancelButtonText: "No",
                    icon: "question",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.setItem("remisionToView", idRemision.toString());
                        onCloseRequest(); // ✅ Cerramos el modal de agregar detalle
                    }
                });
            });
    
            loadAccess();
            loadDetails();
        } catch (error) {
            console.error("Error en el registro de detalle:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha generado un error al agregar el nuevo detalle",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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

    const columns = useMemo<MRT_ColumnDef<referralDetailsModel>[]>(
        () => [
            { accessorKey: "identificacion", header: "Identificación", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "tipo_documento", header: "Tipo Documento", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "estado", header: "Estado", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "observaciones", header: "Observaciones", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
        ],
        []
    );

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '65vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="register-detail-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('id_remision', { required: 'Se necesita el codigo de remision' })}
                                name="id_remision"
                                label="Id de la remision"
                                value={idRemision}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('identificacion', { required: 'Se necesita la identificacion' })}
                                name="identificacion"
                                label="Identificacion"
                                value={newDetails.identificacion?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.identificacion}
                                helperText={errors?.identificacion?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.tipo_documento}>
                                <InputLabel id="documento-label">Tipo de documento</InputLabel>
                                <Select
                                    error={!!errors.tipo_documento}
                                    labelId="documento-label"
                                    label="Tipo de documento"
                                    {...register('tipo_documento', { required: 'Se necesita el tipo de documento' })}
                                    name="tipo_documento"
                                    value={newDetails.tipo_documento?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Realizado">Realizado</MenuItem>
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                </Select>
                                {errors.tipo_documento && (
                                    <FormHelperText>{errors.tipo_documento.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    label="Estado"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newDetails.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Realizado">Realizado</MenuItem>
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                </Select>
                                {errors.estado && (
                                    <FormHelperText>{errors.estado.message as string}</FormHelperText>
                                )}
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