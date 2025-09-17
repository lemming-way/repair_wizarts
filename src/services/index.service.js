import appFetch from "../utilities/appFetch"

const getCounters = () => appFetch("index/counters")

const getCovers = () => appFetch("index/cover-pictures")

// Тестовая версия метода getCounters
const getCountersTest = () => {
    return new Promise((resolve) => {
        // Мокаемый объект с количеством мастеров, заказов и запросов
        setTimeout(() => {
            const mockCounters = {
                masters: 10,
                submissions: 50
            };
            resolve(mockCounters);
        }, 500); // Имитация задержки сети
    });
};

// Тестовая версия метода getCovers
const getCoversTest = () => {
    return new Promise((resolve) => {
        // Мокаемый массив объектов CoverPicture
        setTimeout(() => {
            const mockCoverPictures = [
                { id: 1, image: "cover1.jpg" },
                { id: 2, image: "cover2.jpg" },
                { id: 3, image: "cover3.jpg" }
            ];
            resolve(mockCoverPictures);
        }, 500); // Имитация задержки сети
    });
};

export {
    getCounters,
    getCovers
}
