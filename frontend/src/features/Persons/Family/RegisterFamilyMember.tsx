import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { t } from 'i18next';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import { familyModel } from '../../../app/models/familyModel';
import { personModel } from '../../../app/models/persons';
import '../../../sweetStyles.css';
import Swal from 'sweetalert2';

interface AddMemberProps {
    loadAccess: () => void;
}

export default function RegisterFamilyMember({ loadAccess }: AddMemberProps) {
    const [person, setPerson] = useState<personModel[]>([]);
    const [limits, setLimits] = useState<{ [key: string]: number }>({});
    const FamilyInfo = JSON.parse(localStorage.getItem('FamilyInfo') || '{}');
    const [newMember, setNewMember] = useState<Partial<familyModel>>({
        idpersona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        cedula: FamilyInfo.cedula || "",
        nombre_completo: FamilyInfo.nombre_completo || "",
        fecha_nacimiento: FamilyInfo.fecha_nacimiento ? new Date(FamilyInfo.fecha_nacimiento) : new Date(),
        relacion: FamilyInfo.relacion || "Padre",
        ingresos: FamilyInfo.ingresos || 0,
        observaciones: FamilyInfo.observaciones || "",
    });

    const relacion = [
        "Padre", "Madre", "Hermano(a)", "Abuelo(a)", "Tio(a)", "Primo(a)", "Sobrino(a)",
        "Esposo(a)", "Hijo(a)", "Suegro(a)", "Yerno", "Nuera", "Cuñado(a)"
    ];

    const { register, handleSubmit, setError, reset, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        const storedInfo = localStorage.getItem('FamilyInfo');
        const parsedInfo = storedInfo ? JSON.parse(storedInfo) : {};
        if (parsedInfo.fecha_nacimiento) {
            parsedInfo.fecha_nacimiento = new Date(parsedInfo.fecha_nacimiento);
        }
        // Usar solo generatedUserId2 en el formulario
        setNewMember(prev => ({
            ...prev,
            ...parsedInfo,
        }));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [personData, limitsData] = await Promise.all([
                    api.persons.getPersons(),
                    api.family.getFieldLimits()
                ]);
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
        const resetData = {
            idpersona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
            cedula: "",
            nombre_completo: "",
            fecha_nacimiento: new Date(),
            relacion: "Padre",
            ingresos: 0,
            observaciones: "",
        };
        setNewMember(resetData);
        reset(resetData)
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            await api.family.saveMembers(data);
            localStorage.removeItem('FamilyInfo');
            Swal.fire({
                icon: "success",
                title: "Nuevo miebro familiar",
                showConfirmButton: false,
                timer: 2000,
                text: "Se ha agregado un nuevo miembro al nucleo familiar",
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
                text: "Se ha generado un error al agregar al nuevo miembro",
                customClass: {
                    popup: 'swal-z-index'
                }
            });
        }
    };

    const saveFamilyInfo = (updated: Partial<familyModel>) => {
        const { idnucleo, ...infoToStore } = updated;
        localStorage.setItem('FamilyInfo', JSON.stringify(infoToStore));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;

        const updatedValue =
            type === 'date' ? new Date(value) : value;

        const updated = {
            ...newMember,
            [name]: updatedValue,
        };

        setNewMember(updated);
        saveFamilyInfo(updated);
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof personModel;
        const value = event.target.value;
        const updated = {
            ...newMember,
            [name]: value,
        };
        setNewMember(updated);
        saveFamilyInfo(updated);
    };

    return (
        <Card>
            <Box p={2}>
                <form id="register-family-form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.idpersona}>
                                <InputLabel id="idpersona-label">Persona</InputLabel>
                                <Select
                                    error={!!errors.idpersona}
                                    labelId="idpersona-label"
                                    {...register('idpersona', { required: 'Se necesita una persona' })}
                                    name="idpersona"
                                    value={newMember.idpersona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Persona"
                                    disabled={!!newMember.idpersona}
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
                                {/* {newMember.idpersona !== undefined && newMember.idpersona >= 0 && (
                                    <FormHelperText>
                                        <Card>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Tipo Identificación:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.tipo_identificacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Número Identificación:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.numero_identifiacion || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Nacimiento:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.fecha_nacimiento.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Género:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.genero || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado Civil:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.estado_civil || "N/A"}</p>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2} direction="row">
                                                <Grid item>
                                                    <p><strong>Nacionalidad:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.nacionalidad || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Fecha de Registro:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.fecha_registro.toString() || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Usuario Registro:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.usuario_registro || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Nivel de Estudios:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.nivel_estudios || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Asesor:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.asesor || "N/A"}</p>
                                                </Grid>
                                                <Grid item>
                                                    <p><strong>Estado:</strong> {person.find((p) => p.id_persona === newMember.idpersona)?.estado || "N/A"}</p>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    </FormHelperText>
                                )} */}
                                {errors.idpersona && (
                                    <FormHelperText>{errors.idpersona.message as string}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('cedula', {
                                    required: 'Se necesita la cedula', maxLength: {
                                        value: limits.cedula, // fallback si no está disponible
                                        message: `Límite de ${limits.cedula} caracteres excedido`
                                    }
                                })}
                                name="cedula"
                                label="Cedula del miembro familiar"
                                value={newMember.cedula?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.cedula}
                                helperText={errors?.cedula?.message as string}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('nombre_completo', {
                                    required: 'Se necesita el nombre completo', maxLength: {
                                        value: limits.nombre_completo, // fallback si no está disponible
                                        message: `Límite de ${limits.nombre_completo} caracteres excedido`
                                    }
                                })}
                                name="nombre_completo"
                                label="Nombre completo del miembro familiar"
                                value={newMember.nombre_completo?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.nombre_completo}
                                helperText={errors?.nombre_completo?.message as string}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('fecha_nacimiento')}
                                type="date"
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                                value={
                                    newMember.fecha_nacimiento instanceof Date
                                        ? newMember.fecha_nacimiento.toISOString().split('T')[0]
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
                        <Grid item xs={4}>
                            <Autocomplete
                                disablePortal
                                options={relacion}
                                value={newMember.relacion || ""}
                                onChange={(event, newValue) => {
                                    const updated = {
                                        ...newMember,
                                        relacion: newValue || '',
                                    };
                                    setNewMember(updated);
                                    saveFamilyInfo(updated);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Relación del miembro familiar"
                                        {...register("relacion", { required: "Seleccione una relación" })}
                                        error={!!errors.relacion}
                                        helperText={errors?.relacion?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                {...register('ingresos')}
                                name="ingresos"
                                label="Ingresos del miembro familiar"
                                value={newMember.ingresos?.toString() || ''}
                                onChange={handleInputChange}
                                error={!!errors.ingresos}
                                helperText={errors?.ingresos?.message as string}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', {
                                    maxLength: {
                                        value: limits.observaciones, // fallback si no está disponible
                                        message: `Límite de ${limits.observaciones} caracteres excedido`
                                    }
                                })}
                                name="observaciones"
                                label="Observaciones"
                                value={newMember.observaciones?.toString() || ''}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px', // Opcional: especifica un tamaño mínimo
                                    },
                                }}
                                error={!!errors.observaciones}
                                helperText={errors?.observaciones?.message as string}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    )

}