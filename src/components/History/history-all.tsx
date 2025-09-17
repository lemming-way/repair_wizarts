import React, { useEffect } from "react";
import Sidebar from "../sidebar";
import '../../scss/history.css'
import {Link} from "react-router-dom";
import HistoryNav from './History-nav'

function App() {
    useEffect(() => {
        document.title = 'История операций';
    }, []);
    return (
        <div className='main nal df'>
            <Sidebar/>
            <div className="block-info-3">
                <div className="history__title">
                    <h1>История операций </h1>
                </div>

                <HistoryNav/>

                <div className="table__scroll">
                    <table className="table__history">
                        <tr className="table__title__wrap">
                            <th className="table__date table__title">Дата↓</th>
                            <th className="table__clock table__title">Время</th>
                            <th className="table__qiwi table__title">Операция</th>
                            <th className="table__bank table__title">Способ оплаты </th>
                            <th className="table__money table__title">Рубли </th>
                            <th className="table__status table__title">Статус </th>
                        </tr>
                        <tr>
                            <td className="table__date table__def__info">22.02.2022</td>
                            <td className="table__clock table__def__info">10:43</td>
                            <td className="table__qiwi table__def__info">Пополнение qiwi кошелька </td>
                            <td className="table__bank table__def__info">Банковский Перевод</td>
                            <td className="table__money table__def__info">1500₽</td>
                            <td className="table__status table__def__info">В обработке</td>
                        </tr>
                        <tr>
                            <td className="table__date table__def__info">22.02.2022</td>
                            <td className="table__clock table__def__info">10:43</td>
                            <td className="table__qiwi table__def__info">Пополнение qiwi кошелька </td>
                            <td className="table__bank table__def__info">Банковский Перевод</td>
                            <td className="table__money table__def__info">1500₽</td>
                            <td className="table__status table__def__info">Завершено</td>
                        </tr>
                        
                    </table>
                </div>
            </div>
        </div>
    )
}


export default App;
