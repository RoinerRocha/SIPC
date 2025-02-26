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
import { incomesModel } from '../../../app/models/incomesModel';
import { personModel } from '../../../app/models/persons';
import { segmentosModel } from '../../../app/models/segmentosModelo';

interface AddIncomesProps {
    loadAccess: () => void;
}

export default function RegisterIncomes({ loadAccess }: AddIncomesProps) {
    const [state, setState] = useState<statesModels[]>([]);
    const [person, setPerson] = useState<personModel[]>([]);
    const [subsegmentos, setSubsegmentos] = useState<segmentosModel[]>([]);

    const [newIncome, setNewIncome] = useState<Partial<incomesModel>>({
        id_persona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        segmento: "",
        subsegmento: "",
        patrono: "",
        ocupacion: "",
        salario_bruto: 0,
        salario_neto: 0,
        fecha_ingreso: new Date(),
        estado: "",
        principal: false,
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

    useEffect(() => {
        if (newIncome.segmento) {
            api.incomes.getSegmentos(newIncome.segmento)
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
    }, [newIncome.segmento])

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.incomes.saveIncomes(data);
            toast.success("Ingreso registrado");
            loadAccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear el ingreso");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewIncome((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof incomesModel;
        const value = event.target.value;

        // Si el campo es 'principal', convierte el valor a un booleano
        if (name === "principal") {
            setNewIncome((prevAsset) => ({
                ...prevAsset,
                [name]: value === "true", // 'Si' se convierte en true, 'No' en false
            }));
        } else {
            setNewIncome((prevAsset) => ({
                ...prevAsset,
                [name]: value,
            }));
        }
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
                                    value={newIncome.id_persona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Seleccionar el id de la persona"
                                    disabled={!!newIncome.id_persona}
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
                                {newIncome.id_persona !== undefined && newIncome.id_persona >= 0 && (
                                    <FormHelperText>
                                        <Card>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Tipo Identificación:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.tipo_identificacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Número Identificación:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.numero_identifiacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Nacimiento:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.fecha_nacimiento.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Género:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.genero || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado Civil:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.estado_civil || "N/A"}</p>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Nacionalidad:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.nacionalidad || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Registro:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.fecha_registro.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Usuario Registro:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.usuario_registro || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Nivel de Estudios:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.nivel_estudios || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Asesor:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.asesor || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado:</strong> {person.find((p) => p.id_persona === newIncome.id_persona)?.estado || "N/A"}</p>
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
                                <InputLabel id="segmento-label">Segmento</InputLabel>
                                <Select
                                    labelId="segmento-label"
                                    {...register('segmento', { required: 'Se necesita el segmento' })}
                                    name="segmento"
                                    value={newIncome.segmento?.toString() || ''}
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
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="subsegmento-label">SubSegmento</InputLabel>
                                <Select
                                    labelId="subsegmento-label"
                                    {...register('subsegmento', { required: 'Se necesita el subsegmento' })}
                                    name="subsegmento"
                                    value={newIncome.subsegmento?.toString() || ''}
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
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('patrono', { required: 'Se necesita el Patrono' })}
                                name="patrono"
                                label="Patrono"
                                value={newIncome.patrono?.toString()}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('ocupacion', { required: 'Se necesita la Ocupacion' })}
                                name="ocupacion"
                                label="Ocupacion"
                                value={newIncome.ocupacion?.toString()}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('salario_bruto', { required: 'Se necesita la Salario Bruto' })}
                                name="salario_bruto"
                                label="Salario Bruto"
                                value={newIncome.salario_bruto?.toString()}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('salario_neto', { required: 'Se necesita la Salario Neto' })}
                                name="salario_neto"
                                label="Salario Neto"
                                value={newIncome.salario_neto?.toString()}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('fecha_ingreso', { required: 'Se necesita la fecha de ingreso' })}
                                type="date"
                                name="fecha_ingreso"
                                label="Fecha de Ingreso"
                                value={newIncome.fecha_ingreso?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={newIncome.estado?.toString() || ""}
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
                            <FormControl fullWidth>
                                <InputLabel id="contacto-label">Principal</InputLabel>
                                <Select
                                    labelId="contacto-label"
                                    {...register('principal', { required: 'Se necesita la confirmacion' })}
                                    name="principal"
                                    value={newIncome.principal ? 'true' : 'false'}
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
                        <Button variant="contained" color="info" sx={{ margin: "10px", width: '100%' }} type="submit" disabled={isSubmitting}>
                            Agregar
                        </Button>
                    </Grid>
                </form>
            </Box>
        </Card>
    )
}