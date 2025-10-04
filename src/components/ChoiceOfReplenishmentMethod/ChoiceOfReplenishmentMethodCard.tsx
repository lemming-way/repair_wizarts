import { useEffect } from "react";
import { useLanguage } from '../../state/language';

function ChoiceOfReplenishmentMethodCard() {

    const text = useLanguage();

    useEffect(() => {
        const mini_card = document.querySelectorAll('.mini-card')
        console.log(mini_card)
        mini_card.forEach((e) => {
            e.addEventListener('click', () => {
                mini_card.forEach((i) => {
                    i.classList.remove('border')
                })
                e.classList.add('border')
            })
        })
    }, [])






    return (
        <>
            <h2>{text('Choose a top-up method:')} </h2>
            <div className="mini-cards">
                <div className="mini-card df border" style={{justifyContent:"center", gap:0}} id="card">
                    <img src="/img/img-box.png" alt="" />
                    <h2>{text('Bank card')} </h2>
                </div>

                <div className="mini-card df" style={{justifyContent:"center", gap:0}}  id="card-2">
                    <img src="/img/img-card.png" alt="" />
                    <h2>{text('Sberbank Online')}</h2>
                </div>

                <div className="mini-card df" style={{justifyContent:"center", gap:0}}  id="card-3">
                    <img src="/img/img-qivi.png" alt="wallet" />
                    <h2>{text('Qiwi wallet')} </h2>
                </div>
            </div>
        </>
    )
}


export default ChoiceOfReplenishmentMethodCard;
