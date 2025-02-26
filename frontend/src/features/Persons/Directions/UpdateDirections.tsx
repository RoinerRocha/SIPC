import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { User } from '../../../app/models/user';
import { statesModels } from '../../../app/models/states';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { directionsModel } from '../../../app/models/directionsModel';
import { provinceModel } from '../../../app/models/provinceModel';
import { cantonModel } from '../../../app/models/cantonModel';
import { districtModel } from '../../../app/models/districtModel';
import { neighborhoodModel } from '../../../app/models/neighborhoodModel';


interface UpdateDirectionProps {
    direction: directionsModel;
    loadAccess: () => void;
}

export default function UpdateDirection({ direction, loadAccess }: UpdateDirectionProps) {
    const navigate = useNavigate();

    const [provinces, setProvinces] = useState<provinceModel[]>([]);
    const [cantons, setCantons] = useState<cantonModel[]>([]);
    const [districts, setDistricts] = useState<districtModel[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<neighborhoodModel[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedCanton, setSelectedCanton] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [directions, setDirections] = useState<directionsModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);

    const [currentDirection, setCurrentDirection] = useState<Partial<directionsModel>>(direction);


    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (direction) {
            setCurrentDirection(direction);
            console.log("currentDirection set:", direction);
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
    }, [direction]);

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
        if (currentDirection) {
            try {
                await api.directions.updateDirections(currentDirection.id_direccion, data);
                toast.success('Direccion actualizada con éxito.');
                loadAccess();
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar la persona.');
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentDirection((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentDirection((prev) => ({
            ...prev,
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
                                value={currentDirection.otras_senas?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="direccion-label">Nivel de Estudios</InputLabel>
                                <Select
                                    labelId="direccion-label"
                                    {...register('tipo_direccion', { required: 'Se necesita el tipo de estudio' })}
                                    name="tipo_direccion"
                                    value={currentDirection.tipo_direccion?.toString() || ''}
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
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={currentDirection.estado?.toString() || ""}
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
                    </Grid>
                    <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                        Actualizar
                    </Button>
                </form>
            </Box>
        </Card>
    )
}
