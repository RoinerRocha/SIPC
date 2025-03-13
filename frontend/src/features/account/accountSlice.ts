import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { User } from "../../app/models/user";
import { FieldValues } from "react-hook-form";
import api from "../../app/api/api";
import { router } from "../../app/router/Routes";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

// Define la forma del estado de la cuenta
interface AccountState {
    user: User | null; // El usuario actual, puede ser nulo si no hay sesión activa
    isAuthenticated: boolean; // Indica si el usuario está autenticado
}

// Estado inicial de la cuenta
const initialState: AccountState = {
    user: null,
    isAuthenticated: false, // Al principio, el usuario no está autenticado
}


// Acción asíncrona para iniciar sesión
export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            const user = await api.Account.login(data);
            const token = user.token;
            const decodedToken: any = jwtDecode(token);
            const username = decodedToken.nombre_usuario;
            const profile = decodedToken.perfil_asignado;
            const email = decodedToken.correo_electronico;
            const estado = decodedToken.estado;

            localStorage.setItem('user', JSON.stringify(user));
            thunkAPI.dispatch(setAuthenticated(true));
            return { ...user, nombre_usuario: username, perfil_asignado: profile, correo_electronico: email, estado: estado };
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 404)) {
                localStorage.removeItem('user');
                throw new Error('Credenciales incorrectas');
            } else if (error.response && error.response.status === 403) {
                toast.error(error.response.data.message);
                return thunkAPI.rejectWithValue({ error: error.response.data.message });
            } else {
                return thunkAPI.rejectWithValue({ error: error.data });
            }
        }
    }
);

// Acción asíncrona para obtener el usuario actual
export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        const storedUser = JSON.parse(localStorage.getItem('user')!);
        thunkAPI.dispatch(setUser(storedUser));
        thunkAPI.dispatch(setAuthenticated(true));

        try {
            const user = await api.Account.currentUser();
            const token = user.token;
            const decodedToken: any = jwtDecode(token);
            const username = decodedToken.nombre_usuario;
            const profile = decodedToken.perfil_asignado;
            const email = decodedToken.correo_electronico;
            const estado = decodedToken.estado;

            localStorage.setItem('user', JSON.stringify(user));
            return { ...user, nombre_usuario: username, perfil_asignado: profile, correo_electronico: email, estado: estado };
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        condition: () => {
            if (!localStorage.getItem('user')) return false;
        }
    }
);
// Crea un slice de Redux para manejar el estado de la cuenta
export const accountSlice = createSlice({
    name: 'account', // Nombre del slice
    initialState, // Estado inicial
    reducers: {
        // Reducer para establecer el estado de autenticación
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload; // Actualiza isAuthenticated con el valor proporcionado
        },
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            router.navigate('/');
            toast.success('Se ha cerrado sesion');
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
    // Reducers adicionales para manejar los resultados de las acciones asíncronas
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Sesion expirada - favor volver a iniciar sesion');
            router.navigate('/');
        })
        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            state.user = action.payload; // Actualiza el usuario con el valor obtenido de la acción
        });
        builder.addMatcher(isAnyOf(signInUser.rejected), (state, action) => {
            console.log(action.payload); // Maneja los errores de las acciones asíncronas
        })
    })
})

// Exporta las acciones y reducers definidos en el slice de Redux
export const { setAuthenticated } = accountSlice.actions; 

export const {signOut, setUser} = accountSlice.actions;

