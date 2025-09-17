import { Link } from "react-router-dom"
import { useService } from "../../hooks/useService"
import { getMasterPersonalRequests } from "../../services/request.service"
import SERVER_PATH from "../../constants/SERVER_PATH"

const PersonalRequests = (props) => {
    const requests = useService(getMasterPersonalRequests, [])

    const getEndingOfDigit = (digit) => {
        if (digit % 100 > 10 && digit % 100 < 20) {
            return "ов"
        }

        switch (digit % 10) {
            case 1:
                return ""
            case 2: case 3: case 4:
                return "а"
            default:
                return "ов"
        }
    }

    return (
        <>

                <div className="huge-content">
                    <h1>Заказы</h1>

                    <div className="huge-fasfdsoiXC df">
                        <div className="two-input">
                            <Link to='/master/requests/personal'>
                                <div className="myorders">
                                    <p>Мои заказы</p>
                                </div>
                            </Link>
                            <Link to='/master/requests'>
                                <div className="myorders">
                                    <p>Все заказы </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="allorders">
                    <div>
                        <h1 className="allorder__title inter">Новое на бирже - <span>1 проект за сутки</span> </h1>
                        <div className="h bbbmt hbb mobile-h">
                            <div className="big_nav-device big_nav-devicefsdafstX df align mobile-big_nav-device">
                                <div className="fsdfsaooo mobile-big_nav-text_1">
                                    <h2 className="inter-header-left inter">Проект</h2>
                                    <h2 className="inter-header-center inter">Покупатель</h2>
                                    <h2 className="inter-header-right inter">Цена</h2>
                                </div>
                            </div>
                            {requests.data.map((v) => (
                                <Link to={"/master/requests/" + v.id} key={v.id}>
                                    <div className="archive-hee sewreqwreqw">
                                        <div className="nav_applications-3 fasfXf nav_applications-3-gee fsdfsaooo big_nav-device df align mobile-nav_applications-3">
                                            <div className="all-requests-title-container">
                                                <h2>{v.title}</h2>
                                            </div>
                                            <div className="client__order">
                                                <img
                                                    src={SERVER_PATH + v.client?.avatar}
                                                    alt=""
                                                    width="48px"
                                                    height="48px"
                                                    style={{ objectFit: "cover", borderRadius: "24px" }}
                                                />
                                                <div className="info__client__order">
                                                    <h3 className="inter">{v.client?.name}</h3>
                                                    <p className="inter">
                                                        {v.client?.number_of_submissions} заказ{getEndingOfDigit(v.client?.number_of_submissions)} на сайте
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="all-requests-price-container">
                                                <p>{v.client_price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="bri">
                        <a href="#" className="inter">Показать все</a>
                    </div>
                </div>
        </>
    )
}

export default PersonalRequests
