// components/Referral/ReferralDetailsView.tsx
import { useEffect, useState } from "react";
import { referralDetailsModel } from "../../app/models/referralDetailsModel";
import { Box, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import api from "../../app/api/api";
import { useFontSize } from "../../app/context/FontSizeContext";

interface Props {
    open: boolean;
    onClose: () => void;
    idRemision: number;
}

export default function ReferralDetailsView({ open, onClose, idRemision }: Props) {
    const [details, setDetails] = useState<referralDetailsModel[]>([]);
    const [loading, setLoading] = useState(true);
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.referralsDetails.getReferralDetailByIdRemision(idRemision);
                setDetails(response.data);
            } catch (error) {
                console.error("Error al obtener los detalles:", error);
            } finally {
                setLoading(false);
            }
        };

        if (open) fetchDetails();
    }, [open, idRemision]);

    const columns: MRT_ColumnDef<referralDetailsModel>[] = [
        {
            accessorKey: "id_dremision",
            header: "ID Detalle",
            Cell: ({ cell }) => {
                const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: "inline-block",
                            maxWidth: "100px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "identificacion",
            header: "Identificación",
            Cell: ({ cell }) => {
                const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: "inline-block",
                            maxWidth: "140px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "tipo_documento",
            header: "Tipo de Documento",
            Cell: ({ cell }) => {
                const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: "inline-block",
                            maxWidth: "160px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "estado",
            header: "Estado",
            Cell: ({ cell }) => {
                const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: "inline-block",
                            maxWidth: "100px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: "observaciones",
            header: "Observaciones",
            Cell: ({ cell }) => {
                const value = cell.getValue() ? String(cell.getValue()) : "Sin Datos";
                return (
                    <Tooltip title={value} arrow>
                        <span style={{
                            display: "inline-block",
                            maxWidth: "180px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>{value}</span>
                    </Tooltip>
                );
            }
        },
    ];

    const table = useMaterialReactTable({
        columns,
        data: details,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        localization: MRT_Localization_ES,
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "white", borderRadius: "8px" }}>
            </Box>
        )
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Detalles de la Remisión #{idRemision}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {details.length === 0 ? (
                            <Typography>No hay detalles para esta remisión.</Typography>
                        ) : (
                            <MaterialReactTable
                                table={table}
                            />
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}
