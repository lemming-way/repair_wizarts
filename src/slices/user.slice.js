import {
    createSlice,
    createAsyncThunk,
    createAction
} from "@reduxjs/toolkit"
import { getUser } from "../services/user.service"
import FetchStatus from "../constants/FetchStatus"

const fetchUser = createAsyncThunk("user/fetch",
    (_, { rejectWithValue }) => getUser().catch(rejectWithValue))

const wipeUser = createAction("user/wipe")

const selectUser = (state) => state.user.data

const selectUserStatus = (state) => state.user.status

const initialState = {
    data: { },
    status: FetchStatus.IDLE,
    error: null
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        wipe(state, action) {
            state.data = initialState.data
            state.status = initialState.status
            state.error = initialState.error
        }
    },
    extraReducers: (b) => b
        .addCase(fetchUser.pending, (state, action) => {
            state.status = FetchStatus.LOADING
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
            state.data = action.payload
            state.status = FetchStatus.SUCCEEDED
        })
        .addCase(fetchUser.rejected, (state, action) => {
            state.status = FetchStatus.FAILED
            state.error = action.payload
        })
})

export default userSlice.reducer

export {
    fetchUser,
    wipeUser,
    selectUser,
    selectUserStatus
}
