import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import api from '../../../app/api/api';
import { User } from '../../../app/models/user';
import { statesModels } from '../../../app/models/states';
import { useEffect, useState } from 'react';
import { personModel } from '../../../app/models/persons';
import { disabilitiesModel } from '../../../app/models/disabilitiesModel';
import { useAppDispatch, useAppSelector } from "../../../store/configureStore";
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface UpdatePersonProps {
    person: personModel;
    loadAccess: () => void;
}

export default function UpdatePerson({ person, loadAccess }: UpdatePersonProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [users, setUsers] = useState<User[]>([]);
    const [persons, setPersons] = useState<personModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);
    const [disabilitie, setDisabilitie] = useState<disabilitiesModel[]>([]);
    const { user } = useAppSelector(state => state.account);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const [currentPerson, setCurrentPerson] = useState<Partial<personModel>>(person);
    console.log(person.id_persona)
    const nacionalidades = [
        "COSTARRICENSE", "EGIPCIA", "SUDAFRICANA", "NIGERIANA", "MARROQUI",
        "KENIANA", "ETIOPE", "GHANESA", "TANZANA", "ANGOLEA", "SENEGALESA",
        "ESTADOUNIDENSE", "CANADIENSE", "MEXICANA", "BRASILENA", "ARGENTINA",
        "COLOMBIANA", "CHILENA", "PERUANA", "VENEZOLANA", "CUBANA", "CHINA",
        "JAPONESA", "INDIA", "SAUDI", "COREANA", "FILIPINA", "TAILANDESA",
        "VIETNAMITA", "INDONESIA", "IRAQUI", "ESPANOLA", "FRANCESA", "ALEMANA",
        "ITALIANA", "BRITANICA", "PORTUGUESA", "RUSA", "GRIEGA", "SUECA", "NORUEGA",
        "AUSTRALIANA", "NEOZELANDESA", "FIJIANA", "SAMOANA", "TONGANA", "PAPU",
        "PALESTINA", "PUERTORRIQUENA", "GROENLANDESA", "HAWAIANA"
    ];
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, personData, stateData, disabilitieData, limitsData] = await Promise.all([
                    api.Account.getAllUser(),
                    api.persons.getPersons(),
                    api.States.getStates(),
                    api.persons.getAllDisabilities(),
                    api.persons.getFieldLimits()
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (userData && Array.isArray(userData.data)) {
                    setUsers(userData.data);
                } else {
                    console.error("User data is not an array", userData);
                }

                if (personData && Array.isArray(personData.data)) {
                    setPersons(personData.data);
                } else {
                    console.error("Persons data is not an array", userData);
                }
                if (stateData && Array.isArray(stateData.data)) {
                    setState(stateData.data);
                } else {
                    console.error("States data is not an array", userData);
                }
                if (disabilitieData && Array.isArray(disabilitieData.data)) {
                    setDisabilitie(disabilitieData.data);
                } else {
                    console.error("States data is not an array", disabilitieData);
                }
                if (limitsData) setLimits(limitsData);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: FieldValues) => {
        if (!currentPerson || !user?.nombre_usuario) return;

        const result = await Swal.fire({
            title: '¿Desea actualizar los datos de esta persona?',
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
                await api.persons.updatePersons(currentPerson.id_persona, user.nombre_usuario, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Persona actualizada con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar la persona:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar la persona.',
                    confirmButtonText: 'Cerrar'
                });
            }
        } else if (result.isDenied) {
            await Swal.fire({
                icon: 'info',
                title: 'Actualización cancelada',
                text: 'No se realizaron cambios.',
                showConfirmButton: false,
                timer: 2000
            });
        }
        // Si presiona "Cancelar", simplemente no hace nada.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentPerson((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentPerson((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form id="update-person-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        {/* <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('id_persona', { required: 'Se necesita el numero de identificacion' })}
                                name="id_persona"
                                label="ID de persona"
                                value={currentPerson.id_persona?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid> */}
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-identificacion-label">Tipo de Identificación</InputLabel>
                                <Select
                                    labelId="tipo-identificacion-label"
                                    {...register('tipo_identificacion', { required: 'Se necesita el tipo de identificacion' })}
                                    name="tipo_identificacion"
                                    label="Tipo de Identificación"
                                    value={currentPerson.tipo_identificacion || ''}
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value="CEDULA NACIONAL">CÉDULA NACIONAL</MenuItem>
                                    <MenuItem value="PASAPORTE">PASAPORTE</MenuItem>
                                    <MenuItem value="EXTRANJERO">EXTRANJERO</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('numero_identifiacion', {
                                    required: 'Se necesita el numero de identificacion',
                                    maxLength: {
                                        value: limits.numero_identifiacion,
                                        message: `Límite de ${limits.numero_identifiacion} caracteres excedido`
                                    }
                                })}
                                name="numero_identifiacion"
                                label="Numero de Identificacion"
                                value={currentPerson.numero_identifiacion?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.numero_identifiacion}
                                helperText={errors?.numero_identifiacion?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('nombre', {
                                    required: 'Se necesita el nombre',
                                    maxLength: {
                                        value: limits.nombre,
                                        message: `Límite de ${limits.nombre} caracteres excedido`
                                    }
                                })}
                                name="nombre"
                                label="Nombre"
                                value={currentPerson.nombre?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.nombre}
                                helperText={errors?.nombre?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('primer_apellido', {
                                    required: 'Se necesita el primer apellido',
                                    maxLength: {
                                        value: limits.primer_apellido,
                                        message: `Límite de ${limits.primer_apellido} caracteres excedido`
                                    }
                                })}
                                name="primer_apellido"
                                label="Primer Apellido"
                                value={currentPerson.primer_apellido?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.primer_apellido}
                                helperText={errors?.primer_apellido?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('segundo_apellido', {
                                    required: 'Se necesita el segundo apellido',
                                    maxLength: {
                                        value: limits.segundo_apellido,
                                        message: `Límite de ${limits.segundo_apellido} caracteres excedido`
                                    }
                                })}
                                name="segundo_apellido"
                                label="Segundo Apellido"
                                value={currentPerson.segundo_apellido?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.segundo_apellido}
                                helperText={errors?.segundo_apellido?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('fecha_nacimiento', { required: 'Se necesita la fecha de nacimiento' })}
                                type="date"
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                                value={currentPerson.fecha_nacimiento?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_nacimiento}
                                helperText={errors?.fecha_nacimiento?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro', { required: 'Se necesita la fecha de registro' })}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={currentPerson.fecha_registro?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_registro}
                                helperText={errors?.fecha_registro?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="genero-label">Genero</InputLabel>
                                <Select
                                    labelId="genero-label"
                                    {...register('genero', { required: 'Se necesita el genero' })}
                                    name="genero"
                                    label="Genero"
                                    value={currentPerson.genero?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="MASCULINO">MASCULINO</MenuItem>
                                    <MenuItem value="FEMENINO">FEMENINO</MenuItem>
                                    <MenuItem value="NO APLICA">NO APLICA</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="estadoCivil-label">Estado Civil</InputLabel>
                                <Select
                                    labelId="estadoCivil-label"
                                    {...register('estado_civil', { required: 'Se necesita el estado civil' })}
                                    name="estado_civil"
                                    label="Estado Civil"
                                    value={currentPerson.estado_civil?.toString() || ''}
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
                                    <MenuItem value="NO APLICA">NO APLICA</MenuItem>
                                    <MenuItem value="SOLTERO(A)">SOLTERO(A)</MenuItem>
                                    <MenuItem value="CASADO(A)">CASADO(A)</MenuItem>
                                    <MenuItem value="DIVORCIADO(A)">DIVORCIADO(A)</MenuItem>
                                    <MenuItem value="VIUDO(A)">VIUDO(A)</MenuItem>
                                    <MenuItem value="UNION LIBRE">UNION LIBRE</MenuItem>
                                    <MenuItem value="UNION DE HECHO">UNION DE HECHO</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <Autocomplete
                                disablePortal
                                options={nacionalidades}
                                value={currentPerson.nacionalidad || ''}
                                onChange={(event, newValue) => {
                                    setCurrentPerson((prev) => ({
                                        ...prev,
                                        nacionalidad: newValue || '',
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Nacionalidad"
                                        {...register('nacionalidad', {
                                            required: 'Se necesita especificar la nacionalidad',
                                        })}
                                        error={!!errors.nacionalidad}
                                        helperText={errors?.nacionalidad?.message as string}
                                        name="nacionalidad"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="usuario-label">Usuarios</InputLabel>
                                <Select
                                    labelId="usuario-label"
                                    {...register('usuario_registro')}
                                    name="usuario_registro"
                                    value={currentPerson.usuario_registro?.toString() || ''}
                                    onChange={handleSelectChange}
                                    label="Seleccionar Usuario"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}

                                >
                                    {Array.isArray(users) && users.map((user) => (
                                        <MenuItem key={user.id} value={user.nombre_usuario}>
                                            {user.nombre_usuario}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="estudios-label">Nivel de Estudios</InputLabel>
                                <Select
                                    labelId="estudios-label"
                                    {...register('nivel_estudios')}
                                    name="nivel_estudios"
                                    label="Nivel de Estudios"
                                    value={currentPerson.nivel_estudios?.toString() || ''}
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
                                    <MenuItem value="NO APLICA">NO APLICA</MenuItem>
                                    <MenuItem value="PRIMARIA">PRIMARIA</MenuItem>
                                    <MenuItem value="SECUNDARIA">SECUNDARIA</MenuItem>
                                    <MenuItem value="TECNICO">TECNICO</MenuItem>
                                    <MenuItem value="UNIVERSITARIO">UNIVERSITARIO</MenuItem>
                                    <MenuItem value="POSGRADO">POSGRADO</MenuItem>
                                    <MenuItem value="LICENCIATURA">LICENCIATURA</MenuItem>
                                    <MenuItem value="MAESTRIA">MAESTRIA</MenuItem>
                                    <MenuItem value="DOCTORADO">DOCTORADO</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado')}
                                    name="estado"
                                    value={currentPerson.estado?.toString() || ""}
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
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('asesor', {
                                    maxLength: {
                                        value: limits.asesor,
                                        message: `Límite de ${limits.asesor} caracteres excedido`
                                    }
                                })}
                                name="asesor"
                                label="Asesor"
                                value={currentPerson.asesor?.toString() || ""}
                                onChange={handleInputChange}
                                error={!!errors.asesor}
                                helperText={errors?.asesor?.message as string}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                disablePortal
                                options={disabilitie.map((d) => d.nombre)}
                                value={currentPerson.discapacidad || ''}
                                onChange={(event, newValue) => {
                                    setCurrentPerson((prev) => ({
                                        ...prev,
                                        discapacidad: newValue || '',
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Discapacidad"
                                        {...register('discapacidad', {
                                            required: 'Se necesita especificar la discapacidad'
                                        })}
                                        error={!!errors.discapacidad}
                                        helperText={errors?.discapacidad?.message as string}
                                        name="discapacidad"
                                    />
                                )}
                            />
                        </Grid>
                        {/* Similar fields for the rest of the properties */}
                    </Grid>
                </form>
            </Box>
        </Card>
    );
}
