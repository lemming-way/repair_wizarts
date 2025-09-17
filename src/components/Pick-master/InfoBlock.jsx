import style from "./InfoBlock.module.css"


export default function InfoBlock({ handlerClose }) {
    return (
        <>
            <div className={style.wrap}>
                <div className="info_master_big" style={{height: "unset"}}>
                    <div className="info_master__close" onClick={()=>handlerClose(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Вид категории</span>Электроника</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Категория</span>Ремотн телефонов, ремонт планшетов</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Бренды</span>iPhone, iPad, samsung</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Ваша деятельность</span>Занимаюсь ремонтом техники Apple </p>

                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Основное направление</span>Пайка, переклейка</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Основной бизнес</span>сервис</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">Об организации: </span></p>
                    <p className="info_master_big__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa explicabo saepe eius natus non vel repudiandae perferendis quo quam sed, vitae sequi recusandae! Pariatur alias ad labore nemo odio itaque.</p>
                </div>
            </div>
        </>
    )
}