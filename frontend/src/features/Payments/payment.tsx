import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { toast } from "react-toastify";
import { paymentsModel } from "../../app/models/paymentsModel";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { personModel } from "../../app/models/persons";
import PaymentList from "./paymentList";

export default function Payments() {
    const [payment, setPayment] = useState<paymentsModel[]>([]);
    const [persons, setPersons] = useState<personModel[]>([]);
    const { user } = useAppSelector(state => state.account);


    useEffect(() => {
        api.payments
          .getAllPayments()
          .then((response) => {
            // Verificamos si la respuesta es un objeto con la propiedad 'data' que es un array
            if (response && Array.isArray(response.data)) {
              // Asignamos el array de perfiles de usuario a setPerfile
              setPayment(response.data);
            } else {
              console.error(
                "La respuesta de la API no es un array de Pagos:",
                response
              );
            }
          })
          .catch((error) =>
            console.error("Error al obtener el Pago:", error)
          );
    }, []);

    if (!Array.isArray(payment)) {
        console.error("El valor del acceso no es un array:", payment);
        return <div>Error: No se pudieron cargar las personas</div>;
    }

    return (
        <>
            <PaymentList payments={payment} setPayments={setPayment} />
        </>
    );
}
