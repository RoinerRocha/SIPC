import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { statesModels } from '../../../app/models/states';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { contactsModel } from '../../../app/models/contactsModel';
import { personModel } from '../../../app/models/persons';

interface AddSContactProps {
    loadAccess: () => void;
}

export default function RegisterContacts({ loadAccess }: AddSContactProps) {
    const navigate = useNavigate();
    const [state, setState] = useState<statesModels[]>([]);
    const [person, setPerson] = useState<personModel[]>([]);

    const [newContact, setNewContact] = useState<Partial<contactsModel>>({
        id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        tipo_contacto: "",
        identificador: "",
        estado: "",
        fecha_registro: new Date(),
        comentarios: "",
    });
    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stateData, personData] = await Promise.all([
                    api.States.getStates(),
                    api.persons.getPersons()
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
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(t('Activo-toast-errror'));
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.contacts.saveContacts(data);
            toast.success("Contacto registrado exitosamente");
            loadAccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar el contacto");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewContact((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof contactsModel;
        const value = event.target.value;
        setNewContact((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="idpersona-label">Persona</InputLabel>
                                <Select
                                    labelId="idpersona-label"
                                    {...register('id_persona', { required: 'Se necesita el id' })}
                                    name="id_persona"
                                    value={newContact.id_persona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Seleccionar el id de la persona"
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
                                {newContact.id_persona !== undefined && newContact.id_persona >= 0 && (
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
                                )}
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="contacto-label">Tipo de Contacto</InputLabel>
                                <Select
                                    labelId="contacto-label"
                                    {...register('tipo_contacto', { required: 'Se necesita el tipo de contacto' })}
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
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('identificador', { required: 'Se necesita el identificador' })}
                                name="identificador"
                                label="Identificador"
                                value={newContact.identificador?.toString()}
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
                                    value={newContact.estado?.toString() || ""}
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
                                value={newContact.fecha_registro?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('comentarios', { required: 'Se necesita un comentario' })}
                                name="comentarios"
                                label="Comentarios"
                                value={newContact.comentarios?.toString()}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                        <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                            Agregar
                        </Button>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}