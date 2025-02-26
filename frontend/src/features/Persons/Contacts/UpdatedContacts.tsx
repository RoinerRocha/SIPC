import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { User } from '../../../app/models/user';
import { statesModels } from '../../../app/models/states';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { contactsModel } from '../../../app/models/contactsModel';

interface UpdateContactsProps {
    contacts: contactsModel;
    loadAccess: () => void;
}

export default function UpdateDirection({ contacts, loadAccess }: UpdateContactsProps) {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [contact, setContact] = useState<contactsModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);

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
                const [userData, stateData] = await Promise.all([
                    api.Account.getAllUser(),
                    api.States.getStates(),
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

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [contacts]);


    const onSubmit = async (data: FieldValues) => {
        if (currentContact) {
            try {
                await api.contacts.updateContacts(currentContact.id_contacto, data);
                toast.success('Contacto actualizada con éxito.');
                loadAccess();
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar el contacto.');
            }
        }
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
            <Box p={2}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="contacto-label">Nivel de Estudios</InputLabel>
                                <Select
                                    labelId="contacto-label"
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
                                {...register('identificador', { required: 'Se necesita el canton' })}
                                name="identificador"
                                label="Identificador"
                                value={currentContact.identificador?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
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
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('comentarios', { required: 'Se necesita el barrio' })}
                                name="comentarios"
                                label="Comentarios"
                                value={currentContact.comentarios?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                    <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                        Actualizar
                    </Button>
                </form>
            </Box>
        </Card>
    )
}
