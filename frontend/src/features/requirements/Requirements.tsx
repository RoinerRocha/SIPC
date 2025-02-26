import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { requirementsModel } from "../../app/models/requirementsModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { personModel } from "../../app/models/persons";
import RequirementList from "./RequirementsList";

export default function Requirements() {
    const [requirement, setRequirement] = useState<requirementsModel[]>([]);

    useEffect(() => {
        api.requirements
            .getAllRequirements()
            .then((response) => {
                // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
                if (response && Array.isArray(response.data)) {
                    // Asignamos el array de perfiles de usuario a setPerfile
                    setRequirement(response.data);
                } else {
                    console.error(
                        "La respuesta de la API no es un array de Requisitos:",
                        response
                    );
                }
            })
            .catch((error) =>
                console.error("Error al obtener el Requisito:", error)
            );
    }, []);

    if (!Array.isArray(requirement)) {
        console.error("El valor del requisito no es un array:", requirement);
        return <div>Error: No se pudieron cargar los requisitos</div>;
    }

    return (
        <>
            <RequirementList requirements={requirement} setRequirements={setRequirement} /> 
        </>
    );
}