import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { normalizerModel } from "../../app/models/normalizerModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
// import { personModel } from "../../app/models/persons";
import NormalizersList from "./normalizerList";
export default function Normalizers() {
    const [normalizer, setNormalizer] = useState<normalizerModel[]>([]);

    useEffect(() => {
        api.normalizers
            .getAllNormalizers()
            .then((response) => {
                // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
                if (response && Array.isArray(response.data)) {
                    // Asignamos el array de perfiles de usuario a setPerfile
                    setNormalizer(response.data);
                } else {
                    console.error(
                        "La respuesta de la API no es un array de Normalizaciones:",
                        response
                    );
                }
            })
            .catch((error) =>
                console.error("Error al obtener el Pago:", error)
            );
    }, []);

    if (!Array.isArray(normalizer)) {
        console.error("El valor del acceso no es un array:", normalizer);
        return <div>Error: No se pudieron cargar las normalizaciones</div>;
    }

    return (
        <>
            <NormalizersList normalizers={normalizer} setNormalizers={setNormalizer} />
        </>
    );
}
