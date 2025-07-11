import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { User } from "../../../app/models/user";
import { statesModels } from '../../../app/models/states';
import Swal from 'sweetalert2';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import { personModel } from '../../../app/models/persons';
import { disabilitiesModel } from '../../../app/models/disabilitiesModel';
import { useAppDispatch, useAppSelector } from "../../../store/configureStore";
import '../../../sweetStyles.css';

interface AddPersonProps {
    loadAccess: () => void;
}

export default function RegisterPerson({ loadAccess }: AddPersonProps) {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.account);
    const [users, setUsers] = useState<User[]>([]);
    const [persons, setPersons] = useState<personModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);
    const [disabilitie, setDisabilitie] = useState<disabilitiesModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const personInfo = JSON.parse(localStorage.getItem('PersonInfo') || '{}');

    const [newPerson, setNewPerson] = useState<Partial<personModel>>({
        id_persona: parseInt(localStorage.getItem('generatedUserId2') || "0") || undefined,
        tipo_identificacion: personInfo.tipo_identificacion || "",
        numero_identifiacion: personInfo.numero_identifiacion || "",
        nombre: personInfo.nombre || "",
        primer_apellido: personInfo.primer_apellido || "",
        segundo_apellido: personInfo.segundo_apellido || "",
        fecha_nacimiento: personInfo.fecha_nacimiento ? new Date(personInfo.fecha_nacimiento) : new Date(),
        genero: personInfo.genero || "NO APLICA",
        estado_civil: personInfo.estado_civil || "NO APLICA",
        nacionalidad: personInfo.nacionalidad || "COSTARRICENSE",
        fecha_registro: personInfo.fecha_registro ? new Date(personInfo.fecha_registro) : new Date(),
        usuario_registro: personInfo.usuario_registro || user?.nombre_usuario,
        nivel_estudios: personInfo.nivel_estudios || "NO APLICA",
        asesor: personInfo.asesor || "",
        estado: personInfo.estado || "activo",
        discapacidad: personInfo.discapacidad || "Sin Discapacidad",
    });

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


    const { register, handleSubmit, setError, reset, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        let id1 = localStorage.getItem('generatedUserId');
        let id2 = localStorage.getItem('generatedUserId2');

        const generateNewId = () => Math.floor(100000 + Math.random() * 900000).toString();

        if (!id1) {
            id1 = generateNewId();
            localStorage.setItem('generatedUserId', id1);
        }

        if (!id2) {
            id2 = generateNewId();
            localStorage.setItem('generatedUserId2', id2);
        }

        const storedInfo = localStorage.getItem('PersonInfo');
        const parsedInfo = storedInfo ? JSON.parse(storedInfo) : {};
        if (parsedInfo.fecha_registro) {
            parsedInfo.fecha_registro = new Date(parsedInfo.fecha_registro);
        }
        if (parsedInfo.fecha_nacimiento) {
            parsedInfo.fecha_nacimiento = new Date(parsedInfo.fecha_nacimiento);
        }

        // Usar solo generatedUserId2 en el formulario
        setNewPerson(prev => ({
            ...prev,
            ...parsedInfo,
            id_persona: parseInt(localStorage.getItem('generatedUserId2') || "0"),
        }));
    }, []);

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
        const newId = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('generatedUserId2', newId);

        const resetData = {
            id_persona: parseInt(newId),
            tipo_identificacion: "",
            numero_identifiacion: "",
            nombre: "",
            primer_apellido: "",
            segundo_apellido: "",
            fecha_nacimiento: new Date(),
            genero: "NO APLICA",
            estado_civil: "NO APLICA",
            nacionalidad: "COSTARRICENSE",
            fecha_registro: new Date(),
            usuario_registro: user?.nombre_usuario,
            nivel_estudios: "NO APLICA",
            asesor: "",
            estado: "activo",
            discapacidad: "Sin Discapacidad"
        };
        setNewPerson(resetData);
        reset(resetData)
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.persons.savePersons(data);
            if (data.id_persona) {
                localStorage.setItem('generatedUserId', data.id_persona.toString());
            }
            localStorage.removeItem('generatedUserId2');
            localStorage.removeItem('PersonInfo');
            Swal.fire({
                icon: "success",
                title: "Nueva Persona",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado a una nueva persona",
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
                title: "Error en personas",
                showConfirmButton: false,
                timer: 2000,
                text: "Error al registrar a la persona",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const savePersonInfo = (updated: Partial<personModel>) => {
        const { id_persona, ...infoToStore } = updated;
        localStorage.setItem('PersonInfo', JSON.stringify(infoToStore));
    };


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;

        const updatedValue =
            type === 'date' ? new Date(value) : value;

        const updated = {
            ...newPerson,
            [name]: updatedValue,
        };

        setNewPerson(updated);
        savePersonInfo(updated);
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof personModel;
        const value = event.target.value;
        const updated = {
            ...newPerson,
            [name]: value,
        };
        setNewPerson(updated);
        savePersonInfo(updated);
    };

    const getFormattedDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <Card>
            <Box p={2}>
                <form id="register-person-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={4} sx={{ display: 'none' }}>
                            <TextField
                                fullWidth
                                {...register('id_persona', { required: 'Se necesita verificar el id de la persona' })}
                                name="id_persona"
                                label="Numero de Usuario"
                                value={newPerson.id_persona?.toString() || ''}
                                error={!!errors.id_persona}
                                helperText={errors?.id_persona?.message as string}
                                InputProps={{
                                    readOnly: true, // El usuario no puede editar manualmente el ID
                                }}
                            />
                        </Grid>
                        <Grid item xs={4} >
                            <FormControl fullWidth error={!!errors.tipo_identificacion}>
                                <InputLabel id="tipo-identificacion-label">Tipo de Identificación</InputLabel>
                                <Select
                                    error={!!errors.tipo_identificacion}
                                    labelId="tipo-identificacion-label"
                                    label="Tipo de Identificación"
                                    {...register('tipo_identificacion', { required: 'Se necesita el tipo de identificacion' })}
                                    name="tipo_identificacion"
                                    value={newPerson.tipo_identificacion?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="CEDULA NACIONAL">CÉDULA NACIONAL</MenuItem>
                                    <MenuItem value="PASAPORTE">PASAPORTE</MenuItem>
                                    <MenuItem value="EXTRANGERO">EXTRANGERO</MenuItem>
                                </Select>
                                {errors.tipo_identificacion && (
                                    <FormHelperText>{errors.tipo_identificacion.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
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
                                value={newPerson.numero_identifiacion?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.numero_identificacion}
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
                                value={newPerson.nombre?.toString() || ''}
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
                                value={newPerson.primer_apellido?.toString() || ''}
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
                                value={newPerson.segundo_apellido?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.segundo_apellido}
                                helperText={errors?.segundo_apellido?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_nacimiento', { required: 'Se necesita la fecha de nacimiento' })}
                                type="date"
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                                value={
                                    newPerson.fecha_nacimiento
                                        ? new Date(newPerson.fecha_nacimiento).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_nacimiento}
                                helperText={errors?.fecha_nacimiento?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3} sx={{ display: 'none' }}>
                            <TextField
                                fullWidth
                                {...register('fecha_registro', { required: 'Se necesita la fecha de registro' })}
                                type="date"
                                name="fecha_registro"
                                label="Fecha de Registro"
                                value={
                                    newPerson.fecha_registro instanceof Date
                                        ? newPerson.fecha_registro.toISOString().split('T')[0]
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
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.genero}>
                                <InputLabel id="genero-label">Genero</InputLabel>
                                <Select
                                    error={!!errors.genero}
                                    labelId="genero-label"
                                    label="Genero"
                                    {...register('genero', { required: 'Se necesita el genero' })}
                                    name="genero"
                                    value={newPerson.genero?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="MASCULINO">MASCULINO</MenuItem>
                                    <MenuItem value="FEMENINO">FEMENINO</MenuItem>
                                    <MenuItem value="NO APLICA">NO APLICA</MenuItem>
                                </Select>
                                {errors.genero && (
                                    <FormHelperText>{errors.genero.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.estado_civil}>
                                <InputLabel id="estadoCivil-label">Estado Civil</InputLabel>
                                <Select
                                    error={!!errors.estado_civil}
                                    labelId="estadoCivil-label"
                                    label="Estado Civil"
                                    {...register('estado_civil', { required: 'Se necesita el estado civil' })}
                                    name="estado_civil"
                                    value={newPerson.estado_civil?.toString() || ''}
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
                                {errors.estado_civil && (
                                    <FormHelperText>{errors.estado_civil.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <Autocomplete
                                disablePortal
                                options={nacionalidades}
                                value={newPerson.nacionalidad || ''}
                                onChange={(event, newValue) => {
                                    const updated = {
                                        ...newPerson,
                                        nacionalidad: newValue || '',
                                    };
                                    setNewPerson(updated);
                                    savePersonInfo(updated);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Nacionalidad"
                                        {...register('nacionalidad', {
                                            required: 'Se necesita especificar la nacionalidad'
                                        })}
                                        error={!!errors.nacionalidad}
                                        helperText={errors?.nacionalidad?.message as string}
                                        name="nacionalidad"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Autocomplete
                                disablePortal
                                options={users.map(u => u.nombre_usuario)}
                                value={newPerson.usuario_registro || ''}
                                onChange={(event, newValue) => {
                                    const updated = {
                                        ...newPerson,
                                        usuario_registro: newValue || '',
                                    };
                                    setNewPerson(updated);
                                    savePersonInfo(updated);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Usuario"
                                        {...register('usuario_registro')}
                                        name="usuario_registro"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.nivel_estudios}>
                                <InputLabel id="estudios-label">Nivel de Estudios</InputLabel>
                                <Select
                                    error={!!errors.nivel_estudios}
                                    labelId="estudios-label"
                                    label="Nivel de Estudios"
                                    {...register('nivel_estudios')}
                                    name="nivel_estudios"
                                    value={newPerson.nivel_estudios?.toString() || ''}
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
                                {errors.nivel_estudios && (
                                    <FormHelperText>{errors.nivel_estudios.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    {...register('estado')}
                                    name="estado"
                                    value={newPerson.estado?.toString() || ""}
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
                                    <FormHelperText>{errors.estado.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                {...register('asesor', {
                                    maxLength: {
                                        value: limits.asesor,
                                        message: `Límite de ${limits.asesor} caracteres excedido`
                                    }
                                })}
                                name="asesor"
                                label="Contacto"
                                value={newPerson.asesor?.toString() || ""}
                                onChange={handleInputChange}
                                error={!!errors.asesor}
                                helperText={errors?.asesor?.message as string}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Autocomplete
                                disablePortal
                                options={disabilitie.map((d) => d.nombre)}
                                value={newPerson.discapacidad || ''}
                                onChange={(event, newValue) => {
                                    const updated = {
                                        ...newPerson,
                                        discapacidad: newValue || '',
                                    };
                                    setNewPerson(updated);
                                    savePersonInfo(updated);
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
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}