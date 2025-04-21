import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { User } from '../../../app/models/user';
import { statesModels } from '../../../app/models/states';
import { useEffect, useState } from 'react';
import { contactsModel } from '../../../app/models/contactsModel';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface UpdateContactsProps {
    contacts: contactsModel;
    loadAccess: () => void;
}

export default function UpdateDirection({ contacts, loadAccess }: UpdateContactsProps) {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [contact, setContact] = useState<contactsModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const [currentContact, setCurrentContact] = useState<Partial<contactsModel>>(contacts);


    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (contacts) {
            setCurrentContact(contacts);
            console.log("currentDirection set:", contacts);
        }

        const fetchData = async () => {
            try {
                const [userData, stateData, limitsData] = await Promise.all([
                    api.Account.getAllUser(),
                    api.States.getStates(),
                    api.contacts.getFieldLimits()
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (userData && Array.isArray(userData.data)) {
                    setUsers(userData.data);
                } else {
                    console.error("User data is not an array", userData);
                }
                if (stateData && Array.isArray(stateData.data)) {
                    setState(stateData.data);
                } else {
                    console.error("States data is not an array", stateData);
                }
                if (limitsData) setLimits(limitsData);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [contacts]);


    const onSubmit = async (data: FieldValues) => {
        if (!currentContact) return;
    
        const result = await Swal.fire({
            title: '¿Desea actualizar este contacto?',
            text: 'Se guardarán los cambios realizados.',
            icon: 'question',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: 'Sí, actualizar',
            denyButtonText: 'No actualizar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                popup: 'swal-z-index',
                confirmButton: 'swal-confirm-btn',
                denyButton: 'swal-deny-btn'
            }
        });
    
        if (result.isConfirmed) {
            try {
                await api.contacts.updateContacts(currentContact.id_contacto, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Contacto actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el contacto:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el contacto.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Actualización cancelada',
                text: 'No se realizaron cambios.',
                timer: 2000,
                showConfirmButton: false
            });
        }
        // Si presiona "Cancelar", no se realiza ninguna acción.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentContact((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentContact((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '30vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="update-contacts-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="contacto-label">Nivel de Estudios</InputLabel>
                                <Select
                                    labelId="contacto-label"
                                    label="Nivel de Estudios"
                                    {...register('tipo_contacto', { required: 'Se necesita el tipo de estudio' })}
                                    name="tipo_contacto"
                                    value={currentContact.tipo_contacto?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="RESIDENCIAL">RESIDENCIAL</MenuItem>
                                    <MenuItem value="CELULAR">CELULAR</MenuItem>
                                    <MenuItem value="EMAIL">EMAIL</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('identificador', { required: 'Se necesita el identificador',  maxLength: {
                                    value: limits.identificador, // fallback si no está disponible
                                    message: `Límite de ${limits.identificador} caracteres excedido`
                                } })}
                                name="identificador"
                                label="Identificador"
                                value={currentContact.identificador?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.identificador}
                                helperText={errors?.identificador?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={currentContact.estado?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Seleccionar Estado"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                    
                                >
                                    {Array.isArray(state) && state.map((states) => (
                                        <MenuItem key={states.id} value={states.estado}>
                                            {states.estado}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro', { required: 'Se necesita la fecha de registro' })}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={currentContact.fecha_registro?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_registro}
                                helperText={errors?.fecha_registro?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('comentarios', { required: 'Se necesita el comentario', maxLength: {
                                    value: limits.comentarios,
                                    message: `Límite de ${limits.comentarios} caracteres excedido`
                                } })}
                                name="comentarios"
                                label="Comentarios"
                                value={currentContact.comentarios?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.comentarios}
                                helperText={errors?.comentarios?.message as string}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}
