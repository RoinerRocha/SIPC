import { Button, Menu, Fade, MenuItem, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { signOut } from "../../features/account/accountSlice";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import { toast } from "react-toastify";
import api from "../../app/api/api";

export default function SignInMenu() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.account);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();
  const { changeLanguage, language } = useLanguage();
  const navigate = useNavigate();

  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(signOut());  // Ejecuta la acción de cerrar sesión
    handleClose();
    navigate('/'); // Redirige al home
    setTimeout(() => {
      window.location.reload(); // Refresca la página después de 2 segundos
    }, 500);
  };


  const handleOpenPasswordModal = () => {
    setOpenPasswordModal(true);
    handleClose();
  };

  // Cerrar modal de cambio de contraseña
  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
    setNewPassword("");
  };

  // Función para cambiar la contraseña
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("La nueva contraseña no puede estar vacía.");
      return;
    }

    try {
      console.log("🔍 Estado actual del usuario:", user); // Debug

      if (!user) {
        toast.error("No se pudo obtener los datos del usuario.");
        return;
      }

      // Intentar obtener el ID con diferentes nombres posibles
      const accountId = user.id;

      if (!accountId) {
        toast.error("No se pudo obtener el ID del usuario.");
        return;
      }

      const updatePasswordData = {
        id: accountId,
        contrasena: newPassword.trim(),
      };

      console.log("📤 Enviando actualización de contraseña con datos:", updatePasswordData);

      await api.Account.updateUser(accountId, updatePasswordData);
      toast.success("Contraseña actualizada correctamente.");
      handleClosePasswordModal();
    } catch (error) {
      console.error("❌ Error al cambiar la contraseña:", error);
      toast.error("Error al actualizar la contraseña.");
    }
  };
  return (
    <div>
      <IconButton
        color='inherit'
        onClick={handleClick}
        sx={{ typography: 'h6' }}
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem disabled>{`Usuario: ${user?.correo_electronico}`}</MenuItem>
        <MenuItem onClick={handleOpenPasswordModal}>
          <KeyIcon sx={{ marginRight: 1 }} />
          Cambiar Contraseña
        </MenuItem>
        <MenuItem onClick={handleLogout}>Cerrar Sesion</MenuItem>
      </Menu>
      {/* Modal para cambiar contraseña */}
      <Dialog open={openPasswordModal} onClose={handleClosePasswordModal}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            label="Nueva Contraseña"
            type="password"
            fullWidth
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordModal} color="secondary">Cancelar</Button>
          <Button onClick={handleChangePassword} color="primary">Actualizar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}