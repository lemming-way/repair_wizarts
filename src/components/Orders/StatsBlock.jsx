
import style from "./Allorders.module.css"


export default function StatsBlock() {
    return (
        <>
            <div className={style.stats_block}>
                <div className={style.stats_row}>
                    <img src="/img/bar-graph.png" alt="" />
                    <p className={style.filter__heading2}>Статистика заказов за месяц </p>
                </div>
                <p className={style.stats__p_row}><span>Проектов</span><span>333</span></p>
                <p className={style.stats__p_row}><span>На сумму</span><span>123000</span></p>
                <p className={style.stats__p_row}><span>Заказов</span><span>212</span></p>
            </div>
        </>
    )
}