import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button, Card, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import api from '../../app/api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { filesModel } from "../../app/models/filesModel";
import { historyFilesModel } from "../../app/models/historyFilesModel";

interface HistoryProps {
    HistoryData: historyFilesModel[];
}

export default function HistoryFiles({ HistoryData }: HistoryProps) {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedHistory = HistoryData.slice(startIndex, endIndex);
    console.log(HistoryData)

    return (
        <Grid container spacing={1}>
            <TableContainer component={Paper}>
                {loading ? (
                    <CircularProgress sx={{ margin: "20px auto", display: "block" }} />
                ) : (
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                                    Codigo
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                                    Campo Modificado
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                                    Fecha
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                                    Valor Anterior
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                                    Valor Nuevo
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                                    Usuario responsable
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedHistory.map((history) => (
                                <TableRow key={history.codigo}>
                                    <TableCell align="center">{history.codigo}</TableCell>
                                    <TableCell align="center">{history.campo_modificado}</TableCell>
                                    <TableCell align="center">{new Date(history.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell align="center">{history.valor_anterior}</TableCell>
                                    <TableCell align="center">{history.valor_nuevo}</TableCell>
                                    <TableCell align="center">{history.usuario}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component="div"
                count={HistoryData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 5))}
            />
        </Grid>
    )
}


