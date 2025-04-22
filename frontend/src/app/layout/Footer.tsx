// src/components/Footer.tsx

import React from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

const FooterBar = styled(AppBar)(({ theme }) => ({
  top: "auto",
  bottom: 0,
  backgroundColor: "#1976D2", // Igual al Header
  color: "white",
  boxShadow: "none",
  zIndex: theme.zIndex.drawer + 1,
}));

const Footer = () => {
  return (
    <FooterBar position="fixed">
      <Toolbar
        sx={{
          justifyContent: "center",
          minHeight: "40px",
          textAlign: "center",
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            © {new Date().getFullYear()} SIPC · Todos los derechos reservados
          </Typography>
        </Box>
      </Toolbar>
    </FooterBar>
  );
};

export default Footer;
