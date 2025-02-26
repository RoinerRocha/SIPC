import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { personModel } from "../../app/models/persons";
import PersonList from "./PersonList";

export default function Access() {
    const [person, setPerson] = useState<personModel[]>([]);

    useEffect(() => {
        api.persons
          .getPersons()
          .then((response) => {
            // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
            if (response && Array.isArray(response.data)) {
              // Asignamos el array de perfiles de usuario a setPerfile
              setPerson(response.data);
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

    if (!Array.isArray(person)) {
        console.error("El valor del acceso no es un array:", person);
        return <div>Error: No se pudieron cargar las personas</div>;
    }

    return (
        <>
          <PersonList persons={person} setPersons={setPerson} />
        </>
      );
}