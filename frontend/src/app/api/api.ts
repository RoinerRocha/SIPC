import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { store } from "../../store/configureStore";

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000/api/";


const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.request.use((config) => {
  const token = store.getState().account.user?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  async (response) => {
    await sleep();
    return response;
  },
  (error: AxiosError) => {
    const { data, status } = error.response as AxiosResponse;
    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors: string[] = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        }
        toast.error(data.message);
        break;
      case 401:
        toast.error(data.message);
        break;
      case 404:
        toast.error(data.message);
        break;
      case 500:
        toast.error(data.message);
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const requests = {
  get: (url: string) => axios.get(url).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  download: (url: string) => axios.get(url, { responseType: 'arraybuffer' }).then((response) => response.data),
};

const TestErrors = {
  getNotFound: () => requests.get("buggy/not-found"),
  getBadRequest: () => requests.get("buggy/bad-request"),
  getUnauthorised: () => requests.get("buggy/unauthorised"),
  getValidationError: () => requests.get("buggy/validation-error"),
  getServerError: () => requests.get("buggy/server-error"),
};

const Account = {
  login: (values: any) => requests.post("login", values),
  register: (values: any) => requests.post("register", values),
  currentUser: () => requests.get("currentUser"),
  getAllUser: () => requests.get("getUsers"),
  updateUser: (accountId: any, accountData: any) =>
    requests.put(`/updateUser/${accountId}`, accountData),
  deleteUser: (id: number) => requests.delete(`/deleteUser/${id}`),
  sendEmail: (values: any) => requests.post("sendEmails", values),
  newPasword: (values: any) => requests.post("updatePasswordByEmail", values)
};

const Zones = {
  saveZona: (values: any) => requests.post("saveZona", values),
  getZona: () => requests.get("/getZona"),
  updateZona: (zonaId: any, zonaData: any) =>
    requests.put(`/zonas/${zonaId}`, zonaData),
  deleteZona: (id: number) => requests.delete(`deleteZona/${id}`),
  getZonaById: (id: number) => requests.get(`/zonas/${id}`),
};

const Ubications = {
  getAllProvinces: () => requests.get("/getAllProvince"),
  getCantonByProvince: (provincia: number) =>
    requests.get(`/getCantonByProvince/${provincia}`),
  getDistrictByProvinciaCanton: (provincia: number, canton: number) =>
    requests.get(`/getDistrictByProvinciaCanton/${provincia}/${canton}`),
  getNeighborhoodByProvinciaCantonDistrict: (
    provincia: number, canton: number, distrito: number) =>
    requests.get(`/getNeighborhoodByProvinciaCantonDistrict/${provincia}/${canton}/${distrito}`),
}

const AcountingAccounts = {
  saveAccountingAccount: (values: any) =>
    requests.post("saveAccountingAccount", values),
  getAccountingAccounts: () => requests.get("/getAccountingAccounts"),
  updateAccountingAccount: (
    AccountingAccountId: any,
    AccountingAccountData: any
  ) =>
    requests.put(
      `/accountingAccounts/${AccountingAccountId}`,
      AccountingAccountData
    ),
  deleteAccountingAccount: (id: number) =>
    requests.delete(`deleteAccountingAccount/${id}`),
};

const statusAssets = {
  saveStatusAsset: (values: any) => requests.post("saveStatusAsset", values),
  getStatusAssets: () => requests.get("/getStatusAssets"),
  updateStatusAsset: (StatusAssetId: any, StatusAssetData: any) =>
    requests.put(`/statusAssets/${StatusAssetId}`, StatusAssetData),
  deleteStatusAsset: (id: number) => requests.delete(`deleteStatusAsset/${id}`),
};

const roles = {
  saveRoles: (values: any) => requests.post("saveRoles", values),
  getRoles: () => requests.get("/getRoles"),
  updateRole: (roleId: any, RoleData: any) =>
    requests.put(`/role/${roleId}`, RoleData),
  deleteRole: (id: number) => requests.delete(`deleteRole/${id}`),
};

const States = {
  getStates: () => requests.get("/getStates"),
}

const serviceLife = {
  saveServiceLife: (values: any) => requests.post("saveServiceLife", values),
  getServiceLifes: () => requests.get("/getServiceLifes"),
  updateServiceLife: (profileId: any, ProfileData: any) =>
    requests.put(`/serviceLifes/${profileId}`, ProfileData),
  deleteServiceLife: (id: number) => requests.delete(`deleteServiceLife/${id}`),
};

const newAsset = {
  saveNewAsset: (values: any) => requests.post("saveNewAsset", values),
  getNewAssets: () => requests.get("/getNewAssets"),
  updateNewAsset: (NewAssetId: any, NewAssetData: any) =>
    requests.put(`/newAssets/${NewAssetId}`, NewAssetData),
  deleteNewAsset: (id: number) => requests.delete(`deleteNewAsset/${id}`), //reviar x si da algun problema ya que en el back esta comentado esta funcion
  getNewAssetById: (id: number) => requests.get(`/searchIdNewAsset/${id}`),
  searchAssetsByZona: (zonaNombre: string) => requests.get(`/searchAssetsByZona?zonaNombre=${zonaNombre}`),  // Cambiado aquí
  getAssetByNumBoleta: (id: string) => requests.get(`/assetByNumBolet/boleta/${id}`),
  generateWordFile: (id: number) => requests.download(`/generateWord/${id}`),
  generatePDFFile: (id: number) => requests.download(`/generatePDF/${id}`),
  generateExcelFile: (id: number) => requests.download(`/generateExcelFile/${id}`),
  generateExcelFileForMultipleAssets: (ids: number[]) => requests.download(`/generateExcelFileMultipleAssets?ids=${ids.join(',')}`),

  getAssetPositions: (zonaNombre: string) => requests.get(`getAssetPositions/${zonaNombre}`), //devuelve las posiciones de los activo poo zona
  saveAssetPositions: (values: any) => requests.post("/saveAssetPositions", values),//posicion del activo en el mapa
};

const assetRetirement = {
  saveAssetRetirement: (values: any) => requests.post("saveAssetRetirement", values),
  getAssetRetirements: () => requests.get("/getAssetRetirements"),
  updateAssetRetirement: (assetRetirementId: any, assetRetirementData: any) =>
    requests.put(`/assetRetirements/${assetRetirementId}`, assetRetirementData),
  deleteAssetRetirement: (id: number) => requests.delete(`deleteAssetRetirement/${id}`),
  getAssetRetirementByNumeroBoleta: (id: string) => requests.get(`/assetRetirements/boleta/${id}`),
  getAssetRetirementPlate: (plate: string) => requests.get(`/assetRetirements/plate/${plate}`),
  generateExcelFile: (id: number) => requests.download(`/RetirementExcelFile/${id}`),
};

const payments = {
  savePayments: (values: any) => requests.post("createPayment", values),
  updatePayments: (id_pago: any, paymentData: any) =>
    requests.put(`/updatePayment/${id_pago}`, paymentData),//metodo comentado en el backend
  getPaymentsByIdentification: (identificacion: string) => requests.get(`/getPaymentsByPerson/${identificacion}`),
  getPaymentsByIDPersona: (id_persona: number) => requests.get(`/getPaymentsByIDPerson/${id_persona}`),
  getPaymentsByIDPago: (id_pago: number) => requests.get(`/getPaymentsByIDPago/${id_pago}`),
  getAllPayments: () => requests.get("/getAllPayments"),
  // generateExcelFile: (id: number) => requests.download(`/SalesExcelFile/${id}`),
};

const observations = {
  saveObservations: (values: any) => requests.post("createObservations", values),
  getAllObservations: () => requests.get("/getAllObservations"),
  getObservationsByPerson: (id_persona: number) => requests.get(`/getObservationsByIDPerson/${id_persona}`),
  getObservationsByIdentification: (identificacion: string) => requests.get(`/getObservationByPerson/${identificacion}`),
}

const depreciations = {
  saveDepreciation: (values: any) => requests.post("/saveDepreciation", values),
  getDepreciations: () => requests.get("/getDepreciations"),
  updateDepreciation: (depreciationId: any, depreciationData: any) =>
    requests.put(`depreciations/${depreciationId}`, depreciationData),
  deleteDepreciation: (id: number) => requests.delete(`/deleteDepreciation/${id}`)
}

const requirements = {
  saveRequirements: (values: any) => requests.post("/createRequirements", values),
  getAllRequirements: () => requests.get("/getAllRequirements"),
  getAllBaseRequirements: () => requests.get("/getAllBaseRequirements"),
  getRequirementByPerson: (id_persona: number) => requests.get(`/getRequirementsByPerson/${id_persona}`),
  getRequirementById: (id_requisito: number) => requests.get(`/getRequirementsById/${id_requisito}`),
  getRequirementByIdentification: (identificacion: string) => requests.get(`/getRequirementsByIdentification/${identificacion}`),
  updateRequirement: (id_requisito: any, requirementData: any) =>
    requests.put(`updateRequirements/${id_requisito}`, requirementData),
}

const referrals = {
  saveReferrals: (values: any) => requests.post("/createReferral", values),
  getAllReferrals: () => requests.get("/getAllReferrals"),
  getReferralsById: (id_remision: number) => requests.get(`/getReferralsById/${id_remision}`),
  updateReferrals: (id_remision: any, referralsData: any) =>
    requests.put(`updateReferrals/${id_remision}`, referralsData),
}

const referralsDetails = {
  saveReferralDetails: (values: any) => requests.post("/createReferralDetails", values),
  getReferralDetailById: (id_dremision: number) => requests.get(`/getReferralsDetailsById/${id_dremision}`),
  getReferralDetailByIdRemision: (id_remision: number) => requests.get(`/getReferralsDetailsByIdRemision/${id_remision}`),
  updateReferralsDetails: (id_dremision: any, referralDetailsData: any) =>
    requests.put(`updateReferralsDetails/${id_dremision}`, referralDetailsData),
}

const persons = {
  savePersons: (values: any) => requests.post("/createPerson", values),
  getPersons: () => requests.get("/getPersons"),
  getAllDisabilities: () => requests.get("/getAllDisabilities"),
  getPersonById: (id_persona: number) => requests.get(`/getPersonById/${id_persona}`),
  getPersonHistoryChanges: (id_persona: number) => requests.get(`/getPersonHistoryChanges/${id_persona}`),
  getPersonByIdentification: (numero_identifiacion: string) => requests.get(`/getPersonByIdentifcation/${numero_identifiacion}`),
  updatePersons: (id_persona: any, usuario_sistema: string, personData: any) =>
    requests.put(`updatePersons/${id_persona}/${usuario_sistema}`, personData),
  deletePersons: (id_persona: number) => requests.delete(`deletePersons/${id_persona}`),
}

const family = {
  saveMembers: (values: any) => requests.post("/createFamilyMember", values),
  getMembersByPerson: (idpersona: number) => requests.get(`/getMemberByPerson/${idpersona}`),
  getMembersByID: (idnucleo: number) => requests.get(`/getMemberByID/${idnucleo}`),
  updateMember: (idnucleo: any, memberData: any) =>
    requests.put(`updateMember/${idnucleo}`, memberData),
  deleteMember: (idnucleo: number) => requests.delete(`deleteMember/${idnucleo}`),
}

const contacts = {
  saveContacts: (values: any) => requests.post("/createContact", values),
  getContacts: () => requests.get("/getAllContacts"),
  getContactsByPerson: (id_persona: number) => requests.get(`/getContactsByPerson/${id_persona}`),
  getContactsByID: (id_contacto: number) => requests.get(`/getContactsByID/${id_contacto}`),
  updateContacts: (id_contacto: any, contactData: any) =>
    requests.put(`updateContacts/${id_contacto}`, contactData),
  deleteContacts: (id_contacto: number) => requests.delete(`deleteContacts/${id_contacto}`),
}

const directions = {
  saveDirections: (values: any) => requests.post("/createDireccion", values),
  getDirections: () => requests.get("/getAllDirections"),
  getDireccionesByPersona: (id_persona: number) => requests.get(`/getDireccionesByPersona/${id_persona}`),
  getDireccionesByID: (id_direccion: number) => requests.get(`/getDireccionesByID/${id_direccion}`),
  updateDirections: (id_direccion: any, directionData: any) =>
    requests.put(`updateDireccion/${id_direccion}`, directionData),
  deleteDirections: (id_direccion: number) => requests.delete(`deleteDireccion/${id_direccion}`),
}

const incomes = {
  saveIncomes: (values: any) => requests.post("/createIncome", values),
  getIncomes: () => requests.get("/getAllIncomes"),
  getSegmentos: (segmento: string) => requests.get(`/getSegmentos/${segmento}`),
  getIncomesByPerson: (id_persona: number) => requests.get(`/getIncomesByPerson/${id_persona}`),
  getIncomesByID: (id_ingreso: number) => requests.get(`/getIncomesByID/${id_ingreso}`),
  updateIncomes: (id_ingreso: any, contactData: any) =>
    requests.put(`updateIncome/${id_ingreso}`, contactData),
  deleteIncomes: (id_ingreso: number) => requests.delete(`deleteIncome/${id_ingreso}`),
}

const normalizers = {
  saveNormalizer: (values: any) => requests.post("/createNormalizers", values),
  getAllNormalizers: () => requests.get("/getAllNormalizers"),
  getUniqueCompanies: () => requests.get("/getUniqueCompanies"),
  getNormalizerById: (id: number) => requests.get(`/getNormalizersById/${id}`),
  getFiscalesAndIngenierosByEmpresa: (empresa: string) => requests.get(`/getFiscalesAndIngenierosByEmpresa/${empresa}`),
  getNormalizeByCompany: (empresa: string) => requests.get(`/getNormalizeByCompany/${empresa}`),
  updateNormalizers: (id: any, normlizerData: any) =>
    requests.put(`updateNormalizers/${id}`, normlizerData),
}

const history = {
  getAllFiles: () => requests.get("/getAllFiles"),
  getFilesByCode: (codigo: number) => requests.get(`/getFilesByCode/${codigo}`),
  getFilesByIdPerson: (id_persona: number) => requests.get(`/getFilesByIdPerson/${id_persona}`),
  getFilesByPerson: (identificacion: string) => requests.get(`/getFilesByPerson/${identificacion}`),
  getHistoryFiles: (codigo: number) => requests.get(`/getHistoryFiles/${codigo}`),
  updateFiles: (codigo: any, usuario_sistema: string, filesData: any) =>
    requests.put(`updateFiles/${codigo}/${usuario_sistema}`, filesData),
}
const api = {
  Account,
  TestErrors,
  Zones,
  AcountingAccounts,
  statusAssets,
  roles,
  States,
  serviceLife,
  newAsset,
  assetRetirement,
  payments,
  observations,
  depreciations,
  persons,
  family,
  contacts,
  directions,
  history,
  requirements,
  referrals,
  referralsDetails,
  incomes,
  Ubications,
  normalizers,
};

export default api;
