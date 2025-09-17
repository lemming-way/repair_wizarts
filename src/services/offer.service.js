import appFetch from "../utilities/appFetch"

const getOffers = (id) => appFetch("submission/offers?request_id=" + id)

const createOffer = (payload) =>
    appFetch("submission/offer", {
        method: "POST",
        body: JSON.stringify(payload)
    })

const acceptOffer = (id) =>
    appFetch("submission/accept-offer/" + id, {
        method: "PATCH"
    })


// Тестовая версия метода getOffers
const getOffersTest = (id) => {
    return new Promise((resolve) => {
        // Мокаемый список предложений (предполагается, что id = 1)
        setTimeout(() => {
            const mockOffers = [
                {
                    id: 1,
                    master_username: "master1",
                    message: "Предложение для заказа 1",
                    request_id: id,
                    price: 5000,
                    time: "2025-03-02T10:00:00",
                    is_accepted: false,
                    created_at: "2025-03-02T09:00:00"
                },
                {
                    id: 2,
                    master_username: "master2",
                    message: "Предложение для заказа 1",
                    request_id: id,
                    price: 6000,
                    time: "2025-03-02T12:00:00",
                    is_accepted: false,
                    created_at: "2025-03-02T11:00:00"
                }
            ];
            resolve(mockOffers);
        }, 500); // Имитация задержки сети
    });
};

// Тестовая версия метода createOffer
const createOfferTest = (payload) => {
    return new Promise((resolve) => {
        // Мокаем успешный ответ с созданием нового предложения
        setTimeout(() => {
            const mockOffer = {
                id: 3,
                master_username: payload.master_username,
                message: payload.message,
                request_id: payload.request_id,
                price: payload.price,
                time: payload.time,
                is_accepted: false,
                created_at: new Date().toISOString()
            };
            resolve(mockOffer);
        }, 500); // Имитация задержки сети
    });
};

// Тестовая версия метода acceptOffer
const acceptOfferTest = (id) => {
    return new Promise((resolve) => {
        // Мокаем успешный ответ с подтверждением предложения
        setTimeout(() => {
            const mockResponse = {
                result: "Success"
            };
            resolve(mockResponse);
        }, 500); // Имитация задержки сети
    });
};

export {
    acceptOffer,
    getOffers,
    createOffer
}
