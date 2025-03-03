import {
  Grid, TableContainer, Paper, Table, TableCell, TableHead, TableRow, TableBody,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, TablePagination,
} from "@mui/material";
import { roleModels } from "../../app/models/roleModels";
import { useState, useEffect } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';

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
  const [newRole, setNewRole] = useState<Partial<roleModels>>({
    // id: 0,
    rol: "",
  });
  const { t } = useTranslation();
  const { changeLanguage, language } = useLanguage();

  useEffect(() => {
    // Cargar los Estado Activos al montar el componente
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const response = await api.roles.getRoles();
      setRoles(response.data);
    } catch (error) {
      toast.error(t('Toast-Perfil-Datos'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.roles.deleteRole(id);
      toast.success(t('Toast-Perfil-Eliminar'));
      loadRole();
    } catch (error) {
      toast.error(t('Toast-Perfil-Eliminar-Error'));
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
        toast.success(t('Toast-Perfil-Editar'));
        setOpenEditDialog(false);
        loadRole();
      } catch (error) {
        toast.error(t('Toast-Perfil-Editar-Error'));
      }
    }
  };

  const handleAdd = async () => {
    try {
      const addedStatusRole = await api.roles.saveRoles(newRole);
      toast.success(t('Toast-Perfil-Agregar'));
      setOpenAddDialog(false);
      loadRole();
    } catch (error) {
      toast.error(t('Toast-Perfil-Agregar-Error'));
    }
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRoles = roles.slice(startIndex, endIndex);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAddDialog(true)}
          sx={{ marginBottom: 2, height: "56px" }}
        >
          Agregar Nuevo Rol
        </Button>
      </Grid>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead sx={{ backgroundColor: "#B3E5FC" }}>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}
              >
                Nombre
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem" }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{role.rol}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleEdit(role)}
                    sx={{ fontSize: "0.65rem", minWidth: "40px", minHeight: "20px", margin: "5px" }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(role.id)}
                    sx={{ fontSize: "0.65rem", minWidth: "40px", minHeight: "20px", margin: "5px" }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={roles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) =>
          setRowsPerPage(parseInt(event.target.value, 10))
        }
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />

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
    </Grid>
  );
}
