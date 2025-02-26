import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { statesModels } from '../../../app/models/states';
import { personModel } from '../../../app/models/persons';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from "../../../store/configureStore";
import { directionsModel } from '../../../app/models/directionsModel';
import { provinceModel } from '../../../app/models/provinceModel';
import { cantonModel } from '../../../app/models/cantonModel';
import { districtModel } from '../../../app/models/districtModel';
import { neighborhoodModel } from '../../../app/models/neighborhoodModel';

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

    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedCanton, setSelectedCanton] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [newDirection, setNewDirection] = useState<Partial<directionsModel>>({
        id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        provincia: "",
        canton: "",
        distrito: "",
        barrio: "",
        otras_senas: "",
        tipo_direccion: "",
        estado: "",
    });
    const { register, handleSubmit, setValue, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
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


    const onSubmit = async (data: FieldValues) => {
        try {
            await api.directions.saveDirections(data);
            toast.success("Direccion creada exitosamente");
            loadAccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear la direccion");
        }
    };
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewDirection((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof directionsModel;
        const value = event.target.value;
        setNewDirection((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleProvinceChange = (event: SelectChangeEvent<number>) => {
        const provinceId = Number(event.target.value);
        setSelectedProvince(provinceId);
        setValue("provincia", provinceId);
    };

    const handleCantonChange = (event: SelectChangeEvent<number>) => {
        const cantonId = Number(event.target.value);
        setSelectedCanton(cantonId);
        setValue("canton", cantonId);
    };

    const handleDistrictChange = (event: SelectChangeEvent<number>) => {
        const districtId = Number(event.target.value);
        setSelectedDistrict(districtId);
        setValue("distrito", districtId);
    };

    const handleNeighborhoodChange = (event: SelectChangeEvent<number>) => {
        const neighborhoodId = Number(event.target.value);
        setValue("barrio", neighborhoodId);
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
                                    value={newDirection.id_persona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Seleccionar el id de la persona"
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
                                {newDirection.id_persona !== undefined && newDirection.id_persona >= 0 && (
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
                                )}
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="provincia-label">Provincia</InputLabel>
                                <Select
                                    labelId="provincia-label"
                                    value={selectedProvince || ""}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                    {...register("provincia", {
                                        required: "Seleccione una provincia",
                                        onChange: (event) => handleProvinceChange(event)
                                    })}
                                >
                                    {provinces.map((province) => (
                                        <MenuItem key={province.provincia} value={province.provincia}>
                                            {province.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.provincia && <FormHelperText>{errors.provincia.message?.toString()}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth disabled={!selectedProvince}>
                                <InputLabel id="canton-label">Cantón</InputLabel>
                                <Select
                                    labelId="canton-label"
                                    value={selectedCanton || ""}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                    {...register("canton", {
                                        required: "Seleccione un cantón",
                                        onChange: (event) => handleCantonChange(event),
                                    })}
                                >
                                    {cantons.map((canton) => (
                                        <MenuItem key={canton.canton} value={canton.canton}>
                                            {canton.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.canton && (
                                    <FormHelperText>{errors.canton.message?.toString()}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth disabled={!selectedCanton}>
                                <InputLabel id="distrito-label">Distrito</InputLabel>
                                <Select
                                    labelId="distrito-label"
                                    value={selectedDistrict || ""}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                    {...register("distrito", {
                                        required: "Seleccione un distrito",
                                        onChange: (event) => handleDistrictChange(event),
                                    })}
                                >
                                    {districts.map((district) => (
                                        <MenuItem key={district.distrito} value={district.distrito}>
                                            {district.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.distrito && (
                                    <FormHelperText>{errors.distrito.message?.toString()}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth disabled={!selectedDistrict}>
                                <InputLabel id="barrio-label">Barrio</InputLabel>
                                <Select
                                    labelId="barrio-label"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Limita la altura del menú desplegable
                                                width: 250,
                                            },
                                        },
                                    }}
                                    {...register("barrio", {
                                        required: "Seleccione un barrio",
                                        onChange: (event) => handleNeighborhoodChange(event),
                                    })}
                                >
                                    {neighborhoods.map((neighborhood) => (
                                        <MenuItem key={neighborhood.barrio} value={neighborhood.barrio}>
                                            {neighborhood.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.barrio && (
                                    <FormHelperText>{errors.barrio.message?.toString()}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('otras_senas', { required: 'Se necesitan otras señas' })}
                                name="otras_senas"
                                label="Otras Señas"
                                value={newDirection.otras_senas?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="direccion-label">Tipo de Direccion</InputLabel>
                                <Select
                                    labelId="direccion-label"
                                    {...register('tipo_direccion', { required: 'Se necesita el tipo de estudio' })}
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
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newDirection.estado?.toString() || ""}
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
                        <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                            Agregar
                        </Button>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}