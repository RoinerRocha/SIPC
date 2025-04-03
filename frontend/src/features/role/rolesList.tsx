import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, TablePagination,
  Box, IconButton, Tooltip, FormControl, InputLabel, MenuItem, Select,
} from "@mui/material";
import { roleModels } from "../../app/models/roleModels";
import { useMemo, useState, useEffect } from "react";
import api from "../../app/api/api";

import { MRT_Localization_ES } from "material-react-table/locales/es";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useFontSize } from "../../app/context/FontSizeContext";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


interface Props {
  roles: roleModels[];
  setRoles: React.Dispatch<React.SetStateAction<roleModels[]>>;
}

const availablePermissions = [ // 🔹 Lista de permisos posibles
  "Ingreso", "Pagos", "Observaciones", "Expedientes", "Requerimientos", "Roles",
  "Remisiones", "Normalizadores", "Personas", "Usuarios", "Registro", "Ajustes",
];

export default function RolesList({
  roles: roles,
  setRoles: setRoles,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<roleModels | null>(
    null
  );
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { fontSize } = useFontSize();
  const [newRole, setNewRole] = useState<Partial<roleModels>>({
    // id: 0,
    rol: "",
    permisos: [],
  });

  const fontSizeMap: Record<"small" | "medium" | "large", string> = {
    small: "0.85rem",
    medium: "1rem",
    large: "1.15rem",
  };

  useEffect(() => {
    // Cargar los Estado Activos al montar el componente
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const response = await api.roles.getRoles();

      const formattedRoles = response.data.map((role: any) => ({
        ...role,
        permisos: typeof role.permisos === "string" ? JSON.parse(role.permisos) : role.permisos || [],
      }));

      setRoles(formattedRoles);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        showConfirmButton: false,
        timer: 2000,
        text: "Se ha generado un error al obtener los roles",
        customClass: {
          popup: 'swal-z-index'
        }
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Desea eliminar este rol?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonText: 'Sí, eliminar',
      denyButtonText: 'No eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await api.roles.deleteRole(id);
        await Swal.fire({
          icon: 'success',
          title: 'Rol eliminado con éxito',
          showConfirmButton: false,
          timer: 2000
        });
        loadRole();
      } catch (error) {
        console.error('Error al eliminar el rol:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el rol.',
          confirmButtonText: 'Cerrar'
        });
      }
    } else if (result.isDenied) {
      await Swal.fire({
        icon: 'info',
        title: 'Eliminación cancelada',
        text: 'El rol no fue eliminado.',
        showConfirmButton: false,
        timer: 2000
      });
    }
    // Si presiona "Cancelar", no hace nada.
  };

  const handleEdit = (role: roleModels) => {
    setSelectedRole({
      ...role,
      permisos: typeof role.permisos === "string" ? JSON.parse(role.permisos) : role.permisos || [],
    });
    setOpenEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;

    const result = await Swal.fire({
      title: '¿Desea actualizar este rol?',
      text: 'Se guardarán los cambios realizados en el rol.',
      icon: 'question',
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonText: 'Sí, actualizar',
      denyButtonText: 'No actualizar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const roleId = selectedRole.id;
        const updatedRole = {
          rol: selectedRole.rol,
          permisos: JSON.stringify(selectedRole.permisos),
        };
        await api.roles.updateRole(roleId, updatedRole);
        await Swal.fire({
          icon: 'success',
          title: 'Rol actualizado con éxito',
          showConfirmButton: false,
          timer: 2000
        });
        setOpenEditDialog(false);
        loadRole();
      } catch (error) {
        console.error('Error al actualizar el rol:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el rol.',
          confirmButtonText: 'Cerrar'
        });
      }
    } else if (result.isDenied) {
      await Swal.fire({
        icon: 'info',
        title: 'Actualización cancelada',
        text: 'No se realizaron cambios en el rol.',
        showConfirmButton: false,
        timer: 2000
      });
    }
    // Si presiona "Cancelar", se cierra el modal sin hacer nada.
  };

  const handleAdd = async () => {
    try {
      const newRoleData = {
        ...newRole,
        permisos: JSON.stringify(newRole.permisos), // 🔹 Convertimos a JSON antes de enviarlo
      };
      await api.roles.saveRoles(newRoleData);
      Swal.fire({
        icon: "success",
        title: "Nuevo rol",
        showConfirmButton: false,
        timer: 2000,
        text: "Se ha agregado un nuevo rol",
        customClass: {
          popup: 'swal-z-index'
        }
      });
      setOpenAddDialog(false);
      loadRole();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        showConfirmButton: false,
        timer: 2000,
        text: "Se ha generado un error al agregar el rol",
        customClass: {
          popup: 'swal-z-index'
        }
      });
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
      {
        accessorKey: "permisos", header: "Permisos", muiTableHeadCellProps: { align: "center" }, muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          // Asegurar que permisos siempre sea un array antes de usar `.join()`
          const permisos = Array.isArray(row.original.permisos)
            ? row.original.permisos
            : typeof row.original.permisos === "string"
              ? JSON.parse(row.original.permisos)
              : [];

          return permisos.length > 0 ? permisos.join(", ") : "Sin permisos";
        },
      },
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

        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)} sx={{ textTransform: "none", }}>
          Agregar nuevo rol
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Permisos</InputLabel>
            <Select
              multiple
              value={selectedRole?.permisos || []}
              onChange={(e) =>
                setSelectedRole(selectedRole
                  ? { ...selectedRole, permisos: e.target.value as string[] } // 🔹 Asegura que `permisos` sea `string[]`
                  : null
                )
              }
              fullWidth
              label="Permisos"
            >
              {availablePermissions.map((permiso) => (
                <MenuItem key={permiso} value={permiso}>{permiso}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Permisos</InputLabel>
            <Select
              multiple
              value={selectedRole?.permisos || []}
              onChange={(e) =>
                setSelectedRole(selectedRole
                  ? { ...selectedRole, permisos: e.target.value as string[] } // 🔹 Asegura que `permisos` sea `string[]`
                  : null
                )
              }
              fullWidth
              label="Permisos"
            >
              {availablePermissions.map((permiso) => (
                <MenuItem key={permiso} value={permiso}>{permiso}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAdd}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
