import { useState, useEffect } from "react";

function ChoiceOfReplenishmentMethodCard() {


    useEffect(() => {
        let mini_card = document.querySelectorAll('.mini-card')
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






    const [classname, setClassName] = useState("")
    const Active = (e) => {
        setClassName(" border")
    }
    return (
        <>
            <h2>Выберите способ пополнения: </h2>
            <div className="mini-cards">
                <div onClick={Active} className="mini-card df border" style={{justifyContent:"center", gap:0}} id="card">
                    <img src="/img/img-box.png" alt="" />
                    <h2>Банковская карта </h2>
                </div>

                <div onClick={Active} className="mini-card df" style={{justifyContent:"center", gap:0}}  id="card-2">
                    <img src="/img/img-card.png" alt="" />
                    <h2>Сбербанк онлайн</h2>
                </div>

                <div onClick={Active} className="mini-card df" style={{justifyContent:"center", gap:0}}  id="card-3">
                    <img src="/img/img-qivi.png" alt="wallet" />
                    <h2>Qiwi кошелек </h2>
                </div>
            </div>
        </>
    )
}


export default ChoiceOfReplenishmentMethodCard;