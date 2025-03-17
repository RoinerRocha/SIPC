import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roleModels } from "../app/models/roleModels";
import api from "../app/api/api";

// Estado inicial
interface RoleState {
    roles: roleModels[];
    loading: boolean;
}

const initialState: RoleState = {
    roles: [],
    loading: false,
};

// Acción para obtener los roles desde la API
export const fetchRoles = createAsyncThunk<roleModels[]>(
    "roles/fetchRoles",
    async (_, thunkAPI) => {
        try {
            const response = await api.roles.getRoles();
            return response.data; // Retorna la lista de roles
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

// Slice de roles
const roleSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchRoles.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchRoles.fulfilled, (state, action) => {
            state.roles = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchRoles.rejected, (state) => {
            state.loading = false;
        });
    },
});

export default roleSlice.reducer;
