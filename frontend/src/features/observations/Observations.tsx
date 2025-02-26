import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { observationModel } from "../../app/models/observationModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { personModel } from "../../app/models/persons";
import ObservationList from "./ObservationList";

export default function Payments() {
    const [observation, setObservation] = useState<observationModel[]>([]);
    const [persons, setPersons] = useState<personModel[]>([]);
    const { user } = useAppSelector(state => state.account);


    useEffect(() => {
        api.observations
          .getAllObservations()
          .then((response) => {
            // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
            if (response && Array.isArray(response.data)) {
              // Asignamos el array de perfiles de usuario a setPerfile
              setObservation(response.data);
            } else {
              console.error(
                "La respuesta de la API no es un array de acceso:",
                response
              );
            }
          })
          .catch((error) =>
            console.error("Error al obtener el acceso:", error)
          );
    }, []);

    if (!Array.isArray(observation)) {
        console.error("El valor del acceso no es un array:", observation);
        return <div>Error: No se pudieron cargar las personas</div>;
    }


    return (
        <>
            <ObservationList observations={observation} setObservations={setObservation} /> 
        </>
    );
}
