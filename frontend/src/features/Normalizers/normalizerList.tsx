import {
    Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow,
    TableBody, Button, TablePagination, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField,
    Box,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef
} from "material-react-table";

import { Edit as EditIcon } from "@mui/icons-material";

import React, { useMemo, useState, useEffect } from "react";
import { normalizerModel } from "../../app/models/normalizerModel";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import RegisterNormalizer from "../Normalizers/registerNormalizer";
import UpdatedNormalizer from "../Normalizers/updatedNormalizer";

interface Props {
    normalizers: normalizerModel[];
    setNormalizers: React.Dispatch<React.SetStateAction<normalizerModel[]>>;
}

export default function NormalizersList({ normalizers: normalizers, setNormalizers: setNormalizers }: Props) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedNormalizer, setSelectedNormalizer] = useState<normalizerModel | null>(null);
    const [empresa, setEmpresa] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("small");

    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    const loadAccess = async () => {
        try {
            const response = await api.normalizers.getAllNormalizers();
            setNormalizers(response.data);
        } catch (error) {
            console.error("Error al cargar las normalizaciones:", error);
            toast.error("Error al cargar las normalizaciones");
        }
    };

    const handleSearch = async () => {
        if (!empresa) {
            const defaultResponse = await api.normalizers.getAllNormalizers();
            setNormalizers(defaultResponse.data);
            return;
        }
        console.log(empresa);

        setLoading(true);
        try {
            const response = await api.normalizers.getNormalizeByCompany(empresa);
            if (response && response.data) {
                setNormalizers(Array.isArray(response.data) ? response.data : [response.data]);
            } else {
                toast.error("No se encontraron normalizaciones con esa empresa.");
            }

        } catch (error) {
            console.error("Error al obtener normalizaciones:", error);
            toast.error("Error al obtener normalizaciones.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddObservation = () => {
        setOpenAddDialog(true);
    };

    const handleEdit = async (id: number) => {
        try {
            const response = await api.normalizers.getNormalizerById(id);
            setSelectedNormalizer(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de las normalizaciones:", error);
            toast.error("No se puede acceder a esta normalizacion");
        }
    };

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    const columns = useMemo<MRT_ColumnDef<normalizerModel>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                size: 100,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ row }) => (
                    <Tooltip title="Editar Normalizador">
                        <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleEdit(row.original.id)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                ),
            },
            { accessorKey: "nombre", header: "Nombre", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "tipo", header: "Tipo", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "empresa", header: "Empresa", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "estado", header: "Estado", size: 100, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            {
                accessorKey: "fecha_registro",
                header: "Fecha de Registro",
                size: 100,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: normalizers,
        localization: MRT_Localization_ES,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
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
            <Box
                sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1 }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddDialog(true)}
                >
                    Agregar Normalizador
                </Button>
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
        ),
    });

    return (
        <>
            {loading ? <CircularProgress sx={{ margin: "20px auto", display: "block" }} /> : <MaterialReactTable table={table} />}
            <Dialog
                open={openAddDialog}
                // onClose={() => setOpenAddDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Normalizadores</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '330px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}
                >
                    <RegisterNormalizer loadAccess={loadAccess}></RegisterNormalizer>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="register-normalizer-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Agregar Normalizador
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Normalizadores</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        height: '300px',
                        width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedNormalizer && (<UpdatedNormalizer NormalizerData={selectedNormalizer} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="update-normalizer-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Normalizador
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}