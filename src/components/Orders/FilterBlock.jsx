import style from "./Allorders.module.css"

export default function FilterBlock() {
    return (
        <>
                    <div className={style.filter_block}>
                        <p className={style.filter__heading}>Рубрики</p>
                        <details className={style.margin_btm}>
                            <summary className={style.filter__summary}>Электроника</summary>
                            <div className={style.filter__details_data}>
                                <details>
                                    <summary>Ремонт телефонов (290)</summary>
                                    <div className={style.filter__details_data}>
                                        <details>
                                            <summary>Apple (30)</summary>
                                            <div className={style.filter__details_data}>
                                                <p>iPhone 15</p>
                                                <p>iPhone 15 pro</p>
                                                <p>iPhone 15 pro max</p>
                                                <p>iPhone 16</p>
                                                <p>iPhone 16 pro</p>
                                                <p>iPhone 13</p>
                                            </div>
                                        </details>
                                        <details>
                                            <summary>Samsung (30)</summary>
                                            <div className={style.filter__details_data}>
                                                <p>iPhone 15</p>
                                                <p>iPhone 15 pro</p>
                                                <p>iPhone 15 pro max</p>
                                                <p>iPhone 16</p>
                                                <p>iPhone 16 pro</p>
                                                <p>iPhone 13</p>
                                            </div>
                                        </details>
                                        <details>
                                            <summary>Lenovo (15)</summary>
                                            <div className={style.filter__details_data}>
                                                <p>iPhone 15</p>
                                                <p>iPhone 15 pro</p>
                                                <p>iPhone 15 pro max</p>
                                                <p>iPhone 16</p>
                                                <p>iPhone 16 pro</p>
                                                <p>iPhone 13</p>
                                            </div>
                                        </details>
                                        <details>
                                            <summary>Xiaomi (31)</summary>
                                            <div className={style.filter__details_data}>
                                                <p>iPhone 15</p>
                                                <p>iPhone 15 pro</p>
                                                <p>iPhone 15 pro max</p>
                                                <p>iPhone 16</p>
                                                <p>iPhone 16 pro</p>
                                                <p>iPhone 13</p>
                                            </div>
                                        </details>
                                    </div>
                                </details>
                                <p>Ремонт планшетов (50)</p>
                                <p>Ремонт ноутбуков (72)</p>
                                <p>Ремонт компьюьтеров (108)</p>
                                <p>Ремонт часов (16)</p>
                                <p>Акссесуары (8)</p>
                            </div>
                        </details>

                        <p className={style.filter__heading}>Колличество предложений </p>
                        <div className={style.margin_btm}>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_1" />
                                <label htmlFor="check_1">До 5 (34)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_2" />
                                <label htmlFor="check_2">От 5 До 10 (34)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_3" />
                                <label htmlFor="check_3">От 10 До 15 (34)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_4" />
                                <label htmlFor="check_4">От 15 До 20 (34)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_5" />
                                <label htmlFor="check_5">От 20 (34)</label>
                            </div>
                        </div>

                        <p className={style.filter__heading}>Бюджет</p>
                        <div className={style.margin_btm}>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_price_1" />
                                <label htmlFor="check_price_1">До 1000 (21)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_price_2" />
                                <label htmlFor="check_price_2">От 1000 До 3000 (11)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_price_3" />
                                <label htmlFor="check_price_3">От 3000 До 10000 (40)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_price_4" />
                                <label htmlFor="check_price_4">От 10000 До 30000 (13)</label>
                            </div>
                            <div className={style.filter__row}>
                                <input type="checkbox" id="check_price_5" />
                                <label htmlFor="check_price_5">От 30000 (10)</label>
                            </div>
                        </div>
                        <div className={style.inputs_row}>
                            <input className={style.input_price} type="text" placeholder="От руб" />
                            <input className={style.input_price} type="text" placeholder="До руб" />
                        </div>
                    </div>
        </>
    )
}