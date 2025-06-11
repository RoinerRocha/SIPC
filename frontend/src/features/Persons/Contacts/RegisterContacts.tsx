import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { statesModels } from '../../../app/models/states';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { contactsModel } from '../../../app/models/contactsModel';
import { personModel } from '../../../app/models/persons';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface AddSContactProps {
    loadAccess: () => void;
}

export default function RegisterContacts({ loadAccess }: AddSContactProps) {
    const navigate = useNavigate();
    const [state, setState] = useState<statesModels[]>([]);
    const [person, setPerson] = useState<personModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const ContactInfo = JSON.parse(localStorage.getItem('ContactInfo') || '{}');
    const [newContact, setNewContact] = useState<Partial<contactsModel>>({
        id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        tipo_contacto: ContactInfo.tipo_contacto || "RESIDENCIAL",
        identificador: ContactInfo.identificador || "",
        estado: ContactInfo.estado || "activo",
        fecha_registro: ContactInfo.fecha_registro ? new Date(ContactInfo.fecha_registro) : new Date(),
        comentarios: ContactInfo.comentarios || "",
    });
    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {

        const storedInfo = localStorage.getItem('ContactInfo');
        const parsedInfo = storedInfo ? JSON.parse(storedInfo) : {};
        if (parsedInfo.fecha_registro) {
            parsedInfo.fecha_registro = new Date(parsedInfo.fecha_registro);
        }
        // Usar solo generatedUserId2 en el formulario
        setNewContact(prev => ({
            ...prev,
            ...parsedInfo,
        }));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stateData, personData, limitsData] = await Promise.all([
                    api.States.getStates(),
                    api.persons.getPersons(),
                    api.contacts.getFieldLimits()
                ]);
                if (stateData && Array.isArray(stateData.data)) {
                    setState(stateData.data);
                } else {
                    console.error("State data is not an array", stateData);
                }
                if (personData && Array.isArray(personData.data)) {
                    setPerson(personData.data);
                } else {
                    console.error("State data is not an array", personData);
                }
                if (limitsData) setLimits(limitsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    showConfirmButton: false,
                    timer: 2000,
                    text: "Error al cargar datos",
                    customClass: {
                        popup: 'swal-z-index'
                    }
                });
            }
        };
        fetchData();
    }, []);

    const resetFormAfterSubmit = () => {
        setNewContact({
            id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
            tipo_contacto: "RESIDENCIAL",
            identificador: "",
            estado: "activo",
            fecha_registro: new Date(),
            comentarios: ""
        });
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.contacts.saveContacts(data);
            localStorage.removeItem('ContactInfo');
            Swal.fire({
                icon: "success",
                title: "Nuevo Contacto",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado a un nuevo contacto",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
            loadAccess();
            resetFormAfterSubmit();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error en contactos",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al registrar el contacto",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const saveContactInfo = (updated: Partial<contactsModel>) => {
        const { id_persona, ...infoToStore } = updated;
        localStorage.setItem('ContactInfo', JSON.stringify(infoToStore));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;

        const updatedValue =
            type === 'date' ? new Date(value) : value;

        const updated = {
            ...newContact,
            [name]: updatedValue,
        };

        setNewContact(updated);
        saveContactInfo(updated);
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof personModel;
        const value = event.target.value;
        const updated = {
            ...newContact,
            [name]: value,
        };
        setNewContact(updated);
        saveContactInfo(updated);
    };

    return (
        <Card>
            <Box p={2}>
                <form id="register-contacts-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.id_persona}>
                                <InputLabel id="idpersona-label">Persona</InputLabel>
                                <Select
                                    error={!!errors.id_persona}
                                    labelId="idpersona-label"
                                    {...register('id_persona', { required: 'Se necesita el usuario' })}
                                    name="id_persona"
                                    value={newContact.id_persona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Persona"
                                    disabled={!!newContact.id_persona}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}

                                >
                                    {Array.isArray(person) && person.map((persons) => (
                                        <MenuItem key={persons.id_persona} value={persons.id_persona}>
                                            {persons.nombre} {persons.primer_apellido} {persons.segundo_apellido}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/* {newContact.id_persona !== undefined && newContact.id_persona >= 0 && (
                                    <FormHelperText>
                                        <Card>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Tipo Identificación:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.tipo_identificacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Número Identificación:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.numero_identifiacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Nacimiento:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.fecha_nacimiento.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Género:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.genero || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado Civil:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.estado_civil || "N/A"}</p>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Nacionalidad:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.nacionalidad || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Registro:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.fecha_registro.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Usuario Registro:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.usuario_registro || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Nivel de Estudios:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.nivel_estudios || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Asesor:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.asesor || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado:</strong> {person.find((p) => p.id_persona === newContact.id_persona)?.estado || "N/A"}</p>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    </FormHelperText>
                                )} */}
                                {errors.id_persona && (
                                    <FormHelperText>{errors.id_persona.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.tipo_contacto}>
                                <InputLabel id="contacto-label">Tipo de Contacto</InputLabel>
                                <Select
                                    error={!!errors.tipo_contacto}
                                    labelId="contacto-label"
                                    label="Tipo de Contacto"
                                    {...register('tipo_contacto')}
                                    name="tipo_contacto"
                                    value={newContact.tipo_contacto?.toString() || ''}
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
                                {errors.tipo_contacto && (
                                    <FormHelperText>{errors.tipo_contacto.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('identificador', {
                                    required: 'Se necesita el identificador', maxLength: {
                                        value: limits.identificador, // fallback si no está disponible
                                        message: `Límite de ${limits.identificador} caracteres excedido`
                                    }
                                })}
                                name="identificador"
                                label="Identificador"
                                value={newContact.identificador?.toString()}
                                onChange={handleInputChange}
                                error={!!errors.identificador}
                                helperText={errors?.identificador?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    {...register('estado')}
                                    name="estado"
                                    value={newContact.estado?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Estado"
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
                                {errors.estado && (
                                    <FormHelperText>{errors.estado.message?.toString()}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro')}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={
                                    newContact.fecha_registro instanceof Date
                                        ? newContact.fecha_registro.toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_registro}
                                helperText={errors?.fecha_registro?.message as string}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('comentarios', {
                                    maxLength: {
                                        value: limits.comentarios,
                                        message: `Límite de ${limits.comentarios} caracteres excedido`
                                    }
                                })}
                                name="comentarios"
                                label="Comentarios"
                                value={newContact.comentarios?.toString()}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
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