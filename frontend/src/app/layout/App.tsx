import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Header from './header';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAppDispatch } from '../../store/configureStore';
import LoadingComponent from './LoadingComponent';
import 'react-toastify/dist/ReactToastify.css';
import { fetchCurrentUser } from '../../features/account/accountSlice';
import { fetchRoles } from '../../store/roleSlice';
import { FontSizeProvider } from "../context/FontSizeContext";
import { Box } from '@mui/material';
import Footer from './Footer';


function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    dispatch(fetchCurrentUser());
    setLoading(false);
  }, [dispatch])

  useEffect(() => {
    async function loadAppData() {
      await dispatch(fetchRoles()); // 🔹 Cargar roles antes de que la app se monte
      await dispatch(fetchCurrentUser());
      setLoading(false);
    }

    loadAppData();
  }, [dispatch]);

  const [darkMode, setDarkMode] = useState(false);
  const paletteType = darkMode ? 'dark' : 'light';
  const theme = createTheme({
    palette: {
      mode: paletteType,
      background: {
        default: paletteType === 'light' ? '#eaeaea' : '#121212'
      }
    }
  })

  function handleThemeChange() {
    setDarkMode(!darkMode);
  }

  return (
    <FontSizeProvider>
      <ThemeProvider theme={theme}>
        <ToastContainer position='bottom-right' hideProgressBar theme="colored" />
        <CssBaseline />
        <Header darkMode={darkMode} handleThemeChange={handleThemeChange} />
        <Box sx={{ ml: '50px' }}>
          <Outlet />
        </Box>
        <Footer />
      </ThemeProvider>
    </FontSizeProvider>
  );
};

export default App;

