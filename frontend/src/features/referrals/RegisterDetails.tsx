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
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("small");

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

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
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

    const table = useMaterialReactTable({
        columns,
        data: referralDetails,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        localization: MRT_Localization_ES,
        muiTopToolbarProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en la barra de herramientas
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en la barra inferior (paginación)
            },
        },
        muiTablePaperProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en toda la tabla
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en el fondo del contenedor de la tabla
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976D2", // Azul primario para encabezados
                color: "white",
                fontWeight: "bold",
                fontSize: fontSizeMap[fontSize],
                border: "2px solid #1565C0",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: "white", // Blanco para las celdas
                borderBottom: "1px solid #BDBDBD",
                fontSize: fontSizeMap[fontSize],
                border: "1px solid #BDBDBD", // Gris medio para bordes
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "#E3F2FD", borderRadius: "8px" }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Tamaño de letra</InputLabel>
                    <Select
                        label="Tamaño de letra"
                        value={fontSize}
                        sx={{
                            height: "38px", // Igualar la altura del TextField
                            "& .MuiSelect-select": {
                                display: "flex",
                                alignItems: "center",
                                height: "38px",
                            },
                        }}
                        onChange={(e) => setFontSize(e.target.value as "small" | "medium" | "large")}
                    >
                        <MenuItem value="small">Pequeña</MenuItem>
                        <MenuItem value="medium">Mediana</MenuItem>
                        <MenuItem value="large">Grande</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        )
    });

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '65vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="register-detail-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={2}>
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
                <Box mt={4} textAlign="center" mb={2}>
                    <Typography variant="h5" component="h3" align="center">
                        Detalles de la Remisión
                    </Typography>
                    {loadingDetails ? (
                        <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                    ) : (
                        <MaterialReactTable table={table} />
                    )}
                </Box>
            </Box>
        </Card>
    )
}