import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import { User } from '../../../app/models/user';
import { statesModels } from '../../../app/models/states';
import { useEffect, useState } from 'react';
import { directionsModel } from '../../../app/models/directionsModel';
import { provinceModel } from '../../../app/models/provinceModel';
import { cantonModel } from '../../../app/models/cantonModel';
import { districtModel } from '../../../app/models/districtModel';
import { neighborhoodModel } from '../../../app/models/neighborhoodModel';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';



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
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const [users, setUsers] = useState<User[]>([]);
    const [directions, setDirections] = useState<directionsModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);

    const [currentDirection, setCurrentDirection] = useState<Partial<directionsModel>>(direction);


    const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (direction) {
            setCurrentDirection(direction);
            console.log("currentDirection set:", direction);
        }

        const fetchData = async () => {
            try {
                const [userData, stateData, limitsData] = await Promise.all([
                    api.Account.getAllUser(),
                    api.States.getStates(),
                    api.directions.getFieldLimits()
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
        if (!currentDirection) return;

        const result = await Swal.fire({
            title: '¿Desea actualizar esta dirección?',
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
                await api.directions.updateDirections(currentDirection.id_direccion, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Dirección actualizada con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar la dirección:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: 'Ocurrió un error al guardar los cambios.',
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
        // Si presiona "Cancelar", no hace nada.
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
            <Box p={2} sx={{
                maxHeight: '30vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="update-directions-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
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
                                        onChange={(event, option) => {
                                            const id = option?.provincia ?? null;
                                            setSelectedProvince(id);
                                            setSelectedCanton(null);
                                            setSelectedDistrict(null);
                                            setValue("provincia", id || "");
                                            setValue("canton", "");
                                            setValue("distrito", "");
                                            setValue("barrio", "");
                                        }}
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
                                        onChange={(event, option) => {
                                            const id = option?.canton ?? null;
                                            setSelectedCanton(id);
                                            setSelectedDistrict(null);
                                            setValue("canton", id || "");
                                            setValue("distrito", "");
                                            setValue("barrio", "");
                                        }}
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
                                        onChange={(event, option) => {
                                            const id = option?.distrito ?? null;
                                            setSelectedDistrict(id);
                                            setValue("distrito", id || "");
                                            setValue("barrio", "");
                                        }}
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
                                        value={neighborhoods.find((b) => b.barrio === Number(currentDirection.barrio)) || null}
                                        onChange={(event, option) => {
                                            const id = option?.barrio ?? null;
                                            setValue("barrio", id || "");
                                            setCurrentDirection((prev) => ({
                                                ...prev,
                                                barrio: id?.toString() || "",
                                            }));
                                        }}
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
                            <FormControl fullWidth>
                                <InputLabel id="direccion-label">Nivel de Estudios</InputLabel>
                                <Select
                                    labelId="direccion-label"
                                    {...register('tipo_direccion', { required: 'Se necesita el tipo de estudio' })}
                                    name="tipo_direccion"
                                    value={currentDirection.tipo_direccion?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    label="Nivel de Estudios"
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
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('otras_senas', {
                                    required: 'Se necesitan otras señas', maxLength: {
                                        value: limits.otras_senas, // fallback si no está disponible
                                        message: `Límite de ${limits.otras_senas} caracteres excedido`
                                    }
                                })}
                                name="otras_senas"
                                label="Otras Señas"
                                value={currentDirection.otras_senas?.toString() || ''}
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
