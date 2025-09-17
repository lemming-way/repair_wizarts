import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import SERVER_PATH from "../../constants/SERVER_PATH"

const FrameMaster = (props) => {
    const {
        order,
        setSelected
    } = props

    const [master, setMaster] = useState({ })

    useEffect(() => {
        (async () => {
            const response = await fetch(SERVER_PATH + "/api/user/master/" + order.master_username)
            const master = await response.json()

            setMaster(master)
        })()
    }, [])

    return (
        <>
            <div className="bord" onClick={() => setSelected(order)}>
                <div className="mobile-alecsand_line"></div>
                <div className="nav_left-alecsandr df font_abel">
                    <div className="alecsandr_img">
                        <img src="../img/profil_img/1.png" alt="no photo" />
                    </div>

                    <div className="alecsandr_info align mobile-alecsandr_info">
                        <div className="alecsandr_text ">
                            <h2>{master.name} {master.lastname}</h2>
                            <h2>{master.business_model}</h2>
                            <h2>{order.message}</h2>
                        </div>

                        <div className="grade_text df align mobile-grade_text">
                            <h4>4,6</h4>
                            <div className="grade_img df align mobile-grade_img">
                                <img src="../img/profil_img/3.png" alt="no photo" />
                                <img src="../img/profil_img/3.png" alt="no photo" />
                                <img src="../img/profil_img/3.png" alt="no photo" />
                                <img src="../img/profil_img/3.png" alt="no photo" />
                                <img src="../img/profil_img/4.png" alt="no photo" />
                            </div>
                            <h3>11</h3>
                        </div>
                    </div>
                </div>
                <div className="alecsandr_line mobile-alecsand_line"></div>
            </div>
        </>
    )
}

export default FrameMaster
