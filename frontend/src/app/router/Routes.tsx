import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import Login from "../../features/account/Login";
import Register from "../../features/account/Register";
import Zone from "../../features/Zone/Zone";
import NewZone from "../../features/Zone/NewZone";
import Users from "../../features/account/Users";
import AccountingAccounts from "../../features/accountingAccounts/NewAccount";
import StatusAssets from "../../features/statusAssets/NewStatusAsset";
import Roles from "../../features/role/NewRole";
import ServiceLife from "../../features/ServiceLife/NewServiceLife"; //lista de Mh
import NewAsset from "../../features/NewAsset/newAsset";
import RegisterAssets from "../../features/NewAsset/registerAsset";
import AssetRetirement from "../../features/assetRetirement/assetRetirementFrm"; 
import Depreciation from "../../features/depreciations/NewDepreciations";
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
import AssetRetirementList from "../../features/assetRetirement/assetRetirement";
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
            element: <ProtectedRoute requiredProfile="administrador" />,  // Protege las rutas solo para "Maestro"
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
/**
 * export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Navigate to="login" replace />,
      },
      { path: "/", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "app",
        element: <HomePage />,
        children: [
          { path: "users", element: <Users /> },
          { path: "zonas", element: <Zone /> },
          { path: "nuevaZona", element: <NewZone /> },
          { path: "about", element: <AboutPage /> },
          { path: "NewAccount", element: <AccountingAccounts /> },
          { path: "NewStatusAssets", element: <StatusAssets /> },
          { path: "NewProfiles", element: <Profiles /> },
        ],
      },
    ],
  },
]);
 */
