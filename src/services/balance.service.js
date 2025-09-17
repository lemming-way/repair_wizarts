import appFetch from "../utilities/appFetch"

const getBalanceHistory = () => appFetch("user/deposit-history")

const replenishBalance = (amount) =>
    appFetch("user/replenish-balance/" + amount, {
        method: "POST"
    })

const updateBalance = (id) => appFetch("user/confirm-payment/" + id)


// Тестовая версия метода getBalanceHistory, который возвращает массив объектов
const getBalanceHistoryTest = () => {
    return new Promise((resolve) => {
        // Мокаемый ответ с массивом объектов
        setTimeout(() => {
            const mockHistory = [
                {
                    master_username: "master123",
                    id: "uuid-1",
                    payment_id: "payment-uuid-1",
                    status: "completed",
                    paid: true,
                    amount: 100.0,
                    created_at: "2025-03-01T12:00:00Z",
                    description: "Deposit for services",
                    is_confirmed: true
                },
                {
                    master_username: "master456",
                    id: "uuid-2",
                    payment_id: "payment-uuid-2",
                    status: "pending",
                    paid: false,
                    amount: 50.0,
                    created_at: "2025-03-02T15:00:00Z",
                    description: "Deposit for services",
                    is_confirmed: false
                }
            ];
            resolve(mockHistory);
        }, 500); // Имитация задержки сети
    });
};

// Тестовая версия метода replenishBalance
const replenishBalanceTest = (amount) => {
    return new Promise((resolve) => {
        // Мокаемый объект данных из БД
        setTimeout(() => {
            const payment = {
                id: "payment-uuid-3",
                confirmation: {
                    confirmation_url: "https://example.com/confirmation-url"
                }
            };
            const mockData = {
                payment_id: payment.id,
                confirmation_url: payment.confirmation.confirmation_url
            };
            resolve(mockData);
        }, 500); // Имитация задержки сети
    });
};

// Тестовая версия метода updateBalance
const updateBalanceTest = (id) => {
    return new Promise((resolve) => {
        // Мокаемый ответ
        setTimeout(() => {
            const mockResponse = {
                result: "Success"
            };
            resolve(mockResponse);
        }, 500); // Имитация задержки сети
    });
};

export {
    getBalanceHistory,
    replenishBalance,
    updateBalance,
}
