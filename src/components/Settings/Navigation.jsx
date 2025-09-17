import { Link } from "react-router-dom"


export default function Navigation() {
    return (
        <>
            <div className="mini-wrap mini-wrap_links df">
                <Link className={`just ${window.location.pathname == "/master/settings" ? "active2" : null}`} to="/master/settings"><h3 >Общие</h3></Link>
                <Link className={`just ${window.location.pathname == "/master/settings/profile" ? "active2" : null}`} to="/master/settings/profile"><h3>Профиль</h3></Link>
                <Link className={`just ${window.location.pathname == "/master/settings/services" ? "active2" : null}`} to='/master/settings/services'><h3 >Загрузка прайса</h3></Link>
                <Link className={`just ${window.location.pathname == "/master/settings/finance" ? "active2" : null}`} to='/master/settings/finance'><h3>Финансы</h3></Link>
                <Link className={`just ${window.location.pathname == "/master/settings/balance" ? "active2" : null}`} to='/master/settings/balance'><h3>Баланс</h3></Link>
            </div>
        </>
    )
}