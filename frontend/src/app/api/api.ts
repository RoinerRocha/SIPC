import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { store } from "../../store/configureStore";
import Swal from 'sweetalert2';

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

const API_URL = process.env.REACT_APP_BACKEND_URL;

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001/api/";


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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Ha ocurrido un error',
          showConfirmButton: false,
          timer: 3000
        });
        break;
      case 401:
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Ha ocurrido un error',
          showConfirmButton: false,
          timer: 3000
        });
        break;
      case 404:
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Ha ocurrido un error',
          showConfirmButton: false,
          timer: 3000
        });
        break;
      case 500:
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Ha ocurrido un error',
          showConfirmButton: false,
          timer: 3000
        });
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
  updateUserPassword: (accountId: any, accountData: any) =>
    requests.put(`/updateUserPassword/${accountId}`, accountData),
  deleteUser: (id: number) => requests.delete(`/deleteUser/${id}`),
  sendEmail: (values: any) => requests.post("sendEmails", values),
  newPasword: (values: any) => requests.post("updatePasswordByEmail", values),
  getFieldLimits: () => requests.get("/users/limits"),
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

const payments = {
  savePayments: (values: any) => requests.post("createPayment", values),
  updatePayments: (id_pago: any, paymentData: any) =>
    requests.put(`/updatePayment/${id_pago}`, paymentData),//metodo comentado en el backend
  getPaymentsByIdentification: (identificacion: string) => requests.get(`/getPaymentsByPerson/${identificacion}`),
  getPaymentsByIDPersona: (id_persona: number) => requests.get(`/getPaymentsByIDPerson/${id_persona}`),
  getPaymentsByIDPago: (id_pago: number) => requests.get(`/getPaymentsByIDPago/${id_pago}`),
  getAllPayments: () => requests.get("/getAllPayments"),
  getFieldLimits: () => requests.get("/payments/limits"),
  // generateExcelFile: (id: number) => requests.download(`/SalesExcelFile/${id}`),
};

const observations = {
  saveObservations: (values: any) => requests.post("createObservations", values),
  getAllObservations: () => requests.get("/getAllObservations"),
  getObservationsByPerson: (id_persona: number) => requests.get(`/getObservationsByIDPerson/${id_persona}`),
  getObservationsByIdentification: (identificacion: string) => requests.get(`/getObservationByPerson/${identificacion}`),
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
  getFieldLimits: () => requests.get("/requirement/limits"),
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
  getFieldLimits: () => requests.get("/details/limits"),
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
  getFieldLimits: () => requests.get("/persons/limits"),
}

const family = {
  saveMembers: (values: any) => requests.post("/createFamilyMember", values),
  getMembersByPerson: (idpersona: number) => requests.get(`/getMemberByPerson/${idpersona}`),
  getMembersByID: (idnucleo: number) => requests.get(`/getMemberByID/${idnucleo}`),
  updateMember: (idnucleo: any, memberData: any) =>
    requests.put(`updateMember/${idnucleo}`, memberData),
  deleteMember: (idnucleo: number) => requests.delete(`deleteMember/${idnucleo}`),
  getFieldLimits: () => requests.get("/family/limits"),
}

const contacts = {
  saveContacts: (values: any) => requests.post("/createContact", values),
  getContacts: () => requests.get("/getAllContacts"),
  getContactsByPerson: (id_persona: number) => requests.get(`/getContactsByPerson/${id_persona}`),
  getContactsByID: (id_contacto: number) => requests.get(`/getContactsByID/${id_contacto}`),
  getFieldLimits: () => requests.get("/contacts/limits"),
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
  getFieldLimits: () => requests.get("/directions/limits"),
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
  getFieldLimits: () => requests.get("/incomes/limits"),
}

const normalizers = {
  saveNormalizer: (values: any) => requests.post("/createNormalizers", values),
  getAllNormalizers: () => requests.get("/getAllNormalizers"),
  getAnalistasEntidad: () => requests.get("/getAnalistasEntidad"),
  getAnalistasConstructora: () => requests.get("/getAnalistasConstructora"),
  getUniqueCompanies: () => requests.get("/getUniqueCompanies"),
  getNormalizerById: (id: number) => requests.get(`/getNormalizersById/${id}`),
  getFiscalesAndIngenierosByEmpresa: (empresa: string) => requests.get(`/getFiscalesIngenieros/${empresa}`),
  getNormalizeByCompany: (empresa: string) => requests.get(`/getNormalizeByCompany/${empresa}`),
  updateNormalizers: (id: any, normlizerData: any) =>
    requests.put(`updateNormalizers/${id}`, normlizerData),
  getFieldLimits: () => requests.get("/normalizer/limits"),
}

const history = {
  getAllFiles: () => requests.get("/getAllFiles"),
  getFilesByCode: (codigo: number) => requests.get(`/getFilesByCode/${codigo}`),
  getFilesByIdPerson: (id_persona: number) => requests.get(`/getFilesByIdPerson/${id_persona}`),
  getFilesByPerson: (identificacion: string) => requests.get(`/getFilesByPerson/${identificacion}`),
  getHistoryFiles: (codigo: number) => requests.get(`/getHistoryFiles/${codigo}`),
  updateFiles: (codigo: any, usuario_sistema: string, filesData: any) =>
    requests.put(`updateFiles/${codigo}/${usuario_sistema}`, filesData),
  getFieldLimits: () => requests.get("/files/limits"),
}

const StateFiles = {
  getAllStateFiles: () => requests.get("/getAllStateFiles"),
  getStateFilesByGroup: (grupo: string) => requests.get(`/getStateFilesByGroup/${grupo}`),
}

const SubStateFiles = {
  getAllCompanySituation: () => requests.get("/getAllCompanySituation"),
  getAllCompanyProgram: () => requests.get("/getAllCompanyProgram"),
  getAllBanhviState: () => requests.get("/getAllBanhviState"),
  getAllBanhviPurpose: () => requests.get("/getAllBanhviPurpose"),
  getAllEntity: () => requests.get("/getAllEntity"),
  getAllStateEntity: () => requests.get("/getAllStateEntity"),
}

const powerBI = {
  getEmbedData: () => axios.get(`${API_URL}getPowerBIEmbedUrl`),
};

const api = {
  powerBI,
  Account,
  TestErrors,
  roles,
  States,
  payments,
  observations,
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
  StateFiles,
  SubStateFiles,
};

export default api;
