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
import { toast } from "react-toastify";
import ObservationRegister from "./RegisterObservations";

import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

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
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("small");


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

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    const loadAccess = async () => {
        try {
            const response = await api.observations.getAllObservations();
            setObservations(response.data);
        } catch (error) {
            console.error("Error al cargar las observaciones:", error);
            toast.error("Error al cargar los datos");
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
                    toast.warning("No se encontró persona con esa identificación.");
                    return;
                }
            } catch (error) {
                toast.error("Error al obtener información de la persona.");
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
                maxWidth: "800px", // Reducir el ancho total de la tabla
                margin: "auto", // Centrar la tabla en el contenedor
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: "#E3F2FD", // Azul claro en el fondo del contenedor de la tabla
                maxWidth: "800px", // Reducir el ancho total de la tabla
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
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    width: "100%",
                    paddingY: 1,
                    paddingX: 2,
                    backgroundColor: "#E3F2FD", // Azul claro
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
            {loading ? (
                <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
            ) : (
                <MaterialReactTable table={table} />
            )}

            <Dialog open={openAddDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ backgroundColor: "#E3F2FD" }}>Agregar Observaciones</DialogTitle>
                <DialogContent sx={{ backgroundColor: "#E3F2FD", display: 'flex', flexDirection: 'column', gap: 2, height: '450px', width: '1200px', overflowY: 'auto' }}>
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
