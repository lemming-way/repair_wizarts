import appFetch from "../utilities/appFetch"

const getReviews = () => appFetch("index/reviews")

// New method to return test data with a 'status' field
//~ const getReviewTestData = () => {
    //~ return new Promise((resolve) => {
        //~ const mockResponse = {
            //~ status: 'success',
            //~ data: [
                //~ {
                    //~ id: 1,
                    //~ sender: "Иван",
                    //~ rating: 5,
                    //~ message: "Все классно! Все понравилось!",
                    //~ created_at: "2024-03-27T12:00:00",
                    //~ is_active: true,
                //~ }
            //~ ]
        //~ };

        //~ // Simulate network delay
        //~ setTimeout(() => resolve(mockResponse), 500);
    //~ });
//~ };

const createReview = (payload) => appFetch("index/review", {
    method: "POST",
    body: JSON.stringify(payload)
})

//~ const createReviewTestData = (payload) => {
    //~ return new Promise((resolve) => {
        //~ const mockResponse = {
            //~ status: 'success',
            //~ data: {
                //~ id: 4,
                //~ sender: 'Иван Иванов', // Static value as per your request
                //~ rating: 5,              // Static value for rating
                //~ message: 'Отличный фильм!', // Static value for message
                //~ created_at: new Date().toISOString(),
                //~ is_active: true, // You can set this based on your logic (e.g., true or false)
            //~ }
        //~ };

        //~ // Simulate network delay
        //~ setTimeout(() => resolve(mockResponse), 500);
    //~ });
//~ };

export {
    getReviews,
    createReview
}
