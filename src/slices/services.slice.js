import {
    createSlice,
    createAsyncThunk
} from "@reduxjs/toolkit"
import { getServices } from "../services/service.service"
import FetchStatus from "../constants/FetchStatus"

const fetchServices = createAsyncThunk("services/fetch",
    (_, { rejectWithValue }) => getServices().catch(rejectWithValue))

const selectServices = (state) => state.services.data

const selectServicesStatus = (state) => state.services.status

const initialState = {
    data: {
        categories: [],
        service_types: [],
        devices: [],
        repair_types: []
    },
    status: FetchStatus.IDLE,
    error: null
}

const servicesSlice = createSlice({
    name: "services",
    initialState,
    extraReducers: (b) => b
        .addCase(fetchServices.pending, (state, action) => {
            state.status = FetchStatus.LOADING
        })
        .addCase(fetchServices.fulfilled, (state, action) => {
            state.data = action.payload
            state.status = FetchStatus.SUCCEEDED
        })
        .addCase(fetchServices.rejected, (state, action) => {
            state.status = FetchStatus.FAILED
            state.error = action.payload
        })
})

export default servicesSlice.reducer

export {
    fetchServices,
    selectServices,
    selectServicesStatus
}
