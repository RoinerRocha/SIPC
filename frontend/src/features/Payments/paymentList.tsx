import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Box, IconButton, Tooltip,
} from "@mui/material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, AddCircle as AddCircleIcon, PictureAsPdf as PictureAsPdfIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { paymentsModel } from "../../app/models/paymentsModel";
import { personModel } from "../../app/models/persons";
import { useMemo, useState, useEffect } from "react";
import PaymentRegister from "./paymentRegister";
import api from "../../app/api/api";
import UpdatePayment from "./UpdatedPayment";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';

interface Props {
    payments: paymentsModel[];
    setPayments: React.Dispatch<React.SetStateAction<paymentsModel[]>>;
}

export default function PaymentList({ payments: payments, setPayments: setPayments }: Props) {
    const [loadingData, setLoadingData] = useState(true);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<paymentsModel | null>(null);
    const [identification, setIdentification] = useState("");
    const [selectedIdPersona, setSelectedIdPersona] = useState<number | null>(null);
    const [personName, setPersonName] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    useEffect(() => {
        // Cargar los accesos al montar el componente
        setTimeout(() => {
            loadAccess(); // espera 500ms para garantizar que backend terminó
        }, 500);
    }, []);

    const loadAccess = async () => {
        try {
            const [paymentsResponse, personsResponse] = await Promise.all([
                api.payments.getAllPayments(),
                api.persons.getPersons()
            ]);

            const personsMap: Map<number, string> = new Map(
                personsResponse.data.map((person: personModel) => [
                    person.id_persona,
                    `${person.nombre} ${person.primer_apellido} ${person.segundo_apellido}`.trim()
                ])
            );

            const enrichedPayments = paymentsResponse.data.map((payment: paymentsModel) => {
                const nombre = personsMap.get(payment.id_persona);
                return {
                    ...payment,
                    nombre_persona: (nombre && nombre.trim()) ? nombre : "", // <- evita "Eliminado" si aún no está listo
                };
            });

            setPayments(enrichedPayments);
        } catch (error) {
            console.error("Error al cargar los pagos:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar los pagos",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        } finally {
            setLoadingData(false); // <- importante
        }
    };

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://backend-sipe.onrender.com/api/";

    useEffect(() => {
        const fetchPersonName = async () => {
            if (!/^\d{9}$/.test(identification)) {
                setPersonName("");
                return;
            }

            try {
                const personResponse = await api.persons.getPersonByIdentification(identification);
                if (personResponse.data) {
                    const fullName = `${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim();
                    setPersonName(fullName);
                } else {
                    setPersonName("");
                }
            } catch (error) {
                console.error("Error al obtener información de la persona:", error);
                setPersonName("");
            }
        };

        fetchPersonName();
    }, [identification]);

    const handleAddPayment = async () => {
        const foundPayment = payments.find(p => p.identificacion === identification);

        if (foundPayment) {
            setSelectedIdPersona(foundPayment.id_persona); // Asigna el ID de la persona si ya existe en pagos
            setSelectedPayment(foundPayment);
        } else {
            try {
                const personResponse = await api.persons.getPersonByIdentification(identification);
                if (personResponse.data) {
                    setSelectedIdPersona(personResponse.data.id_persona); // Asigna el ID de la persona si no hay pago registrado
                    setPersonName(`${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim());
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: "Error",
                        showConfirmButton: false,
                        timer: 2000,
                        text: "No se encontro a una persona con esta identificacion",
                        customClass: {
                            popup: 'swal-z-index'
                        }
                    });
                    return;
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "No se encuentra a esta persona",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                return;
            }
        }
        setOpenAddDialog(true);
    };

    const handleEdit = async (id_pago: number) => {
        try {
            const response = await api.payments.getPaymentsByIDPago(id_pago);
            setSelectedPayment(response.data);
            setOpenEditDialog(true);
        } catch (error) {
            console.error("Error al cargar los datos de los pagos:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "No se puede acceder a este pago",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleFileUrl = (filePath: File | string | null) => {
        if (!filePath) return "Sin archivo";

        if (filePath instanceof File) {
            const localFileUrl = URL.createObjectURL(filePath);
            if (filePath.name.endsWith(".pdf")) {
                return (
                    <Tooltip title="Ver Archivo">
                        <IconButton
                            color="secondary"
                            onClick={() => window.open(localFileUrl, '_blank')}
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                );
            }

            return (
                <img
                    src={localFileUrl}
                    alt="Archivo"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
            );
        }

        if (typeof filePath === 'string') {
            const filename = filePath.split('/').pop();
            const backendFileUrl = `${backendUrl}downloadPaymentFile/${filename}`;

            if (filePath.endsWith(".pdf")) {
                return (
                    <Tooltip title="Ver Archivo">
                        <IconButton
                            color="secondary"
                            onClick={() => window.open(backendFileUrl, '_blank')}
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                );
            }

            return (
                <img
                    src={backendFileUrl}
                    alt="Archivo"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
            );
        }

        return "Archivo no válido";
    };

    const handleDownloadPDF = () => {
        const paymentsToDownload = payments.filter((p) => p.identificacion === identification);

        if (paymentsToDownload.length === 0) {
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "No se encontraron pago para esta persona",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            return;
        }

        const doc = new jsPDF();

        // Encabezado del PDF con el nombre completo
        doc.setFontSize(16);
        doc.text("Detalle de Pagos", 14, 10);
        doc.setFontSize(12);
        doc.text(`Nombre: ${personName}`, 14, 20);
        doc.text(`Identificación: ${identification}`, 14, 30);

        // Agregar la tabla de pagos
        autoTable(doc, {
            startY: 40,
            head: [["Comprobante", "Tipo de Pago", "Fecha de Pago", "Monto", "Moneda", "Estado"]],
            body: paymentsToDownload.map((payment) => [
                payment.comprobante,
                payment.tipo_pago.replace(/_/g, " "),
                new Date(payment.fecha_pago).toLocaleDateString(),
                payment.monto,
                payment.moneda,
                payment.estado,
            ]),
        });

        // Guardar el PDF
        doc.save(`Pagos_${identification}.pdf`);
    };


    const columns = useMemo<MRT_ColumnDef<paymentsModel>[]>(
        () => [
            {
                accessorKey: "acciones",
                header: "Acciones",
                size: 100,
                Cell: ({ row }) => (
                    <Tooltip title="Editar">
                        <IconButton
                            color="primary"
                            onClick={() => handleEdit(row.original.id_pago)} // Asegúrarse de que `id_pago` esté disponible en `row.original`
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                ),
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            {
                accessorKey: "identificacion",
                header: "Identificación",
                size: 120,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "110px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "nombre_persona",
                header: "Nombre de la Persona",
                size: 200,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw && String(raw).trim() !== "" ? String(raw) : "Eliminado del Sistema";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "180px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "comprobante",
                header: "Comprobante",
                size: 150,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "130px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" }
            },
            {
                accessorKey: "tipo_pago",
                header: "Tipo Pago",
                size: 150,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "130px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "fecha_pago",
                header: "Fecha Pago",
                size: 150,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
            },
            {
                accessorKey: "fecha_presentacion",
                header: "Fecha Presentación",
                size: 150,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString(),
            },
            {
                accessorKey: "archivo",
                header: "Archivo",
                size: 150,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ cell }) => handleFileUrl(cell.getValue() as string),
            },
            {
                accessorKey: "monto",
                header: "Monto",
                size: 100,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw != null ? `$${raw}` : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "80px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "moneda",
                header: "Moneda",
                size: 100,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "80px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "observaciones",
                header: "Observaciones",
                size: 250,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "220px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "tipo_movimiento",
                header: "Tipo Movimiento",
                size: 150,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
                    return (
                        <Tooltip title={value} arrow>
                            <span style={{
                                display: "inline-block",
                                maxWidth: "130px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>{value}</span>
                        </Tooltip>
                    );
                },
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                accessorKey: "estado",
                header: "Estado",
                size: 120,
                Cell: ({ cell }) => {
                    const raw = cell.getValue();
                    const value = raw ? String(raw) : "Sin Datos";
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
                }, muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" },
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: payments,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        onGlobalFilterChange: (value) => {
            const newValue = value ?? "";
            setGlobalFilter(newValue);

            if (newValue.trim() === "") {
                setIdentification("");
                setPersonName("");
            } else {
                setIdentification(newValue);
            }
        },
        state: { globalFilter },
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
                <Button variant="contained"
                    color="primary"
                    onClick={handleAddPayment}
                    sx={{
                        height: "38px", width: "130px", fontSize: "14px", fontWeight: "bold", textTransform: "none", borderRadius: "12px"
                    }}>
                    Agregar Pago
                </Button>
                {payments.some((p) => p.identificacion === identification) && (
                    <Button variant="contained"
                        onClick={handleDownloadPDF}
                        sx={{ height: "38px", borderRadius: "12px", width: "140px", textTransform: "none", fontWeight: "bold", }}>
                        Descargar PDF
                    </Button>
                )}
                <TextField label="Identificación" value={identification} InputProps={{ readOnly: true }} onChange={(e) => setIdentification(e.target.value)} sx={{ width: "220px", display: "none", }} />
                <TextField
                    label="Persona seleccionada para PDF"
                    value={personName}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{
                        sx: {
                            top: '-8px',              // Eleva visualmente el label
                            textAlign: 'left',      // Centrado horizontal
                            width: '100%',
                            transformOrigin: 'left' // Punto de transformación centrado
                        },
                    }}
                    sx={{
                        width: "240px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        "& .MuiInputBase-root": {
                            height: "38px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#BDBDBD",
                        },
                    }}
                />
            </Box>
        ),
    });

    if (loadingData) {
        return (
            <Box sx={{ padding: 4, textAlign: "center", fontSize: "18px" }}>
                Cargando pagos...
            </Box>
        );
    }

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
                <DialogTitle sx={{ backgroundColor: "white" }}>Agregar Pago o Deposito</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '1200px',
                        // width: '1200px', // Ajusta la altura
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}
                >
                    <PaymentRegister identificationPerson={identification} person={personName} idPersona={selectedIdPersona ?? 0} loadAccess={loadAccess} ></PaymentRegister>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    <Button
                        type="submit"
                        form="register-payments-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Ingresar Pago
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
                <DialogTitle sx={{ backgroundColor: "white" }}>Editar Pagos</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundColor: "white",
                        display: 'flex', // para organizar los elementos internos.
                        flexDirection: 'column', // Organiza los hijos en una columna.
                        gap: 2, // Espaciado entre elementos.
                        // height: '270px',
                        // width: '1200px', // Ajusta la altura
                        overflowY: 'auto', // Asegura que el contenido sea desplazable si excede el tamaño.
                    }}>
                    {selectedPayment && (<UpdatePayment PaymentsData={selectedPayment} loadAccess={loadAccess} />)}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "white" }}>
                    <Button
                        type="submit"
                        form="update-payments-form"
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none" }}
                    >
                        Actualizar Pago
                    </Button>
                    <Button sx={{ textTransform: "none", bgcolor: '#9e9e9e', color: 'white', '&:hover': { bgcolor: '#757575' } }} onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
