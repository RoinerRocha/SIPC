import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FieldValues, Form, useForm } from 'react-hook-form';
import api from '../../../app/api/api';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { familyModel } from '../../../app/models/familyModel';
import { personModel } from '../../../app/models/persons';

interface AddMemberProps {
    loadAccess: () => void;
}

export default function RegisterFamilyMember({ loadAccess }: AddMemberProps) {
    const [person, setPerson] = useState<personModel[]>([]);
    const [newMember, setNewMember] = useState<Partial<familyModel>>({
        idpersona: parseInt(localStorage.getItem('generatedUserId') || "0") || undefined,
        cedula: "",
        nombre_completo: "",
        fecha_nacimiento: new Date(),
        relacion: "",
        ingresos: 0,
        observaciones: "",
    });

    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid, isSubmitSuccessful } } = useForm({
        mode: 'onTouched'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [personData] = await Promise.all([
                    api.persons.getPersons()
                ]);
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
            await api.family.saveMembers(data);
            toast.success("Miembro familiar creado exitosamente");
            loadAccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al ingresar el miembro familiar");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewMember((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const name = event.target.name as keyof familyModel;
        const value = event.target.value;
        setNewMember((prevAsset) => ({
            ...prevAsset,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="idpersona-label">Persona</InputLabel>
                                <Select
                                    labelId="idpersona-label"
                                    {...register('idpersona', { required: 'Se necesita el id' })}
                                    name="idpersona"
                                    value={newMember.idpersona?.toString() || ""}
                                    onChange={handleSelectChange}
                                    label="Seleccionar el id de la persona"
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
                                {newMember.idpersona !== undefined && newMember.idpersona >= 0 && (
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
                                )}
                                {/*<FormHelperText>Lista desplegable</FormHelperText>*/}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('cedula', { required: 'Se necesita la cedula' })}
                                name="cedula"
                                label="Cedula del miembro familiar"
                                value={newMember.cedula?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('nombre_completo', { required: 'Se necesita el nombre completo' })}
                                name="nombre_completo"
                                label="Nombre completo del miembro familiar"
                                value={newMember.nombre_completo?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('fecha_nacimiento', { required: 'Se necesita la fecha de nacimiento' })}
                                type="date"
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                                value={newMember.fecha_nacimiento?.toString() || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="relacion-label">Relacion del miembro familiar</InputLabel>
                                <Select
                                    labelId="relacion-label"
                                    {...register('relacion', { required: 'Se necesita la relacion del miembro familiar' })}
                                    name="relacion"
                                    value={newMember.relacion?.toString() || ''}
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
                                    <MenuItem value="Padre">Padre</MenuItem>
                                    <MenuItem value="Madre">Madre</MenuItem>
                                    <MenuItem value="Hermano(a)">Hermano(a)</MenuItem>
                                    <MenuItem value="Abuelo(a)">Abuelo(a)</MenuItem>
                                    <MenuItem value="Tio(a)">Tio(a)</MenuItem>
                                    <MenuItem value="Primo(a)">Primo(a)</MenuItem>
                                    <MenuItem value="Sobrino(a)">Sobrino(a)</MenuItem>
                                    <MenuItem value="Esposo(a)">Esposo(a)</MenuItem>
                                    <MenuItem value="Hijo(a)">Hijo(a)</MenuItem>
                                    <MenuItem value="Suegro(a)">Suegro(a)</MenuItem>
                                    <MenuItem value="Yerno">Yerno</MenuItem>
                                    <MenuItem value="Nuera">Nuera</MenuItem>
                                    <MenuItem value="Cuñado(a)">Nuera(a)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                {...register('ingresos', { required: 'Se necesita los ingresos' })}
                                name="ingresos"
                                label="Ingresos del miembro familiar"
                                value={newMember.ingresos?.toString() || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                {...register('observaciones', { required: 'Se necesita la observacion' })}
                                name="observaciones"
                                label="Observaciones"
                                value={newMember.observaciones?.toString() || ''}
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