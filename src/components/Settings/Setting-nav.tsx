import React, {useEffect, useState} from "react";
import {
    Link,
} from "react-router-dom";



function App() {


    let mini_card = document.querySelectorAll('.just')

    mini_card.forEach((e) => {
        e.addEventListener('click',() => {
            mini_card.forEach((i) =>{
                i.classList.remove('active2')
            })
            e.classList.add('active2')
        })
    })

    const [classname, setClassName] = useState("")
    const Active = (e) =>{
        setClassName("active2")
    }
    return (
        <div className="mini-wrap df">
            <Link to="/settings"><h3 onClick={Active} className="just active2">Общие</h3></Link>
            <Link to="/profile"><h3 onClick={Active} className="just">Профиль</h3></Link>
            <h3 onClick={Active} className="just">Услуги</h3>
            <h3 onClick={Active} className="just">Финансы</h3>
        </div>
    )
}


export default App;
