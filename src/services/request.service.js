import appFetch from "../utilities/appFetch"

const createRequest = (payload) => {
    const body = new FormData()
    body.append("data", JSON.stringify(payload.data))

    if (payload.files.length) {
        [...payload.files].forEach((f) => {
            body.append("files", f)
        })
    }

    return appFetch("submission/request", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        body
    })
}

const updateRequest = (payload) =>
    appFetch("submission/request/" + payload.id, {
        method: "PATCH",
        body: JSON.stringify(payload)
    })
    
const updateRequestStatus = (id, payload) =>
    appFetch("submission/request/" + id, {
        method: "PATCH",
        body: JSON.stringify({ status: payload })
    })

const updateRequestStatusFromMaster = (id, payload) =>
    appFetch(`submission/complete-request/${id}?status=${payload}`, {
        method: "PATCH"
    })

const deleteRequest = (requestId) =>
    appFetch("submission/request/" + requestId, {
        method: "DELETE"
    })

const getRequestById = (requestId) =>
    appFetch("submission/request/" + requestId)

const getClientRequests = () => appFetch("submission/client-requests")

const getClientRequestsTestData = () => {
    return new Promise((resolve) => {
        const mockResponse = [
            {
                id: 36,
                client_id: 6,
                client: {
                    id: 6,
                    phone: "+79111111111",
                    name: "test",
                    lastname: "test",
                    avatar: "files/Снимок экрана от 2025-01-28 11-58-29.png",
                    number_of_submissions: 4,
                },
                title: "test",
                description: "test",
                pictures: [],
                client_price: 1000.0,
                service_type_id: 1,
                service_type: { name: "Ремонт телефона" },
                status: "Активно",
                created_at: "2025-02-25T20:06:08.132360",
                expires_at: "2025-02-26T20:06:08.130533",
                number_of_offers: 0,
                views: 0,
            },
        ];

        // Simulate network delay
        setTimeout(() => resolve(mockResponse), 500);
    });
};

const getMasterRequests = () => appFetch("submission/requests")

const getMasterPersonalRequests = () => appFetch("submission/master-requests")

export {
    createRequest,
    updateRequest,
    updateRequestStatus,
    updateRequestStatusFromMaster,
    deleteRequest,
    getClientRequests,
    getMasterRequests,
    getMasterPersonalRequests,
    getRequestById,
}

