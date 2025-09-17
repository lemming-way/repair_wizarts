import {useEffect, useState} from 'react';
import './titleService.css'
import {Link} from 'react-router-dom'

function TitleService() {
    const [title, setTitle] = useState("")

    useEffect(() => {
        document.title = 'Зоголовок услуги';
    }, []);
    return (
        <>
            <section className="page-7" style={{paddingBottom: "50px"}}>
                <div className="container_other mobile-container_other fix_width_title">
                    <div className="other_services">
                        <div className="other_services-text">
                            <h2>Разместите устройство которого нет в списке </h2>
                        </div>

                        <div className="other-text">
                            <p>
                                Разместите свое устройство на бирже. Ваше устройство станет видимым для тысяч мастеров,
                                и
                                некоторые из них сделают вам предложения. Изучите их рейтинг, портфолио и выберите
                                лучших из
                                них. Подтвердите заказ, когда будете удовлетворены результатом на 100%. Только после
                                этого
                                можете проводить оплату в пользу мастера
                            </p>
                        </div>
                    </div>
                    <div className="services">
                        <div className="services_text">
                            <h2>Ведите название зоголовок услуги</h2>
                        </div>
                        <div className="services_img df align mobile-services_img">
                            <img style={{paddingRight: "7px"}} src="/img/other-service_img/fill.svg" alt="no photo"/>
                            <div className="servis_tex">
                                <input type="text" value={title} placeholder='iPhone 13' onChange={(e) => setTitle(e.target.value)} />
                            </div>
                        </div>
                        <p>0 из 55 символов</p>
                    </div>
                    <div className="services_but">
                        <Link to={"/client/requests/create/data?title=" + title}>
                            Продолжить
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TitleService;