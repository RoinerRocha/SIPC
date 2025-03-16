import {
  Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow, TableBody,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, TablePagination,
  Box,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { roleModels } from "../../app/models/roleModels";
import { useMemo, useState, useEffect } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";

import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface Props {
  roles: roleModels[];
  setRoles: React.Dispatch<React.SetStateAction<roleModels[]>>;
}

export default function RolesList({
  roles: roles,
  setRoles: setRoles,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<roleModels | null>(
    null
  );
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("small");
  const [newRole, setNewRole] = useState<Partial<roleModels>>({
    // id: 0,
    rol: "",
  });

  useEffect(() => {
    // Cargar los Estado Activos al montar el componente
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const response = await api.roles.getRoles();
      setRoles(response.data);
    } catch (error) {
      toast.error("Error al obtener los Roles");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.roles.deleteRole(id);
      toast.success("Se ah Eliminado el Rol");
      loadRole();
    } catch (error) {
      toast.error("Error al Eliminar el Rol");
    }
  };

  const handleEdit = (role: roleModels) => {
    setSelectedRole(role);
    setOpenEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedRole) {
      try {
        const roleId = selectedRole.id;
        const updatedRole = {
          rol: selectedRole.rol,
        };
        await api.roles.updateRole(roleId, updatedRole);
        toast.success("Se ah Actualizado el rol");
        setOpenEditDialog(false);
        loadRole();
      } catch (error) {
        toast.error("Error al Actualizar el rol");
      }
    }
  };

  const fontSizeMap: Record<"small" | "medium" | "large", string> = {
    small: "0.85rem",
    medium: "1rem",
    large: "1.15rem",
  };

  const handleAdd = async () => {
    try {
      const addedStatusRole = await api.roles.saveRoles(newRole);
      toast.success("Se ah agregado un nuevo Rol");
      setOpenAddDialog(false);
      loadRole();
    } catch (error) {
      toast.error("Error al Agregar el nuevo Rol");
    }
  };

  const columns = useMemo<MRT_ColumnDef<roleModels>[]>(
    () => [
      {
        accessorKey: "acciones",
        header: "Acciones",
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Box display="flex" gap={1} justifyContent="center">
            <Tooltip title="Editar Rol">
              <IconButton color="info" onClick={() => handleEdit(row.original)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar Rol">
              <IconButton color="error" onClick={() => handleDelete(row.original.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      { accessorKey: "rol", header: "Nombre", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" } },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: roles,
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

        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)} sx={{textTransform: "none",}}>
          Agregar nuevo rol
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
      <MaterialReactTable table={table} />
      <Dialog open={openEditDialog}>
        <DialogTitle>Editar Rol</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del Rol"
            value={selectedRole?.rol || null}
            onChange={(e) =>
              setSelectedRole(
                selectedRole
                  ? {
                    ...selectedRole,
                    rol: e.target.value,
                  }
                  : null
              )
            }
            fullWidth
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdate}>Agregar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddDialog}>
        <DialogTitle>Agregar Rol</DialogTitle>
        <DialogContent>
          <TextField
            label="Nuevo Nombre"
            value={newRole?.rol}
            onChange={(e) =>
              setNewRole({
                ...newRole,
                rol: e.target.value,
              })
            }
            fullWidth
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAdd}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
