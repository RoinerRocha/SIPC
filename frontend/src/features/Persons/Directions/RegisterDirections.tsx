import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { statesModels } from '../../../app/models/states';
import { personModel } from '../../../app/models/persons';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from "../../../store/configureStore";
import { directionsModel } from '../../../app/models/directionsModel';
import { provinceModel } from '../../../app/models/provinceModel';
import { cantonModel } from '../../../app/models/cantonModel';
import { districtModel } from '../../../app/models/districtModel';
import { neighborhoodModel } from '../../../app/models/neighborhoodModel';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface AddDirectionProps {
    loadAccess: () => void;
}

export default function RegisterDirections({ loadAccess }: AddDirectionProps) {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.account);
    const [state, setState] = useState<statesModels[]>([]);
    const [person, setPerson] = useState<personModel[]>([]);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [provinces, setProvinces] = useState<provinceModel[]>([]);
    const [cantons, setCantons] = useState<cantonModel[]>([]);
    const [districts, setDistricts] = useState<districtModel[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<neighborhoodModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedCanton, setSelectedCanton] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const DirectionInfo = JSON.parse(localStorage.getItem('DirectionInfo') || '{}');
    const [newDirection, setNewDirection] = useState<Partial<directionsModel>>({
        id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        provincia: DirectionInfo.provincia || "",
        canton: DirectionInfo.canton || "",
        distrito: DirectionInfo.distrito || "",
        barrio: DirectionInfo.barrio || "",
        otras_senas: DirectionInfo.otras_senas || "",
        tipo_direccion: DirectionInfo.tipo_direccion || "DOMICILIO",
        estado: DirectionInfo.estado || "activo",
    });
    const { register, handleSubmit, setValue, setError, reset, control, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {

        const storedInfo = localStorage.getItem('DirectionInfo');
        const parsedInfo = storedInfo ? JSON.parse(storedInfo) : {};

        setNewDirection(prev => ({
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
                    api.directions.getFieldLimits()
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

    useEffect(() => {
        const fetchProvinces = async () => {
            const response = await api.Ubications.getAllProvinces();
            setProvinces(response.data);
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            api.Ubications.getCantonByProvince(selectedProvince).then((response) => {
                setCantons(response.data);
                setDistricts([]);
                setNeighborhoods([]);
                setSelectedCanton(null);
                setSelectedDistrict(null);
            });
        }
    }, [selectedProvince]);


    useEffect(() => {
        if (selectedProvince && selectedCanton) {
            api.Ubications.getDistrictByProvinciaCanton(selectedProvince, selectedCanton).then((response) => {
                setDistricts(response.data);
                setNeighborhoods([]);
                setSelectedDistrict(null);
            });
        }
    }, [selectedCanton]);

    useEffect(() => {
        if (selectedProvince && selectedCanton && selectedDistrict) {
            api.Ubications.getNeighborhoodByProvinciaCantonDistrict(
                selectedProvince,
                selectedCanton,
                selectedDistrict
            ).then((response) => {
                setNeighborhoods(response.data);
            });
        }
    }, [selectedDistrict]);

    const resetFormAfterSubmit = () => {
        const resetData = {
            id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
            provincia: "",
            canton: "",
            distrito: "",
            barrio: "",
            otras_senas: "",
            tipo_direccion: "DOMICILIO",
            estado: "activo",
        };
        setNewDirection(resetData);
        reset(resetData)

        // Limpiar selects dependientes
        setSelectedProvince(null);
        setSelectedCanton(null);
        setSelectedDistrict(null);

        // También opcionalmente limpiar dropdowns
        setCantons([]);
        setDistricts([]);
        setNeighborhoods([]);

        // Limpiar manualmente valores registrados en el formulario (opcional)
        setValue("provincia", "");
        setValue("canton", "");
        setValue("distrito", "");
        setValue("barrio", "");
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.directions.saveDirections(data);
            localStorage.removeItem('DirectionInfo');
            Swal.fire({
                icon: "success",
                title: "Nueva Direccion",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado una nueva Direccion",
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
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha generado un error al agregar la Direccion",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };
    const saveDirectionInfo = (updated: Partial<directionsModel>) => {
        const { id_direccion, ...infoToStore } = updated;
        localStorage.setItem('DirectionInfo', JSON.stringify(infoToStore));
    };
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        const updated = {
            ...newDirection,
            [name]: value,
        };
        setNewDirection(updated);
        saveDirectionInfo(updated); // ← GUARDA EN LOCALSTORAGE
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof directionsModel;
        const value = event.target.value;
        const updated = {
            ...newDirection,
            [name]: value,
        };
        setNewDirection(updated);
        saveDirectionInfo(updated); // ← GUARDA EN LOCALSTORAGE
    };

    const handleProvinceChange = (event: SelectChangeEvent<number>) => {
        const provinceId = event.target.value.toString(); // ← conversión aquí
        setSelectedProvince(Number(provinceId));
        setValue("provincia", provinceId);

        const updated = {
            ...newDirection,
            provincia: provinceId,
        };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };
    const handleCantonChange = (event: SelectChangeEvent<number>) => {
        const cantonId = event.target.value.toString();
        setSelectedCanton(Number(cantonId));
        setValue("canton", cantonId);

        const updated = {
            ...newDirection,
            canton: cantonId,
        };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };


    const handleDistrictChange = (event: SelectChangeEvent<number>) => {
        const districtId = event.target.value.toString();
        setSelectedDistrict(Number(districtId));
        setValue("distrito", districtId);

        const updated = {
            ...newDirection,
            distrito: districtId,
        };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };


    const handleNeighborhoodChange = (event: SelectChangeEvent<number>) => {
        const neighborhoodId = event.target.value.toString();
        setValue("barrio", neighborhoodId);

        const updated = {
            ...newDirection,
            barrio: neighborhoodId,
        };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };

    const onProvinceChange = (event: any, option: provinceModel | null) => {
        setSelectedProvince(option ? option.provincia : null);
        setSelectedCanton(null);
        setSelectedDistrict(null);
        setNeighborhoods([]);

        setValue('provincia', option ? option.provincia : '');
        setValue('canton', '');
        setValue('distrito', '');
        setValue('barrio', '');

        const updated = { ...newDirection, provincia: option ? option.provincia.toString() : '' };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };

    const onCantonChange = (event: any, option: cantonModel | null) => {
        setSelectedCanton(option ? option.canton : null);
        setSelectedDistrict(null);
        setNeighborhoods([]);

        setValue('canton', option ? option.canton : '');
        setValue('distrito', '');
        setValue('barrio', '');

        const updated = { ...newDirection, canton: option ? option.canton.toString() : '' };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };

    const onDistrictChange = (event: any, option: districtModel | null) => {
        setSelectedDistrict(option ? option.distrito : null);

        setValue('distrito', option ? option.distrito : '');
        setValue('barrio', '');

        const updated = { ...newDirection, distrito: option ? option.distrito.toString() : '' };
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };

    const onNeighborhoodChange = (event: any, option: neighborhoodModel | null) => {
        setValue('barrio', option ? option.barrio : '');

        const updated = { ...newDirection, barrio: option ? option.barrio.toString() : ''};
        setNewDirection(updated);
        saveDirectionInfo(updated);
    };

    return (
        <Card>
            <Box p={2}>
                <form id="register-directions-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.id_persona}>
                                <InputLabel id="idpersona-label">Persona</InputLabel>
                                <Select
                                    error={!!errors.id_persona}
                                    labelId="idpersona-label"
                                    {...register('id_persona', { required: 'Se necesita una persona' })}
                                    name="id_persona"
                                    value={newDirection.id_persona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Persona"
                                    disabled={!!newDirection.id_persona}
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
                                {/* {newDirection.id_persona !== undefined && newDirection.id_persona >= 0 && (
                                    <FormHelperText>
                                        <Card>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Tipo Identificación:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.tipo_identificacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Número Identificación:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.numero_identifiacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Nacimiento:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.fecha_nacimiento.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Género:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.genero || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado Civil:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.estado_civil || "N/A"}</p>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Nacionalidad:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.nacionalidad || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Registro:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.fecha_registro.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Usuario Registro:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.usuario_registro || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Nivel de Estudios:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.nivel_estudios || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Asesor:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.asesor || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado:</strong> {person.find((p) => p.id_persona === newDirection.id_persona)?.estado || "N/A"}</p>
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
                            <Controller
                                control={control}
                                name="provincia"
                                rules={{ required: 'Seleccione una provincia' }}
                                render={({ fieldState }) => (
                                    <Autocomplete
                                        options={provinces}
                                        getOptionLabel={(opt) => opt.nombre}
                                        value={provinces.find((p) => p.provincia === selectedProvince) || null}
                                        onChange={onProvinceChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Provincia"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Controller
                                control={control}
                                name="canton"
                                rules={{ required: 'Seleccione un cantón' }}
                                render={({ fieldState }) => (
                                    <Autocomplete
                                        options={cantons}
                                        getOptionLabel={(opt) => opt.nombre}
                                        value={cantons.find((c) => c.canton === selectedCanton) || null}
                                        onChange={onCantonChange}
                                        disabled={!selectedProvince}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Cantón"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Controller
                                control={control}
                                name="distrito"
                                rules={{ required: 'Seleccione un distrito' }}
                                render={({ fieldState }) => (
                                    <Autocomplete
                                        options={districts}
                                        getOptionLabel={(opt) => opt.nombre}
                                        value={districts.find((d) => d.distrito === selectedDistrict) || null}
                                        onChange={onDistrictChange}
                                        disabled={!selectedCanton}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Distrito"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Controller
                                control={control}
                                name="barrio"
                                rules={{ required: 'Seleccione un barrio' }}
                                render={({ fieldState }) => (
                                    <Autocomplete
                                        options={neighborhoods}
                                        getOptionLabel={(opt) => opt.nombre}
                                        onChange={onNeighborhoodChange}
                                        disabled={!selectedDistrict}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Barrio"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth error={!!errors.tipo_direccion}>
                                <InputLabel id="direccion-label">Tipo de Direccion</InputLabel>
                                <Select
                                    error={!!errors.tipo_direccion}
                                    labelId="direccion-label"
                                    label="Tipo de Direccion"
                                    {...register('tipo_direccion')}
                                    name="tipo_direccion"
                                    value={newDirection.tipo_direccion?.toString() || ''}
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
                                    <MenuItem value="DOMICILIO">DOMICILIO</MenuItem>
                                    <MenuItem value="TRABAJO">TRABAJO</MenuItem>
                                    <MenuItem value="OFICINA">OFICINA</MenuItem>
                                </Select>
                                {errors.tipo_direccion && (
                                    <FormHelperText>{errors.tipo_direccion.message?.toString()}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth error={!!errors.estado}>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    error={!!errors.estado}
                                    labelId="estado-label"
                                    {...register('estado')}
                                    name="estado"
                                    value={newDirection.estado?.toString() || ""}
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
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('otras_senas', {
                                    maxLength: {
                                        value: limits.otras_senas, // fallback si no está disponible
                                        message: `Límite de ${limits.otras_senas} caracteres excedido`
                                    }
                                })}
                                name="otras_senas"
                                label="Otras Señas"
                                value={newDirection.otras_senas?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                                error={!!errors.otras_senas}
                                helperText={errors?.otras_senas?.message as string}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}