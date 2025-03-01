import { Button, Menu, Fade, MenuItem, IconButton } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { signOut } from "../../features/account/accountSlice";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function SignInMenu() {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.account);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();
  const { changeLanguage, language } = useLanguage();
  const navigate = useNavigate();

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

  const handleChangeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(event.target.value);
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
        <MenuItem onClick={handleLogout}>Cerrar Sesion</MenuItem>
      </Menu>
    </div>
  );
}