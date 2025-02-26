import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {  Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/configureStore';
import { signInUser } from './accountSlice';
import { Email } from '../../app/models/email';
import { useTranslation } from "react-i18next";
import { useLanguage } from '../../app/context/LanguageContext';


export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.account);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState<Partial<Email>>({
    email: ''
  });

  const { register, handleSubmit, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
    mode: 'onTouched'
  });

  const { t } = useTranslation();
  const { changeLanguage, language } = useLanguage();

  const onSubmit = async (data: FieldValues) => {
    try {
      await dispatch(signInUser(data));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de inicio de sesión');
    }
  };

  // Espera a que se complete la acción signInUser y luego verifica el estado de autenticación
  React.useEffect(() => {
    if (isAuthenticated) {
      // Si el usuario está autenticado, redirige a la página '/'
      navigate('/');
      toast.success(t('toast-bienvenido'));
    } else if (isSubmitSuccessful) {
      if (user?.estado !== 'activo') {
        // Usuario inactivo detectado
        toast.error('Usuario inactivo. Por favor, contacte al administrador.');
      } else {
        // Credenciales incorrectas u otro error
        toast.error(t('toast-Credenciales'));
      }
    }
  }, [isAuthenticated, isSubmitSuccessful, navigate, user, t]);

  return (
    <Container component={Paper} maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        {t('titulo-sesion')}
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t('Nombre-sesion')}
          autoFocus
          {...register('nombre_usuario', { required: t('Nombre-error') })}
          error={!!errors.nombre_usuario}
          helperText={errors?.nombre_usuario?.message as string}
        />
        <TextField
          margin="normal"
          fullWidth
          label={t('Contraseña-sesion')}
          type="password"
          {...register('contrasena', { required: t('Contraseña-error') })}
          error={!!errors.contrasena}
          helperText={errors?.contrasena?.message as string}
        />
        <LoadingButton
          loading={isSubmitting}
          disabled={!isValid}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {t('Boton-sesion')}
        </LoadingButton>
      </Box>
    </Container>
  );
};




