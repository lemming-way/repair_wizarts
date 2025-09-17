import { createSlice, createAction } from "@reduxjs/toolkit";

export const updateOnline = createAction("online/update")

export const selectOnline = (state) => state.online.data

const onlineSlice = createSlice({
    name: 'online',
    initialState: {
        data: []
    },
    reducers: {
        update(state, action) {
            state.data = action.payload
        }
    }
})

export default onlineSlice.reducer
