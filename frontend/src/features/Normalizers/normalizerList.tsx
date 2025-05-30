import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Box, IconButton, Tooltip,
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
import RegisterNormalizer from "../Normalizers/registerNormalizer";
import UpdatedNormalizer from "../Normalizers/updatedNormalizer";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


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
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

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
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar los normalizadores",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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
                Swal.fire({
                    icon: "error",
                    title: "Error de busqueda",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No se encontraron normalizadores para esta empresa",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }

        } catch (error) {
            console.error("Error al obtener normalizaciones:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al obtener normalizadores",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
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
            Swal.fire({
                icon: "error",
                title: "Error de acceso",
                showConfirmButton: false,
                timer: 2000,
                text: "No se puede obtener eeste normalizador",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
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
            {
                accessorKey: "nombre",
                header: "Nombre",
                size: 100,
                Cell: ({ cell }) => {
                    const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "90px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {value}
                            </span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            {
                accessorKey: "tipo",
                header: "Tipo",
                size: 100,
                Cell: ({ cell }) => {
                    const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "90px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {value}
                            </span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            {
                accessorKey: "empresa",
                header: "Empresa",
                size: 100,
                Cell: ({ cell }) => {
                    const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "90px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {value}
                            </span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            {
                accessorKey: "estado",
                header: "Estado",
                size: 100,
                Cell: ({ cell }) => {
                    const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "90px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {value}
                            </span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            {
                accessorKey: "fecha_registro",
                header: "Fecha Registro",
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
                backgroundColor: "white", // Azul claro en la barra de herramientas
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: "white", // Azul claro en la barra inferior (paginación)
            },
        },
        muiTablePaperProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en toda la tabla
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "white", // Azul claro en el fondo del contenedor de la tabla
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
        muiFilterTextFieldProps: {
            sx: {
                '& input::placeholder': {
                    color: 'white',
                    opacity: 1, // <-- importante para que se vea bien el color
                },
                '& .MuiInputBase-input': {
                    color: 'white',
                },
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
            </Box>
        ),
    });

    return (
        <>
            <Box
                sx={{
                    maxWidth: '95%',        // Limita el ancho al 96% del contenedor padre
                    margin: '0 auto',       // Centra horizontalmente
                    padding: 2,             // Espaciado interno
                    backgroundColor: '#f9f9f9', // Opcional: color de fondo para mejor separación visual
                    borderRadius: 2,        // Bordes redondeados
                    boxShadow: 2,           // Sombra ligera
                }}
            >
                <MaterialReactTable table={table} />
            </Box>
            <Dialog
                open={openAddDialog}
                // onClose={() => setOpenAddDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "white" }}>Normalizadores</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '330px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}
                >
                    <RegisterNormalizer loadAccess={loadAccess}></RegisterNormalizer>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    <Button
                        type="submit"
                        form="register-normalizer-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Agregar Normalizador
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                // onClose={() => setOpenEditDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: "white" }}>Editar Normalizadores</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '300px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedNormalizer && (<UpdatedNormalizer NormalizerData={selectedNormalizer} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    <Button
                        type="submit"
                        form="update-normalizer-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Normalizador
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}