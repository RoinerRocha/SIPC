import { styled, useTheme } from "@mui/material/styles";
import { Lock } from "@mui/icons-material";
import { Badge, Box, Drawer, Divider, IconButton, List, ListItem, ListItemButton,
  ListItemText, Switch, Toolbar, Typography, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../store/configureStore";
import * as React from "react";
import { useState, useEffect, useRef  } from "react";
import AppBar from "@mui/material/AppBar"; // Usa AppBar en lugar de MuiAppBar
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemIcon from "@mui/material/ListItemIcon";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HistoryIcon from '@mui/icons-material/History';
import MediationIcon from '@mui/icons-material/Mediation';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HelpIcon from '@mui/icons-material/Help';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HomeIcon from '@mui/icons-material/Home';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SignInMenu from "./SigninMenu";
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';

const drawerWidth = 240;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const navStyles = {
  color: "inherit",
  textDecoration: "none",
  typography: "h5",
  "&:hover": {
    color: "grey.500",
  },
  "&.active": {
    color: "text.secondary",
  },
};

interface Props {
  darkMode: boolean;
  handleThemeChange: () => void;
}

export default function Header({ darkMode, handleThemeChange }: Props) {
  const { user } = useAppSelector((state) => state.account);
  const { roles } = useAppSelector((state) => state.roles);

  const theme = useTheme();
  const { t } = useTranslation();
  const { changeLanguage, language } = useLanguage();

  const [open, setOpen] = React.useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const handleDrawerOpen = (event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que el evento cierre el Drawer inmediatamente
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChangeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(event.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const rightLinks = [{ title: t('titulo-login'), path: "/Ingreso" }];

  const midLinks = [
    { title: "Principal", path: "/" },
    { title: "Datos de Personas", path: "/Personas", permission: "Personas" },
    { title: "Registro de Expedientes", path: "/Expedientes", permission: "Expedientes" },
    { title: "Observaciones", path: "/Observaciones", permission: "Observaciones" },
    { title: "Requerimientos", path: "/Requerimientos", permission: "Requerimientos" },
    { title: "Pagos", path: "/Pagos", permission: "Pagos" },
    { title: "Remisiones", path: "/Remisiones", permission: "Remisiones" },
    // { title: t('menu-zonas'), path: "/zonas" },
    { title: "Usuarios", path: "/Usuarios", permission: "Usuarios" },
    { title: "Normalizadores", path: "/Normalizadores",  permission: "Normalizadores" },
    { title: "Roles", path: "/Roles",  permission: "Roles" },
    // { title: t('menu-lista-activos'), path: "/NewAsset" },
  ];

  // Filtrar enlaces en función del perfil del usuario
  const userPermissions = user?.permisos || [];
  const filteredRoutes = midLinks.filter(route => route.permission && userPermissions.includes(route.permission));
  console.log("🔍 Permisos del usuario:", userPermissions);
  console.log("📌 Rutas permitidas:", filteredRoutes);

  return (
    <Box sx={{ display: "flex", overflowX: "hidden", width: "100vw" }}>
      <AppBarStyled position="static" sx={{ mb: 4 }} open={open}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
              disabled={!user}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h2" component={NavLink} to="/" sx={navStyles}>
              SIPE
            </Typography>
            {/* <Switch checked={darkMode} onChange={handleThemeChange} /> */}
            
          </Box>

          <Box display="flex" alignItems="center">
            {user ? (
              <SignInMenu />
            ) : (
              <List sx={{ display: "flex" }}>
                {rightLinks.map(({ title, path }) => (
                  <ListItem
                    component={NavLink}
                    to={path}
                    key={path}
                    sx={navStyles}
                  >
                    Iniciar Sesion
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        ref={drawerRef}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {filteredRoutes.map(({ title, path }) => (
            <ListItem key={path} disablePadding>
              <ListItemButton component={NavLink} to={path} sx={navStyles}>
                <ListItemIcon>
                  {(() => {
                    switch (title) {
                      case "Principal":
                        return <HomeIcon />;
                      case "Usuarios":
                        return <PeopleAltIcon />;
                      case "Registro de Expedientes":
                        return <HistoryIcon />;
                      case "Normalizadores":
                        return <AccountBalanceIcon />;
                      case "Observaciones":
                        return <AssessmentIcon />;
                      case "Datos de Personas":
                        return <KeyIcon />;
                      case "Roles":
                        return <AccountCircleIcon />;
                      case t("menu-lista-activos"):
                        return <FormatListNumberedIcon />;
                      case t("menu-ingreso-activos"):
                        return <AddCircleIcon />;
                      case "Requerimientos":
                        return <RuleFolderIcon />;
                      case "Pagos":
                        return <MonetizationOnIcon />;
                      case t("menu-reportes"):
                        return <SummarizeIcon />;
                      case t("menu-depreciacion-mensual"):
                        return <CalendarMonthIcon />;
                      case "Remisiones":
                        return <FactCheckIcon />;
                      case t("menu-Mapas"):
                        return <MyLocationIcon />;
                      case t("menu-ayuda"):
                        return <HelpIcon />;
                      default:
                        return null;
                    }
                  })()}
                </ListItemIcon>
                <ListItemText primary={title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
}
