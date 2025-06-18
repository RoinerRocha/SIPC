import { Button, Menu, Fade, MenuItem, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { signOut } from "../../features/account/accountSlice";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';
import api from "../../app/api/api";
import '../../sweetStyles.css';
import Swal from 'sweetalert2';


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
    }, 1000);
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
      Swal.fire({
        icon: "error",
        title: "Error",
        showConfirmButton: false,
        timer: 2000,
        text: "La contraseña no puede estar vacía",
        customClass: {
          popup: 'swal-z-index'
        }
      });
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas actualizar tu contraseña?",
      icon: "warning",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Sí, actualizar",
      denyButtonText: "No, cancelar",
      reverseButtons: true,
      customClass: {
        popup: 'swal-z-index',
        confirmButton: 'swal-confirm-btn',
        denyButton: 'swal-deny-btn'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (!user) {
            Swal.fire({
              icon: "error",
              title: "Error",
              showConfirmButton: false,
              timer: 2000,
              text: "No se pudo obtener los datos del usuario",
              customClass: {
                popup: 'swal-z-index'
              }
            });
            return;
          }

          const accountId = user.id;

          if (!accountId) {
            Swal.fire({
              icon: "error",
              title: "Error",
              showConfirmButton: false,
              timer: 2000,
              text: "Error al obtener el ID del usuario",
              customClass: {
                popup: 'swal-z-index'
              }
            });
            return;
          }

          const updatePasswordData = {
            id: accountId,
            contrasena: newPassword.trim(),
          };

          await api.Account.updateUserPassword(accountId, updatePasswordData);

          swalWithBootstrapButtons.fire({
            title: "Actualizada",
            text: "La contraseña se ha cambiado correctamente.",
            icon: "success"
          });

          handleClosePasswordModal();
        } catch (error) {
          console.error("❌ Error al cambiar la contraseña:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            showConfirmButton: false,
            timer: 2000,
            text: "Error al actualizar la contraseña",
            customClass: {
              popup: 'swal-z-index'
            }
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "La contraseña no se ha modificado.",
          icon: "info"
        });
      }
    });
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
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ marginRight: 1, color: "red" }} /> {/* 🔹 Icono de cierre de sesión */}
          Cerrar Sesión
        </MenuItem>
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