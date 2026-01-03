import { Link } from "react-router-dom"


export default function Navigation() {
    return (
        <>
            <div className="mini-wrap mini-wrap_links df">
                <Link className={`just ${window.location.pathname === "/contractor/settings" ? "active2" : null}`} to="/contractor/settings"><h3>Общие</h3></Link>
                <Link className={`just ${window.location.pathname === "/contractor/settings/profile" ? "active2" : null}`} to="/contractor/settings/profile"><h3>Профиль</h3></Link>
                <Link className={`just ${window.location.pathname === "/contractor/settings/prices" ? "active2" : null}`} to='/contractor/settings/prices'><h3>Расценки</h3></Link>
                <Link className={`just ${window.location.pathname === "/contractor/settings/finance" ? "active2" : null}`} to='/contractor/settings/finance'><h3>Финансы</h3></Link>
                <Link className={`just ${window.location.pathname === "/contractor/settings/balance" ? "active2" : null}`} to='/contractor/settings/balance'><h3>Баланс</h3></Link>
            </div>
        </>
    )
}
