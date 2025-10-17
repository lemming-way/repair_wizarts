import appFetch from '../utilities/appFetch'

const setLocation = (data) =>
    localStorage.setItem("location", JSON.stringify(data))

const getLocation = () =>
    JSON.parse(localStorage.getItem("location"))

const getCities = () => appFetch("index/cities")

// Тестовая версия метода getCities
// const getCitiesTest = () => {
//     return new Promise((resolve) => {
//         // Мокаемый список городов
//         setTimeout(() => {
//             const mockCities = [
//                 { id: 1, name: "Moscow", latitude: 55.7558, longitude: 37.6176 },
//                 { id: 2, name: "Saint Petersburg", latitude: 59.9343, longitude: 30.3351 },
//                 { id: 3, name: "Novosibirsk", latitude: 55.0084, longitude: 82.9357 }
//             ];
//             resolve(mockCities);
//         }, 500); // Имитация задержки сети
//     });
// }; ###


export {
    getCities,
    getLocation,
    setLocation
}
