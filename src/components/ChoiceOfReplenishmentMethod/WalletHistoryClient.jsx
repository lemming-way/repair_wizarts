import {
    useState,
    useEffect
} from 'react';
import '../../scss/ChoiceOfReplenishmentMethod.css'
// import 'bootstrap/dist/css/bootstrap.min.css';

import { replenishBalance } from '../../services/balance.service';
import style from './style.module.css'
import styles from './WalletHistoryClient.module.css'
import NavigationWallet from '../Settings/NavigationWallet';
import { Link } from 'react-router-dom';

function WalletHistoryClient() {

    const [error, setError] = useState("")
    const [amount, setAmount] = useState("")
    const updateAmount = (e) => {
        const value = e.target.value
        if (isNaN(value)) {
            return
        }
        setAmount(value)
    }

    const onSubmit = (e) => {
        e.preventDefault()
        return replenishBalance(amount).then((res) => {
            window.location.replace(res.confirmation_url)
        }).catch((err) => setError(err.message))
    }

    useEffect(() => {
        document.title = 'Кошелек';
    }, []);





    const [inputPrice, setInputPrice] = useState("");

    return (
         
            <div className={styles.main_block_history}>
                        <h1>История пополнений</h1>
                        <NavigationWallet />

                        <div className={styles.table_wrap}>


                        <table className={styles.table}>
                            <tr className={styles.border}>
                                <th>Дата</th>
                                <th style={{width: "100px"}}>Время</th>
                                <th>Операции</th>
                                <th>Способ оплаты</th>
                                <th>Рубли</th>
                                <th>Статус</th>
                            </tr>
                            <tr>
                                <td>22.02.2022</td>
                                <td>10:43</td>
                                <td>Пополнение qiwi кошелька </td>
                                <td>Банковский Перевод</td>
                                <td>1500₽</td>
                                <td>В обработке</td>
                            </tr>
                            <tr>
                                <td>22.02.2022</td>
                                <td>10:43</td>
                                <td>Пополнение qiwi кошелька </td>
                                <td>Банковский Перевод</td>
                                <td>1500₽</td>
                                <td>В обработке</td>
                            </tr>
                        </table>
                        </div>

                        <div className={style.buttons} >
                            {/* <button className={style.button}>Далее </button> */}
                            <Link className={style.button} to="/client/settings/wallet">Назад</Link>
                        </div>
        </div>
    )
}

export default WalletHistoryClient;