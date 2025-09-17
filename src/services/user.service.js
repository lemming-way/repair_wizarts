import appFetch from "../utilities/appFetch"
import { removeToken } from "./token.service"

const getUser = () => appFetch("user/me")
// Method to fetch the current user data
const getUserTestData = () => {
    return new Promise((resolve) => {
        const mockUser = {
            id: 6,
            name: "test",
            lastname: "test",
            email: "test@gmail.com",
            phone: "+79111111111",
            avatar: "files/Снимок экрана от 2025-01-28 11-58-29.png",
            is_superuser: false,
            is_email_verified: true,
            is_phone_verified: true,
            number_of_submissions: 4,
            master: null
        };

        // Simulate network delay
        setTimeout(() => resolve(mockUser), 500);
    });
};

const getUserUnreadMessages = () => appFetch("user/unread-messages")

const getMasterByUsername = (username) => appFetch("user/master/" + username)

const getMasterRepairs = () => appFetch("service/master-repairs")

const getClientById = (id) =>
    appFetch("user/client/" + id)

const updateUser = (data, id) => {
    const formData = new FormData()
    formData.append("file", "")
    formData.append("data", JSON.stringify(data))

    return appFetch("user/update/" + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        body: formData
    })
}

const updateUserPhoto = (data, id) => {
    const formData = new FormData()
    formData.append("file", data)
    formData.append("data", JSON.stringify({ }))

    return appFetch("user/update/" + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        body: formData
    })
}

const updateMasterPictures = (userId, payload) => {
    const form = new FormData()
    form.append("data", JSON.stringify({ }))

    if (!payload.length) {
        form.append("pictures", [])
    }
    payload.forEach((v) => form.append("pictures", v))

    return appFetch("user/update/" + userId, {
        method: "PATCH",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: form
    })
}

const deleteUser = async () => {
    const result = await appFetch("user/delete-account", { method: "DELETE" })
    removeToken()
    return result
}

const createUserCustomService = (data) => appFetch("service/repair_type", {
    method: "POST",
    body: JSON.stringify(data)
})

const updateUserService = (data, id) =>
    appFetch("service/master-repair/" + id, {
        method: "PATCH",
        body: JSON.stringify(data)
    })

const getUserMode = () =>
    JSON.parse(localStorage.getItem("isMaster"))

const setUserMode = (mode) =>
    localStorage.setItem("isMaster", mode)

const recoverPassword = (payload) =>
    appFetch("user/recover-password", {
        method: "POST",
        body: JSON.stringify(payload)
    })

const recoverPasswordVerify = (payload) =>
    appFetch(`user/verify-password-recovery/${payload.code}?user_id=${payload.user}`, {
        method: "POST"
    })

const recoverPasswordSend = (payload) =>
    appFetch("user/change-password", {
        method: "POST",
        body: JSON.stringify(payload)
    })

const keepUserAuthorized = (v) =>
    localStorage.setItem("keepAuthorized", JSON.stringify(v))

const getKeepUserAuthorized = () =>
    JSON.parse(localStorage.getItem("keepAuthorized"))

export {
    getUser,
    getUserUnreadMessages,
    getClientById,
    getMasterRepairs,
    updateUser,
    updateUserService,
    updateMasterPictures,
    deleteUser,
    createUserCustomService,
    updateUserPhoto,
    getMasterByUsername,
    getUserMode,
    setUserMode,
    recoverPassword,
    recoverPasswordVerify,
    recoverPasswordSend,
    keepUserAuthorized,
    getKeepUserAuthorized
}
