import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { referralsModel } from "../../app/models/referralsModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { personModel } from "../../app/models/persons";
import ReferraltList from "./ReferralList";

export default function Referrals() {
    const [referral, setReferral] = useState<referralsModel[]>([]);

    useEffect(() => {
        api.referrals
            .getAllReferrals()
            .then((response) => {
                // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
                if (response && Array.isArray(response.data)) {
                    // Asignamos el array de perfiles de usuario a setPerfile
                    setReferral(response.data);
                } else {
                    console.error(
                        "La respuesta de la API no es un array de Remisiones:",
                        response
                    );
                }
            })
            .catch((error) =>
                console.error("Error al obtener el Remisiones:", error)
            );
    }, []);

    if (!Array.isArray(referral)) {
        console.error("El valor de Remisiones no es un array:", referral);
        return <div>Error: No se pudieron cargar las Remisiones</div>;
    }

    return (
        <>
            <ReferraltList referrals={referral} setReferrals={setReferral} /> 
        </>
    );
}