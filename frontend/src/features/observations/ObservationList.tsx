import { useMemo, useState, useEffect } from "react";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { Button, TextField, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";
import { observationModel } from "../../app/models/observationModel";
import api from "../../app/api/api";
import ObservationRegister from "./RegisterObservations";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';

interface ObservationsProps {
    observations: observationModel[];
    setObservations: React.Dispatch<React.SetStateAction<observationModel[]>>;
}

export default function ObservationList({ observations, setObservations }: ObservationsProps) {
    const [loading, setLoading] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedIdPersona, setSelectedIdPersona] = useState<number | null>(null);
    const [identification, setIdentification] = useState("");
    const [personName, setPersonName] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const { fontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };


    useEffect(() => {
        loadAccess();
    }, []);

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

    const loadAccess = async () => {
        try {
            const response = await api.observations.getAllObservations();
            setObservations(response.data);
        } catch (error) {
            console.error("Error al cargar las observaciones:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al cargar las observaciones",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const handleAddObservation = async () => {
        const foundObservation = observations.find(obs => obs.identificacion === identification);
        if (foundObservation) {
            setSelectedIdPersona(foundObservation.id_persona);
        } else {
            try {
                const personResponse = await api.persons.getPersonByIdentification(identification);
                if (personResponse.data) {
                    setSelectedIdPersona(personResponse.data.id_persona);
                    setPersonName(`${personResponse.data.nombre || ""} ${personResponse.data.primer_apellido || ""} ${personResponse.data.segundo_apellido || ""}`.trim());
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        showConfirmButton: false,
                        timer: 2000,
                        text: "No se encontro a la persona con esa identificacion",
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
                    text: "Error al obtener las observaciones",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
                return;
            }
        }
        setOpenAddDialog(true);
    };

    const columns = useMemo<MRT_ColumnDef<observationModel>[]>(
        () => [
            {
                accessorKey: "id_persona",
                header: "Persona",
            },
            {
                accessorKey: "identificacion",
                header: "Identificador",
            },
            {
                accessorKey: "fecha",
                header: "Fecha",
                size: 10,
                Cell: ({ cell }) => (cell.getValue() ? new Date(cell.getValue() as string).toLocaleDateString() : "N/A"),
            },
            {
                accessorKey: "observacion",
                header: "Observación",
                size: 400,
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: observations,
        enableColumnFilters: true,
        enablePagination: true,
        enableSorting: true,
        muiTableBodyRowProps: { hover: true },
        onGlobalFilterChange: (value) => {
            const newValue = value ?? "";  // Si value es undefined, lo asignamos como ""

            setGlobalFilter(newValue);

            if (newValue.trim() === "") {
                setIdentification("");  // Borra el TextField si se limpia la barra de búsqueda
                setPersonName("");  // Borra el nombre de la persona
            } else {
                setIdentification(newValue);
            }
        },
        state: {
            globalFilter, columnVisibility: {
                id_persona: false, // Oculta la columna "id_persona"
                identificacion: false, // Oculta la columna "identificacion"
            },
        },
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
                maxWidth: "1300px", // Reducir el ancho total de la tabla
                margin: "auto", // Centrar la tabla en el contenedor
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "white", // Azul claro en el fondo del contenedor de la tabla
                maxWidth: "1300px", // Reducir el ancho total de la tabla
                margin: "auto", // Centrar la tabla en el contenedor
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976D2", // Azul primario para encabezados
                color: "white",
                fontWeight: "bold",
                fontSize: fontSizeMap[fontSize],
                padding: "4px",
                border: "2px solid #1565C0",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: "white", // Blanco para las celdas
                borderBottom: "1px solid #BDBDBD",
                padding: "4px 8px 4px 4px",
                fontSize: fontSizeMap[fontSize],
                textAlign: "left",
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
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    width: "50%",
                    paddingY: 1,
                    paddingX: 2,
                    backgroundColor: "white", // Azul claro
                    borderRadius: "8px",
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddObservation}
                    sx={{
                        height: "38px",
                        width: "200px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textTransform: "none",
                        boxShadow: "none",
                        borderRadius: "8px",
                        backgroundColor: "#1976D2", // Azul primario
                        "&:hover": {
                            backgroundColor: "#115293", // Azul más oscuro en hover
                        },
                    }}
                >
                    Agregar Observaciones
                </Button>
                <TextField
                    label="Número de Identificación"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    InputProps={{ readOnly: true }}
                    sx={{
                        display: "none",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        width: "210px",
                        "& .MuiInputBase-root": {
                            height: "38px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#BDBDBD",
                        },
                    }}
                />
                <TextField
                    label="Nombre de la persona"
                    value={personName}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{
                        sx: {
                            top: '-8px', // Ajusta la posición vertical del label
                            textAlign: 'left',
                            width: '100%',
                            transformOrigin: 'left',
                        },
                    }}
                    sx={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        width: "200px",
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

    return (
        <>
            <Box
                sx={{
                    maxWidth: '96%',        // Limita el ancho al 96% del contenedor padre
                    margin: '0 auto',       // Centra horizontalmente
                    padding: 2,             // Espaciado interno
                    backgroundColor: '#f9f9f9', // Opcional: color de fondo para mejor separación visual
                    borderRadius: 2,        // Bordes redondeados
                    boxShadow: 2,           // Sombra ligera
                }}
            >
                <MaterialReactTable table={table} />
            </Box>
            <Dialog open={openAddDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Agregar Observaciones</DialogTitle>
                <DialogContent sx={{ backgroundColor: "#E3F2FD", display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                    <ObservationRegister identificationPerson={identification} person={personName} idPersona={selectedIdPersona ?? 0} loadAccess={loadAccess} />
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#E3F2FD" }}>
                    <Button type="submit" form="register-observation-form" variant="contained" color="primary">
                        Registrar Observación
                    </Button>
                    <Button onClick={() => setOpenAddDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
