import appFetch from '../utilities/appFetch'

const getFeedback = (username) =>
    appFetch("submission/feedbacks/" + username)

const createFeedback = (payload) => {
    const formData = new FormData()
    formData.append("data", JSON.stringify(payload.data))

    Array.from(payload.files).forEach((f) => {
        formData.append("pictures", f)
    })

    return appFetch("submission/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        body: formData
    })
}

const replyToFeedback = (payload) =>
    appFetch("submission/feedback/" + payload.id, {
        method: "PATCH",
        body: JSON.stringify(payload)
    })

//~ // Тестовая версия метода getFeedback
//~ const getFeedbackTest = (username) => {
    //~ return new Promise((resolve) => {
        //~ // Мокаемый объект SubmissionFeedback для указанного username
        //~ setTimeout(() => {
            //~ const mockFeedback = {
                //~ id: 1,
                //~ client_id: 1,
                //~ client: {
                    //~ name: "John",
                    //~ lastname: "Doe"
                //~ },
                //~ master_username: "master1",
                //~ master: {
                    //~ name: "Alice",
                    //~ lastname: "Smith"
                //~ },
                //~ rating: 5,
                //~ description: "Excellent service!",
                //~ pictures: ["pic1.jpg", "pic2.jpg"],
                //~ created_at: "2025-03-01T12:00:00Z",
                //~ master_response: "Thank you for your feedback!"
            //~ };
            //~ resolve(mockFeedback);
        //~ }, 500); // Имитация задержки сети
    //~ });
//~ };

//~ // Тестовая версия метода createFeedback
//~ const createFeedbackTest = (payload) => {
    //~ return new Promise((resolve) => {
        //~ // Мокаемый ответ, имитирующий успешное создание отзыва
        //~ setTimeout(() => {
            //~ const mockCreatedFeedback = {
                //~ id: 1,
                //~ client_id: payload.client_id,
                //~ client: {
                    //~ name: "John",
                    //~ lastname: "Doe"
                //~ },
                //~ master_username: payload.master_username,
                //~ master: {
                    //~ name: "Alice",
                    //~ lastname: "Smith"
                //~ },
                //~ rating: payload.data.rating,
                //~ description: payload.data.description,
                //~ pictures: payload.files ? Array.from(payload.files).map(f => f.name) : [],
                //~ created_at: new Date().toISOString(),
                //~ master_response: null
            //~ };
            //~ resolve(mockCreatedFeedback);
        //~ }, 500); // Имитация задержки сети
    //~ });
//~ };

//~ // Тестовая версия метода replyToFeedback
//~ const replyToFeedbackTest = (payload) => {
    //~ return new Promise((resolve) => {
        //~ // Мокаемый объект, имитирующий ответ на отзыв
        //~ setTimeout(() => {
            //~ const mockReply = {
                //~ id: payload.id,
                //~ client_id: 1,
                //~ master_username: "master1",
                //~ rating: 5,
                //~ description: "Excellent service!",
                //~ pictures: ["pic1.jpg", "pic2.jpg"],
                //~ created_at: "2025-03-01T12:00:00Z",
                //~ master_response: payload.master_response
            //~ };
            //~ resolve(mockReply);
        //~ }, 500); // Имитация задержки сети
    //~ });
//~ };
export {
    getFeedback,
    createFeedback,
    replyToFeedback
}
