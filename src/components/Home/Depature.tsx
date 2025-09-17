import React, {useEffect} from "react";
import '../../scss/media.css'
import Aos from 'aos'
import 'aos/dist/aos.css'

function Depature() {

    useEffect(() => {
        Aos.init({
            duration : 1000
        });
        Aos.refresh();
    }, []);

    return (
        <section className="go">
            <div className="container">
                <div  className="go__card">
                    <img src="img/go__car.png" alt=""/>
                    <div className="go__card__content">
                        <h4>Выезд</h4>
                        <p>
                            Время - деньги. Заказав переклейку или ремонт iphone у нас
                            Вы можете сэкономить 3-4 часа времени. Мастер приедет
                            и произведет ремонт у вас дома или в офисе или заберет
                            у вас телефон, потом доставит отремонтированный.
                        </p>
                    </div>
                </div>
                <div className="go__card">
                    <img src="img/feaqwer.png" alt=""/>
                    <div className="go__card__content">
                        <h4>Качество</h4>
                        <p>
                            Наши мастера имеют 10+ лет опыта работы в области переклейки
                            и ремонта Iphone. Работая с нами, Вы можете быть совершенно уверены в том, что ваш
                            телефон в надежных и опытных руках.
                        </p>
                    </div>
                </div>
                <div className="go__card">
                    <img src="img/go__bir.png" alt=""/>
                    <div className="go__card__content">
                        <h4>Цены</h4>
                        <p>
                            Наши цены ниже среднерыночных, несмотря на то, что качество работы яна самом высшем
                            уровне. Несмотря на то, что мы используем только оригинальные зап. части. Мы любим
                            свою работу, работаем много и это позволяет предлагать лучшие
                            на рынке условия.
                        </p>
                    </div>
                </div>
                <div className="go__card">
                    <img src="img/go__timer.png" alt=""/>
                    <div className="go__card__content">
                        <h4>Сроки работы</h4>
                        <p>
                            Мы пунктуальны и ответственны. Называем срок работы с запасом
                            и выполняем работу почти всегда раньше обещанного срока,
                            а ровно в срок сдаем тогда, когда происходят непредвиденные обстоятельства.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default Depature;