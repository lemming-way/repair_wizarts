import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectServices } from "../slices/services.slice";
import SERVER_PATH from "../constants/SERVER_PATH";
import style from "./remont.module.css" 

import '../scss/remont.css'

function Remont() {
    const { id } = useParams()
    const services = useSelector(selectServices)
    const serviceName = services.service_types.find((v) => v.id === +id)?.name

    useEffect(() => {
        document.title = 'Ремонт iPhone';
    }, []);
    return (
        <section className={`container remont remont-container ${style.devices_block}`}>
            <h1>{serviceName}</h1>
            <p>Выберите модель iPhone, чтобы узнать стоимость ремонта.</p>
            <Link to={"/client/requests/create/title"} 
                className="header__button"
                style={{padding: "15px 40px"}}
                >Заказать на бирже</Link>
                
            <div className="remont__card__list">
                    {services.devices.map((dev) => dev.service_id === Number(id) && (
                        <div className="remont__card" key={dev.id}>
                            <Link to={`/services/${dev.id}`} style={{textDecoration: 'none'}}>
                                <div className="remont__card__image">
                                    <img
                                        src={SERVER_PATH + dev.picture}
                                        alt=""
                                        style={{
                                            width: "130px",
                                            height: "170px",
                                            objectFit: "contain"
                                        }}
                                    />
                                </div>
                                <p>{dev.name}</p>
                            </Link>
                        </div>
                    ))}
            </div>
        </section>
    )
}


export default Remont;