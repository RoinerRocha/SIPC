import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { User } from '../../../app/models/user';
import { statesModels } from '../../../app/models/states';
import { personModel } from '../../../app/models/persons';
import { useEffect, useState } from 'react';
import { incomesModel } from '../../../app/models/incomesModel';
import { segmentosModel } from '../../../app/models/segmentosModelo';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface UpdateIncomesProps {
    Incomes: incomesModel;
    loadAccess: () => void;
}

export default function UpdateIncomes({ Incomes, loadAccess }: UpdateIncomesProps) {
    const navigate = useNavigate();

    const [person, setPerson] = useState<personModel[]>([]);
    const [income, setIncome] = useState<incomesModel[]>([]);
    const [state, setState] = useState<statesModels[]>([]);
    const [subsegmentos, setSubsegmentos] = useState<segmentosModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});

    const [currentIncome, setCurrentIncome] = useState<Partial<incomesModel>>(Incomes);


    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (Incomes) {
            setCurrentIncome(Incomes);
        }

        const fetchData = async () => {
            try {
                const [personData, stateData, limitsData] = await Promise.all([
                    api.Account.getAllUser(),
                    api.States.getStates(),
                    api.incomes.getFieldLimits()
                ]);
                // Se verifica que las respuestas sean arrays antes de actualizar el estado
                if (personData && Array.isArray(personData.data)) {
                    setPerson(personData.data);
                } else {
                    console.error("User data is not an array", personData);
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
    }, [Incomes]);

    useEffect(() => {
        if (currentIncome.segmento) {
            api.incomes.getSegmentos(currentIncome.segmento)
                .then(response => {
                    setSubsegmentos(response.data);
                })
                .catch(err => {
                    console.error("Error fetching subsegmentos:", err);
                    // Puedes mostrar un toast o algún mensaje de error aquí si lo deseas
                });
        } else {
            setSubsegmentos([]);
        }
    }, [currentIncome.segmento])


    const onSubmit = async (data: FieldValues) => {
        if (!currentIncome) return;
    
        const result = await Swal.fire({
            title: '¿Desea actualizar este ingreso?',
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
                await api.incomes.updateIncomes(currentIncome.id_ingreso, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Ingreso actualizado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAccess();
            } catch (error) {
                console.error('Error al actualizar el ingreso:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el ingreso.',
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
        // Si presiona "Cancelar", simplemente se cierra el SweetAlert.
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentIncome((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof incomesModel;
        const value = event.target.value;

        // Si el campo es 'principal', convierte el valor a un booleano
        if (name === "principal") {
            setCurrentIncome((prevAsset) => ({
                ...prevAsset,
                [name]: value === "true", // 'Si' se convierte en true, 'No' en false
            }));
        } else {
            setCurrentIncome((prevAsset) => ({
                ...prevAsset,
                [name]: value,
            }));
        }
    };

    return (
        <Card>
            <Box p={2} sx={{
                maxHeight: '100vh', // Limita la altura a un 80% de la altura visible
                overflowY: 'auto', // Habilita scroll vertical
            }}>
                <form id="update-incomes-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="segmento-label">Segmento</InputLabel>
                                <Select
                                    labelId="segmento-label"
                                    label="Segmento"
                                    {...register('segmento', { required: 'Se necesita el segmento' })}
                                    name="segmento"
                                    value={currentIncome.segmento?.toString() || ''}
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
                                    <MenuItem value="PRIVADO">Privado</MenuItem>
                                    <MenuItem value="PUBLICO">Publico</MenuItem>
                                    <MenuItem value="INDEPENDIENTE">Independiente</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="subsegmento-label">SubSegmento</InputLabel>
                                <Select
                                    labelId="subsegmento-label"
                                    label="SubSegmento"
                                    {...register('subsegmento', { required: 'Se necesita el subsegmento' })}
                                    name="subsegmento"
                                    value={currentIncome.subsegmento?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200,
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    {subsegmentos.map(seg => (
                                        <MenuItem key={seg.id_segmento} value={seg.subsegmento}>
                                            {seg.subsegmento}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('patrono', { required: 'Se necesita el patrono',  maxLength: {
                                    value: limits.patrono,
                                    message: `Límite de ${limits.patrono} caracteres excedido`
                                } })}
                                name="patrono"
                                label="Patrono"
                                value={currentIncome.patrono?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.patrono}
                                helperText={errors?.patrono?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('ocupacion', { required: 'Se necesita la ocupacion', maxLength: {
                                    value: limits.ocupacion,
                                    message: `Límite de ${limits.ocupacion} caracteres excedido`
                                } })}
                                name="ocupacion"
                                label="Ocupacion"
                                value={currentIncome.ocupacion?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.ocupacion}
                                helperText={errors?.ocupacion?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('salario_bruto', { required: 'Se necesita el salario bruto' })}
                                name="salario_bruto"
                                label="Salario Bruto"
                                value={currentIncome.salario_bruto?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.salario_bruto}
                                helperText={errors?.salario_bruto?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('salario_neto', { required: 'Se necesita el salario neto' })}
                                name="salario_neto"
                                label="salario Neto"
                                value={currentIncome.salario_neto?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.salario_neto}
                                helperText={errors?.salario_neto?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_ingreso', { required: 'Se necesita la fecha de ingreso' })}
                                type="date"
                                name="fecha_ingreso"
                                label="Fecha de Ingreso"
                                value={currentIncome.fecha_ingreso?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.fecha_ingreso}
                                helperText={errors?.fecha_ingreso?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={currentIncome.estado?.toString() || ""}
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
                            <FormControl fullWidth>
                                <InputLabel id="contacto-label">Principal</InputLabel>
                                <Select
                                    labelId="contacto-label"
                                    label="Principal"
                                    {...register('principal', { required: 'Se necesita la confirmacion' })}
                                    name="principal"
                                    value={currentIncome.principal ? 'true' : 'false'}
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
                                    <MenuItem value="true">Si</MenuItem>
                                    <MenuItem value="false">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}
