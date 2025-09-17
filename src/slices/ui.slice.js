import {
    createSlice,
    createAction
} from "@reduxjs/toolkit"
import {
    setLocation as setLocationService
} from "../services/location.service"

const initialState = {
    isAuthorized: false,
    isMaster: false,
    isLoading: true,
    location: {
        latitude: 59.9311,
        longitude: 30.3609
    }
}

const selectUI = (state) => state.ui

const setAuthorization = createAction("ui/setAuthorization")
const setMaster = createAction("ui/setMaster")
const setLoading = createAction("ui/setLoading")
const setLocation = createAction("ui/setLocation")

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setAuthorization(state, action) {
            state.isAuthorized = action.payload
        },
        setMaster(state, action) {
            state.isMaster = action.payload
        },
        setLoading(state, action) {
            state.isLoading = action.payload
        },
        setLocation(state, action) {
            setLocationService(action.payload)
            state.location = action.payload
        }
    }
})

export default uiSlice.reducer

export {
    selectUI,
    setAuthorization,
    setMaster,
    setLoading,
    setLocation
}
