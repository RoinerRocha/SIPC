import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import Login from "../../features/account/Login";
import Register from "../../features/account/Register";
import Users from "../../features/account/Users";
import StatusAssets from "../../features/statusAssets/NewStatusAsset";
import Roles from "../../features/role/NewRole";
import Access from "../../features/Persons/NewPerson";
import ProtectedRoute from "./PrivateRoute";
import Profiles from "../../features/role/NewRole"
import MapsRoute from "../../features/Maps/Map"
import MapDetails from "../../features/Maps/MapDetails";
import Payments from "../../features/Payments/payment";
import Observations from "../../features/observations/Observations";
import Files from "../../features/history/Files";
import Requirements from "../../features/requirements/Requirements";
import Referrals from "../../features/referrals/Referral";
import Normalizers from "../../features/Normalizers/normalizer";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "Ingreso", element: <Login /> },
      {
        element: <ProtectedRoute />,  // Protege estas rutas
        children: [
          { path: "Pagos", element: <Payments /> },
          { path: "Observaciones", element: <Observations /> },
          { path: "Expedientes", element: <Files /> },
          { path: "Requerimientos", element: <Requirements /> },
          { path: "Remisiones", element: <Referrals /> },
          { path: "Normalizadores", element: <Normalizers /> },
          { path: "Personas", element: <Access /> },
          {
            element: <ProtectedRoute requiredPermissions={["Ingreso", "Pagos", "Observaciones", "Expedientes", "Requerimientos", "Roles",
  "Remisiones", "Normalizadores", "Personas", "Usuarios", "Registro"]} />,  // Protege las rutas solo para "Maestro"
            children: [
              { path: "Usuarios", element: <Users /> },
              { path: "Registro", element: <Register /> },
              { path: "Observaciones", element: <Observations /> },
              { path: "Roles", element: <Roles /> },
              { path: "Personas", element: <Access /> },
              { path: "Pagos", element: <Payments /> },
              { path: "Expediente", element: <Files /> },
              { path: "Requerimientos", element: <Requirements /> },
              { path: "Remisiones", element: <Referrals /> },
              { path: "Roles", element: <Profiles /> },
            ],
          },
        ],
      },
    ],
  },
]);
