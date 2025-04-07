import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Box, IconButton, Tooltip,
} from "@mui/material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, PictureAsPdf as PdfIcon, AddCircle as AddIcon } from "@mui/icons-material";
import ReferralRegister from "./RegisterReferral";
import { useMemo, useState, useEffect } from "react";
import api from "../../app/api/api";
import { referralsModel } from "../../app/models/referralsModel";
import { referralDetailsModel } from "../../app/models/referralDetailsModel";
import UpdatedReferral from "./UpdateReferral";
import DetailsRegister from "./RegisterDetails";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useFontSize } from "../../app/context/FontSizeContext";
import ReferralDetailsView from "./ReferralDetailsView"; // nuevo componente
import VisibilityIcon from "@mui/icons-material/Visibility"; // ícono para ver
import '../../sweetStyles.css';
import Swal from 'sweetalert2';

interface ReferralProps {
    referrals: referralsModel[];
    setReferrals: React.Dispatch<React.SetStateAction<referralsModel[]>>;
}

export default function ReferraltList({ referrals: referrals, setReferrals: setReferrals }: ReferralProps) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [idRemisionSeleccionado, setIdRemisionSeleccionado] = useState<number | null>(null);
    const [openAddDetailsDialog, setOpenAddDetailsDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedRefeerral, setSelectedReferral] = useState<referralsModel | null>(null);
    const [searchId, setSearchId] = useState<number | "">("");
    const [openViewDetailsDialog, setOpenViewDetailsDialog] = useState(false);
    const [idToViewDetails, setIdToViewDetails] = useState<number | null>(null);
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    useEffect(() => {
        const storedId = localStorage.getItem("remisionToView");
        if (storedId) {
            setIdToViewDetails(Number(storedId));
            setOpenViewDetailsDialog(true);
            localStorage.removeItem("remisionToView"); // Limpia el valor después de usarlo
        }
    }, [openAddDetailsDialog === false]); // Se ejecuta justo después de cerrar el diálogo de agregar detalle


    useEffect(() => {
        // Cargar los accesos al montar el componente
        loadAccess();
    }, []);

    const loadAccess = async () => {
        try {
            const response = await api.referrals.getAllReferrals();
            setReferrals(response.data);
        } catch (error) {
            console.error("Error al cargar las remisiones:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar las remisiones",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleViewDetails = (id_remision: number) => {
        setIdToViewDetails(id_remision);
        setOpenViewDetailsDialog(true);
    };

    const handleSearch = async () => {
        if (!searchId) {
            const defaultResponse = await api.referrals.getAllReferrals();
            setReferrals(defaultResponse.data);
            return;
        }
        console.log(searchId);

        setLoading(true);
        try {
            const response = await api.referrals.getReferralsById(Number(searchId));
            if (response && response.data) {
                setReferrals(Array.isArray(response.data) ? response.data : [response.data]);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No se encontraron remisiones",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }

        } catch (error) {
            console.error("Error al obtener remisiones:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al obtener remisiones",
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


    const handleEdit = async (id_remision: number) => {
        try {
            const response = await api.referrals.getReferralsById(id_remision);
            setSelectedReferral(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de las remisiones:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "No se puede acceder a esta remision",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleAddDetailsDialog = (id_remision: number) => {
        setIdRemisionSeleccionado(id_remision);
        setOpenAddDetailsDialog(true);
    };

    const handleDownloadPDF = async (id_remision: number) => {
        const response = await api.referrals.getReferralsById(id_remision);
        const referralToDownload: referralsModel = response.data;

        if (!referralToDownload) {
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "No se puede descargar el pdf de esta remision",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            return;
        }

        try {
            // Obtener los detalles de la remisión
            const response = await api.referralsDetails.getReferralDetailByIdRemision(id_remision);
            const referralDetails: referralDetailsModel[] = response.data;

            const doc = new jsPDF();

            // Encabezado del PDF
            doc.setFontSize(16);
            doc.text("Detalle de la Remisión", 14, 10);

            // Tabla con los datos principales de la remisión
            autoTable(doc, {
                startY: 20,
                head: [["Código", "Fecha de Preparación", "Fecha de Envío", "Correo", "Entidad Destinada", "Estado"]],
                body: [
                    [
                        referralToDownload.id_remision,
                        new Date(referralToDownload.fecha_preparacion).toLocaleDateString(),
                        new Date(referralToDownload.fecha_envio).toLocaleDateString(),
                        referralToDownload.usuario_prepara,
                        referralToDownload.entidad_destino,
                        referralToDownload.estado || "N/A"
                    ]
                ],
            });

            // Obtener la posición de la última tabla agregada
            let lastTable = (doc as any).lastAutoTable;
            let nextTableY = lastTable ? lastTable.finalY + 10 : 30;

            // Si existen detalles de la remisión, agregarlos
            if (referralDetails.length > 0) {
                doc.setFontSize(14);
                doc.text("Detalles de la Remisión", 14, nextTableY - 5);

                autoTable(doc, {
                    startY: nextTableY,
                    head: [["ID Detalle", "ID Remisión", "Identificación", "Tipo Documento", "Estado", "Observaciones"]],
                    body: referralDetails.map((detail: referralDetailsModel) => [
                        detail.id_dremision,
                        detail.id_remision,
                        detail.identificacion,
                        detail.tipo_documento,
                        detail.estado,
                        detail.observaciones || "N/A"
                    ]),
                });
            } else {
                doc.setFontSize(12);
                doc.text("No hay detalles disponibles para esta remisión.", 14, nextTableY);
            }

            // Guardar el PDF
            doc.save(`Remision_${referralToDownload.id_remision}.pdf`);
        } catch (error) {
            console.error("Error al obtener detalles de la remisión:", error);
            Swal.fire({
                icon: "warning",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "No se puede obtener los detalles de esta remision, favor agregar detalles",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const columns = useMemo<MRT_ColumnDef<referralsModel>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ row }) => (
                    <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Editar Remisión">
                            <IconButton color="info" onClick={() => handleEdit(row.original.id_remision)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Descargar PDF">
                            <IconButton color="error" onClick={() => handleDownloadPDF(row.original.id_remision)}>
                                <PdfIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Agregar Detalles">
                            <IconButton color="success" onClick={() => handleAddDetailsDialog(row.original.id_remision)}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Detalles">
                            <IconButton color="primary" onClick={() => handleViewDetails(row.original.id_remision)}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
            },
            { accessorKey: "id_remision", header: "Código", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "fecha_preparacion", header: "Fecha Preparación", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "fecha_envio", header: "Fecha Envío", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "usuario_prepara", header: "Correo", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "entidad_destino", header: "Entidad Destino", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
            { accessorKey: "estado", header: "Estado", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: referrals,
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingY: 1, paddingX: 2, backgroundColor: "#E3F2FD", borderRadius: "8px" }}>
                <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
                    Agregar Remisión
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
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Agregar Remision</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '310px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}
                >
                    <ReferralRegister loadAccess={loadAccess}></ReferralRegister>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="register-referral-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Ingresar Remision
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
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Editar Remision</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "#E3F2FD",
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '100px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedRefeerral && (<UpdatedReferral ReferralsData={selectedRefeerral} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button
                        type="submit"
                        form="update-referral-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Remision
                    </Button>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openAddDetailsDialog}
                // onClose={() => setOpenAddDetailsDialog(false)}
                maxWidth="lg" // Ajusta el tamaño máximo del diálogo. Opciones: 'xs', 'sm', 'md', 'lg', 'xl'.
                fullWidth
            >
                <DialogTitle>Agregar Detalles de remision</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex', // Por ejemplo, para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '330px',
                        // width: '1200px', // Ajusta la altura según necesites.
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {idRemisionSeleccionado && (<DetailsRegister idRemision={idRemisionSeleccionado} loadAccess={loadAccess}  onCloseRequest={() => setOpenAddDetailsDialog(false)} />)}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="register-detail-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Ingresar Detalle
                    </Button>
                    <Button sx={{ textTransform: "none" }} onClick={() => setOpenAddDetailsDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
            {openViewDetailsDialog && idToViewDetails && (
                <ReferralDetailsView
                    open={openViewDetailsDialog}
                    onClose={() => setOpenViewDetailsDialog(false)}
                    idRemision={idToViewDetails}
                />
            )}
        </>
    )
}