import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import FetchStatus from '../constants/FetchStatus'
import { getUserUnreadMessages } from '../services/user.service'

export const fetchMessages = createAsyncThunk('messages/fetch',
    (_, { rejectWithValue }) => getUserUnreadMessages().catch(rejectWithValue))

export const selectUnreadMessages = (state) => state.messages.data

export const updateMessages = createAction("messages/update")
export const removeMessages = createAction("messages/remove")

const initialState = {
    data: {
        messages: [],
        count: 0
    },
    status: FetchStatus.IDLE,
    error: null
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        update(state, action) {
            state.data.messages = action.payload
            state.data.count = action.payload
                .reduce((store, value) => store + value.messages.length, 0)
        },
        remove(state, action) {
            state.data.messages = state.data.messages.filter((v) =>
                v.dialog_id !== action.payload.dialog)
            state.data.count -= action.payload.count
        }
    },
    extraReducers: (b) => b
        .addCase(fetchMessages.pending, (state, action) => {
            state.status = FetchStatus.LOADING
        })
        .addCase(fetchMessages.fulfilled, (state, action) => {
            state.data.messages = action.payload
            state.data.count = action.payload
                .reduce((store, value) => store + value.messages.length, 0)
            state.status = FetchStatus.SUCCEEDED
        })
        .addCase(fetchMessages.rejected, (state, action) => {
            state.error = action.payload
            state.status = FetchStatus.FAILED
        })
})

export default messagesSlice.reducer
