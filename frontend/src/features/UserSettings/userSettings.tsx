import { useMemo, useState, useEffect } from "react";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_ColumnDef,
} from "material-react-table";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useFontSize } from "../../app/context/FontSizeContext";

export default function UserSettings() {
    const { fontSize, setFontSize } = useFontSize();

    const fontSizeMap: Record<"small" | "medium" | "large", string> = {
        small: "0.85rem",
        medium: "1rem",
        large: "1.15rem",
    };

    useEffect(() => {
        // Escuchar cambios en otras pestañas
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "globalFontSize") {
                setFontSize(event.newValue as "small" | "medium" | "large");
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleChangeFontSize = (event: any) => {
        setFontSize(event.target.value as "small" | "medium" | "large");
    };

    const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
        {
            accessorKey: "cambiar_tamano",
            header: "Tamaño de letras",
            Cell: () => (
                <FormControl fullWidth>
                    <InputLabel>Tamaño de letra</InputLabel>
                    <Select
                        label = "Tamano de Letra"
                        value={fontSize}
                        onChange={handleChangeFontSize}
                        sx={{ width: "100%" }}
                    >
                        <MenuItem value="small">Pequeña</MenuItem>
                        <MenuItem value="medium">Mediana</MenuItem>
                        <MenuItem value="large">Grande</MenuItem>
                    </Select>
                </FormControl>
            ),
        },
        {
            accessorKey: "dark_mode",
            header: "Activar dark mode",
            Cell: () => (
                <FormControl fullWidth>
                    <InputLabel>Activar Dark Mode</InputLabel>
                    <Select
                        label = "Tamano de Letra"
                        value={fontSize}
                        // onChange={handleChangeFontSize}
                        sx={{ width: "100%" }}
                    >
                        <MenuItem value="small">Modo Claro</MenuItem>
                        <MenuItem value="medium">Modo Oscuro</MenuItem>
                    </Select>
                </FormControl>
            ),
        },
    ], [fontSize]);


    const data = useMemo(() => [{ cambiar_tamano: "Tamaño de letra" }], []);

    const table = useMaterialReactTable({
        columns,
        data,
        enableColumnFilters: false,
        enablePagination: false,
        enableSorting: false,
        enableTopToolbar: false,
        enableBottomToolbar: false,
        muiTableBodyRowProps: { hover: false },
        muiTableHeadCellProps: {
            sx: { backgroundColor: "#1976D2", color: "white", fontSize: fontSizeMap[fontSize], fontWeight: "bold" },
        },
        muiTableBodyCellProps: {
            sx: { backgroundColor: "white", fontSize: fontSizeMap[fontSize], padding: "10px" },
        },
        localization: MRT_Localization_ES,
    });



    return (
        <>
            <Box sx={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
                <MaterialReactTable table={table} />
            </Box>
        </>
    )
}