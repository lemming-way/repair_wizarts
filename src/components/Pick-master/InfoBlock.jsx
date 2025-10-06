import { useLanguage } from '../../state/language'
import style from "./InfoBlock.module.css"


export default function InfoBlock({ handlerClose }) {
    const text = useLanguage()
    return (
        <>
            <div className={style.wrap}>
                <div className="info_master_big" style={{height: "unset"}}>
                    <div className="info_master__close" onClick={()=>handlerClose(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('Type of category')}</span>Электроника</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('Category')}</span>Ремотн телефонов, ремонт планшетов</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('Brands')}</span>iPhone, iPad, samsung</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('Your activity')}</span>Занимаюсь ремонтом техники Apple </p>

                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('Main focus')}</span>Пайка, переклейка</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('Main business')}</span>сервис</p>
                    <p className="info_master_big__text-about"><span className="info_master_big__text-about-light">{text('About organization')}: </span></p>
                    <p className="info_master_big__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa explicabo saepe eius natus non vel repudiandae perferendis quo quam sed, vitae sequi recusandae! Pariatur alias ad labore nemo odio itaque.</p>
                </div>
            </div>
        </>
    )
}
