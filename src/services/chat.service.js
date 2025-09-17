import appFetch from "../utilities/appFetch"

const getDialogs = () =>
    appFetch("chat/dialogs")

const getMessages = (dialogId) =>
    appFetch("chat/messages/" + dialogId)

// Тестовая версия метода getDialogs
const getDialogsTest = () => {
    return new Promise((resolve) => {
        // Мокаемый ответ с массивом объектов Dialog
        setTimeout(() => {
            const mockDialogs = [
                {
                    id: 1,
                    order_id: 1001,
                    request_id: 2001,
                    sender1_id: 1,
                    sender1: { name: "Alice", lastname: "Smith" },
                    sender2_id: 2,
                    sender2: { name: "Bob", lastname: "Johnson" },
                },
                {
                    id: 2,
                    order_id: 1002,
                    request_id: 2002,
                    sender1_id: 3,
                    sender1: { name: "Charlie", lastname: "Brown" },
                    sender2_id: 4,
                    sender2: { name: "David", lastname: "Williams" },
                }
            ];
            resolve(mockDialogs);
        }, 500); // Имитация задержки сети
    });
};

// Тестовая версия метода getMessages
const getMessagesTest = (dialogId) => {
    return new Promise((resolve) => {
        // Мокаемый ответ с массивом объектов Message для заданного dialogId
        setTimeout(() => {
            const mockMessages = [
                {
                    id: 1,
                    dialog_id: dialogId,
                    sender_id: 1,
                    sender: { name: "Alice", lastname: "Smith" },
                    message: "Hello Bob, how are you?",
                    files: [],
                    is_read: true,
                    is_modified: false,
                    sent_at: "2025-03-01T10:00:00Z"
                },
                {
                    id: 2,
                    dialog_id: dialogId,
                    sender_id: 2,
                    sender: { name: "Bob", lastname: "Johnson" },
                    message: "Hi Alice, I'm good, thanks!",
                    files: [],
                    is_read: true,
                    is_modified: false,
                    sent_at: "2025-03-01T10:05:00Z"
                }
            ];
            resolve(mockMessages);
        }, 500); // Имитация задержки сети
    });
};

export {
    getDialogs,
    getMessages
}
