import { createSlice, createAction } from '@reduxjs/toolkit'

const initialState = {
    data: []
}

export const selectNotifications = (state) => state.notifications.data

export const pushNotification = createAction('notifications/push')
export const removeNotification = createAction('notifications/remove')

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        push(state, action) {
            state.data.push(action.payload)

            if (state.data.length > 3) {
                state.data.shift()
            }
        },
        remove(state, action) {
            state.data.splice(action.payload, 1)
        }
    }
})

export default notificationsSlice.reducer
