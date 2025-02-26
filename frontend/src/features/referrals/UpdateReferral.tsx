import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { referralsModel } from "../../app/models/referralsModel";

interface UpdateReferralsProps {
    ReferralsData: referralsModel;
    loadAccess: () => void;
}

export default function UpdatedReferral({ ReferralsData, loadAccess }: UpdateReferralsProps) {
    const [currentReferral, setCurrentReferral] = useState<Partial<referralsModel>>(ReferralsData);

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        mode: 'onTouched',
    });

    useEffect(() => {
        if (ReferralsData) {
            setCurrentReferral(ReferralsData);
            console.log(ReferralsData.id_remision);
        }
    }, [ReferralsData]);

    const onSubmit = async (data: FieldValues) => {
        if (currentReferral) {
            try {
                await api.referrals.updateReferrals(Number(currentReferral.id_remision), data);
                toast.success('Remision actualizada con éxito.');
                loadAccess();
            } catch (error) {
                console.error(error);
                toast.error('Error al actualizar la remision.');
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setCurrentReferral((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setCurrentReferral((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card>
            <Box p={2}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-label"
                                    {...register('estado', { required: 'Se necesita el estado' })}
                                    name="estado"
                                    value={currentReferral.estado?.toString() || ''}
                                    onChange={handleSelectChange}
                                    fullWidth
                                >
                                    <MenuItem value="Anulado">Anulado</MenuItem>
                                    <MenuItem value="Procesado">Procesado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="entidad-label">Entidad Destinada</InputLabel>
                                <Select
                                    labelId="entidad-label"
                                    {...register('entidad_destino', { required: 'Se necesita la Entidad' })}
                                    name="entidad_destino"
                                    value={currentReferral.entidad_destino?.toString() || ''}
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
                                    {/* Bancos Públicos */}
                                    <MenuItem value="Banhvi">Banhvi</MenuItem>
                                    <MenuItem value="Banco Nacional de Costa Rica">Banco Nacional de Costa Rica</MenuItem>
                                    <MenuItem value="Banco de Costa Rica">Banco de Costa Rica</MenuItem>
                                    <MenuItem value="Banco Popular y de Desarrollo Comunal">Banco Popular y de Desarrollo Comunal</MenuItem>
                                    <MenuItem value="Banco Hipotecario de la Vivienda (BANHVI)">Banco Hipotecario de la Vivienda (BANHVI)</MenuItem>

                                    {/* Bancos Privados */}
                                    <MenuItem value="BAC Credomatic">BAC Credomatic</MenuItem>
                                    <MenuItem value="Banco Davivienda (Costa Rica)">Banco Davivienda (Costa Rica)</MenuItem>
                                    <MenuItem value="Scotiabank de Costa Rica">Scotiabank de Costa Rica</MenuItem>
                                    <MenuItem value="Banco Promerica de Costa Rica">Banco Promerica de Costa Rica</MenuItem>
                                    <MenuItem value="Banco CMB (Costa Rica)">Banco CMB (Costa Rica)</MenuItem>
                                    <MenuItem value="Banco Lafise">Banco Lafise</MenuItem>
                                    <MenuItem value="Banco BCT">Banco BCT</MenuItem>
                                    <MenuItem value="Banco Improsa">Banco Improsa</MenuItem>
                                    <MenuItem value="Banco General (Costa Rica)">Banco General (Costa Rica)</MenuItem>
                                    <MenuItem value="Banco Cathay de Costa Rica">Banco Cathay de Costa Rica</MenuItem>
                                    <MenuItem value="Prival Bank (Costa Rica)">Prival Bank (Costa Rica)</MenuItem>

                                    {/* Mutuales */}
                                    <MenuItem value="Grupo Mutual Alajuela">Grupo Mutual Alajuela</MenuItem>
                                    <MenuItem value="Mutual Cartago de Ahorro y Préstamo">Mutual Cartago de Ahorro y Préstamo</MenuItem>

                                    {/* Financieras No Bancarias */}
                                    <MenuItem value="Financiera Cafsa">Financiera Cafsa</MenuItem>
                                    <MenuItem value="Financiera Comeca">Financiera Comeca</MenuItem>
                                    <MenuItem value="Financiera Desyfin">Financiera Desyfin</MenuItem>
                                    <MenuItem value="Financiera Gente">Financiera Gente</MenuItem>
                                    <MenuItem value="Financiera Monge">Financiera Monge</MenuItem>

                                    {/* Cooperativas de Ahorro y Crédito */}
                                    <MenuItem value="Coocique R.L.">Coocique R.L.</MenuItem>
                                    <MenuItem value="Coopealianza R.L.">Coopealianza R.L.</MenuItem>
                                    <MenuItem value="Coopenae R.L.">Coopenae R.L.</MenuItem>
                                    <MenuItem value="Coopemep R.L.">Coopemep R.L.</MenuItem>
                                    <MenuItem value="Coopeservidores R.L.">Coopeservidores R.L.</MenuItem>

                                    {/* Entidades de Gobierno - Servicios Públicos */}
                                    <MenuItem value="Instituto Costarricense de Electricidad (ICE)">Instituto Costarricense de Electricidad (ICE)</MenuItem>
                                    <MenuItem value="Acueductos y Alcantarillados (AyA)">Acueductos y Alcantarillados (AyA)</MenuItem>
                                    <MenuItem value="Caja Costarricense de Seguro Social (CCSS)">Caja Costarricense de Seguro Social (CCSS)</MenuItem>
                                    <MenuItem value="Autoridad Reguladora de los Servicios Públicos (ARESEP)">Autoridad Reguladora de los Servicios Públicos (ARESEP)</MenuItem>
                                    <MenuItem value="Comisión Nacional de Prevención de Riesgos y Atención de Emergencias (CNE)">Comisión Nacional de Prevención de Riesgos y Atención de Emergencias (CNE)</MenuItem>
                                </Select>
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
