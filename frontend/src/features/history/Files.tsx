import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { filesModel } from "../../app/models/filesModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import FilesList from "./FilesList";


export default function Files() {
    const [file, setFile] = useState<filesModel[]>([]);

    useEffect(() => {
        api.history
            .getAllFiles()
            .then((response) => {
                // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
                if (response && Array.isArray(response.data)) {
                    // Asignamos el array de perfiles de usuario a setPerfile
                    setFile(response.data);
                } else {
                    console.error(
                        "La respuesta de la API no es un array de expedientes:",
                        response
                    );
                }
            })
            .catch((error) =>
                console.error("Error al obtener los expedientes:", error)
            );
    }, []);

    if (!Array.isArray(file)) {
        console.error("El valor del expediente no es un array:", file);
        return <div>Error: No se puede cargar los expedientes</div>;
    }

    return (
        <>
           <FilesList files={file} setFiles={setFile} />
        </>
    );
}