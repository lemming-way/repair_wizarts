import appFetch from "../utilities/appFetch"

const createDialog = (payload) =>
    appFetch("chat/dialog", {
        method: "POST",
        body: JSON.stringify(payload)
    })


// Тестовая версия метода createDialog
const createDialogTest = (payload) => {
    return new Promise((resolve) => {
        // Мокаемый объект Dialog, который будет возвращен после создания диалога
        setTimeout(() => {
            const mockDialog = {
                id: 1,
                order_id: payload.order_id || null,
                request_id: payload.request_id || null,
                sender1_id: payload.sender1_id,
                sender1: {
                    name: payload.sender1_name,
                    lastname: payload.sender1_lastname
                },
                sender2_id: payload.sender2_id,
                sender2: {
                    name: payload.sender2_name,
                    lastname: payload.sender2_lastname
                },
                messages: [] // Начальный список сообщений пуст
            };

            resolve(mockDialog);
        }, 500); // Имитация задержки сети
    });
};

export { createDialog }
