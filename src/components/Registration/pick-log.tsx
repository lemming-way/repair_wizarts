import { useEffect } from "react";
import { Link } from "react-router-dom";
import '../../scss/pick-log.css'
import '../../scss/media.css'

function App() {
    useEffect(() => {
        document.title = 'Выбор регистрации';
    }, []);

    return (
        <div className="div">
            <section className="pick">
                <h1>Выбор регистрации</h1>
                <div className="pick">
                    <div className="reg">
                        <Link to="/register/client">
                            <img src="/img/Union.svg" alt="" />
                            <p>Регистрация пользователя </p>
                            <p className="cli">
                                Тип регистрации для пользователей
                                (только клиентам)
                            </p>
                        </Link>
                    </div>
                    <div className="reg">
                        <Link to="/register/master">
                            <img src="/img/Union.png" alt="" />
                            <p>Регистрация сервисов и мастеров</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default App;
