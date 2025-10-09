import appFetch from './api'

const getArticle = (id) => appFetch("index/article/" + id)

const getArticles = () => appFetch("index/articles")

// Method to fetch a single article by ID
//~ const getArticleTestData = (id) => {
    //~ return new Promise((resolve) => {
        //~ const mockArticle = {
            //~ id: 1,
            //~ title: 'Новая',
            //~ text: `Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без заметных изменений пять веков, но и перешагнул в электронный дизайн. Его популяризации в новое время послужили публикация листов Letraset с образцами Lorem Ipsum в 60-х годах и, в более недавнее время, программы электронной вёрстки типа Aldus PageMaker, в шаблонах которых используется Lorem Ipsum.`,
            //~ views: 6,
            //~ likes: 5,
            //~ cover_image: null,
            //~ created_at: "2024-03-26T12:00:00"
        //~ };

        //~ // Simulate network delay
        //~ setTimeout(() => resolve(mockArticle), 500);
    //~ });
//~ };

// Method to fetch all articles
//~ const getArticlesTestData = () => {
    //~ return new Promise((resolve) => {
        //~ const mockArticles = [
            //~ {
                //~ id: 1,
                //~ title: 'Новая',
                //~ text: `Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без заметных изменений пять веков, но и перешагнул в электронный дизайн. Его популяризации в новое время послужили публикация листов Letraset с образцами Lorem Ipsum в 60-х годах и, в более недавнее время, программы электронной вёрстки типа Aldus PageMaker, в шаблонах которых используется Lorem Ipsum.`,
                //~ views: 6,
                //~ likes: 5,
                //~ cover_image: null,
                //~ created_at: "2024-03-26T12:00:00"
            //~ },
            //~ {
                //~ id: 2,
                //~ title: 'Другой',
                //~ text: `Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без заметных изменений пять веков, но и перешагнул в электронный дизайн. Его популяризации в новое время послужили публикация листов Letraset с образцами Lorem Ipsum в 60-х годах и, в более недавнее время, программы электронной вёрстки типа Aldus PageMaker, в шаблонах которых используется Lorem Ipsum.`,
                //~ views: 7,
                //~ likes: 5,
                //~ cover_image: null,
                //~ created_at: "2024-03-27T12:00:00"
            //~ }
        //~ ];

        //~ // Simulate network delay
        //~ setTimeout(() => resolve(mockArticles), 500);
    //~ });
//~ };

const getArticleComments = (articleId) =>
    appFetch(`index/article/${articleId}/comments`)

// Method to fetch article comments for a given article ID
//~ const getArticleCommentsTestData = (articleId) => {
    //~ return new Promise((resolve) => {
        //~ const mockComments = [
            //~ {
                //~ id: 2,
                //~ article_id: articleId,
                //~ sender_id: 6,
                //~ sender: {
                    //~ id: 6,
                    //~ phone: "+79111111111",
                    //~ name: "test",
                    //~ lastname: "test",
                    //~ avatar: "files/Снимок экрана от 2025-01-28 11-58-29.png",
                    //~ number_of_submissions: 4
                //~ },
                //~ text: "Тест",
                //~ likes: 0,
                //~ created_at: "2025-02-25T20:04:18.783762"
            //~ },
        //~ ];

        //~ // Simulate network delay
        //~ setTimeout(() => resolve(mockComments), 500);
    //~ });
//~ };


const createArticleComment = (articleId, payload) =>
    appFetch(`index/article/${articleId}/comment`, {
        method: "POST",
        body: JSON.stringify(payload)
    })

const likeArticle = (articleId) =>
    appFetch(`index/like-article/${articleId}`, {
        method: "PATCH"
    })
    
const dislikeArticle = (articleId) =>
    appFetch(`index/dislike-article/${articleId}`, {
        method: "PATCH"
    })
    
const likeArticleComment = (commentId) =>
    appFetch(`index/article/comment/${commentId}/like`, {
        method: "POST"
    })
    
const dislikeArticleComment = (commentId) =>
    appFetch(`index/article/comment/${commentId}/dislike`, {
        method: "DELETE"
    })

// Like an article
//~ const likeArticleTestData = (articleId) => {
    //~ return new Promise((resolve) => {
        //~ setTimeout(() => {
            //~ resolve({
                //~ status: 'success',
                //~ message: `Article with ID ${articleId} liked successfully`
            //~ });
        //~ }, 500); // Simulate network delay
    //~ });
//~ };

// Dislike an article
//~ const dislikeArticleTestData = (articleId) => {
    //~ return new Promise((resolve) => {
        //~ setTimeout(() => {
            //~ resolve({
                //~ status: 'success',
                //~ message: `Article with ID ${articleId} disliked successfully`
            //~ });
        //~ }, 500); // Simulate network delay
    //~ });
//~ };

// Like a comment on an article
//~ const likeArticleCommentTestData = (commentId) => {
    //~ return new Promise((resolve) => {
        //~ setTimeout(() => {
            //~ resolve({
                //~ status: 'success',
                //~ message: `Comment with ID ${commentId} liked successfully`
            //~ });
        //~ }, 500); // Simulate network delay
    //~ });
//~ };

// Dislike a comment on an article
//~ const dislikeArticleCommentTestData = (commentId) => {
    //~ return new Promise((resolve) => {
        //~ setTimeout(() => {
            //~ resolve({
                //~ status: 'success',
                //~ message: `Comment with ID ${commentId} disliked successfully`
            //~ });
        //~ }, 500); // Simulate network delay
    //~ });
//~ };


export {
    getArticle,
    getArticles,
    getArticleComments,
    createArticleComment,
    likeArticle,
    dislikeArticle,
    likeArticleComment,
    dislikeArticleComment
}
