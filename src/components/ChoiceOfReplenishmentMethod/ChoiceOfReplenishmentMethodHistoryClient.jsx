import {
    useEffect,
    useState
} from "react";
import YooKassaLogo from '../../img/YooKassaLogo.svg'
import { getBalanceHistory } from "../../services/balance.service";
import {
    Link,
} from "react-router-dom";

function ChoiceOfReplenishmentMethodHistoryClient(){
    const [history, setHistory] = useState([])

    useEffect(() => {
        getBalanceHistory()
            .then(setHistory)
    }, [])

    return (
        <div className="middle-block-2 middle-block-2ffsdfas">

            <Link to="/client/settings/wallet_history" style={{textDecoration: "none"}}>
                <h1>История операций </h1>
            </Link>

            <div className="blocks">
                <div className="block df">
                    <div className="df poplocho">
                        <img src="/img/img-qivi-2.png" alt=""/>
                        <h2>Пополнение счета </h2>
                    </div>
                    <p><span className="abel">+1500</span>₽</p>
                </div>
                <div className="block df">
                    <div className="df poplocho">
                        <img src="/img/img-card-2.png" alt=""/>
                        <h2>Пополнение счета </h2>
                    </div>
                    <p><span className="abel">+2000</span>₽</p>
                </div>
                <div className="block df">
                    <div className="df poplocho">
                        <img src="/img/img-card-2.png" alt=""/>
                        <h2>Пополнение счета </h2>
                    </div>
                    <p><span className="abel">+500</span>₽</p>
                </div>
            </div>
        </div>
    )
}


export default ChoiceOfReplenishmentMethodHistoryClient;