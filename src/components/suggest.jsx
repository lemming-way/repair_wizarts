import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import { useLanguage } from "../state/language";

import SERVER_PATH from "../constants/SERVER_PATH";
import { createDialog } from "../services/dialog.service";
import { sendOfferAccept } from "../services/notification.service";
import { acceptOffer } from "../services/offer.service"
import { getMasterServices } from "../services/service.service"
import { getMasterByUsername } from "../services/user.service";
import { selectUser } from "../slices/user.slice";

const Suggest = (props) => {
    const text = useLanguage();
    const {
        id: offerId,
        request_id,
        master_username,
        price,
        message,
        time,
    } = props

    const navigate = useNavigate()
    const user = useSelector(selectUser)

    const [error, setError] = useState("")
    const [master, setMaster] = useState({ })
    const [services, setServices] = useState({ })

    useEffect(() => {
        getMasterByUsername(master_username).then(setMaster)
        getMasterServices(master_username).then(setServices)
    }, [master_username])

    const onSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()

        acceptOffer(offerId).then((res) => {
            const payload = {
                sender1_id: user?.id,
                sender2_id: res.master_id,
                request_id
            }
            createDialog(payload).then((dialog) => {
                sendOfferAccept(res.master_id, offerId)
                navigate("/client/chat/" + dialog.id)
            })
        }).catch((err) => {
            if (err.status === 402) {
                return setError(text("Master has insufficient funds"))
            }

            setError(text("This master is unavailable"))
        })
    }

    return (
        <div>
            <div className="big_frame mobile-big_frame">
                <div className="frame_2 mobile-frame_2">
                    <div className="nav_right-2 df mobile-nav_right-2">
                        <div className="nav_left-alecsandr_2 df font_abel align">
                            <div className="alecsandr_img-4-afdsda">
                                <img
                                    src={SERVER_PATH + master.avatar}
                                    width="96px"
                                    height="96px"
                                    style={{ borderRadius: "48px", objectFit: "cover" }}
                                    alt=""
                                />
                            </div>

                            <div className="alecsandr_info align">
                                <div className="alecsandr_text-2">
                                    <h2><i>{master.name} {master.lastname}</i></h2>
                                    <h2>{master.business_model}</h2>
                                </div>

                                <div className="grade_text df align mobile-grade_text">
                                    <Rating
                                        readonly
                                        size="32"
                                        allowFraction
                                        initialValue={master.rating}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="o df">
                            <div className="alecsandr_info-text">
                                <div className="info_cards df align">
                                    <div className="info_cards-text_1">
                                        <h2>{text("Address:")}:</h2>
                                        <h2>{text("Rating:")}:</h2>
                                    </div>

                                    <div className="info_cards-text_2">
                                        <h2>{master.address}</h2>
                                        <h2>{master.rating}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="frame_3">
                        <div className="offer-master__bar">
                            <div className="nav_bottom-text_active df align">
                                <div className="nav_bottom-text_img">
                                    <img src="/img/my_suggestion_img/Star 1.png" alt="no img" />
                                </div>
                                <h2><span>{master.rating}</span></h2>
                            </div>

                            <div className="nav_bottom-text">
                                <h2><span>{master.number_of_feedbacks}</span>{text("reviews received")}</h2>
                            </div>
                            
                            <div className="nav_bottom-text">
                                <h2><span>{master.number_of_submissions}</span>{text("number of orders")}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="f df align">
                <div className="frame_5">
                    <div className="pro_repair font_abel mobile-pro_repair mobile-pro_repair2">
                        <table>
                            <tbody>
                                <tr>
                                    <td><span>{text("Organization name:")}:</span></td>
                                    <td>
                                        <p>{master.organization_name}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("List of manufacturers:")}:</span></td>
                                    <td>
                                        <p>{services.service_types?.slice(0, 3).map((v) => v.name).join(', ')}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Device selection:")}:</span></td>
                                    <td>
                                        <p>{services.devices?.slice(0, 3).map((v) => v.name).join(', ')}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Type of repair:")} </span>
                                    </td>
                                    <td>
                                        <p>{services.repair_types?.slice(0, 3).map((v) => v.name).join(', ')}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Your activity:")}:</span></td>
                                    <td>
                                        <p>{master.specialty}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Main direction:")}:</span></td>
                                    <td>
                                        <p>{master.main_business}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Main business:")}:</span></td>
                                    <td>
                                        <p>{master.business_model}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Status:")}:</span></td>
                                    <td>
                                        <p>{master.status}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="frame_6 font_abel">
                    <div className="customer_message mobile-customer_message">
                        <div className="customer_message_text-2">
                            <span name="" id="" className="textareas" style={{ display: "block" }}>{message}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="service mobile-service">
                <div className="servis df align mobile-servis">
                    <div className="service_text mobile-service_text">
                        <h2>{text("What is included in the offer")}</h2>
                    </div>
                    <div className="servic df mobile-servic">
                        <div className="service_text-2 mobile-service_text-2">
                            <h2>{text("Term")} <br />
                                {time}</h2>
                        </div>

                        <div className="service_text-2 mobile-service_text-2">
                            <h2>{text("Cost")}</h2>

                            <div className="t-2 df align mobile-t-2">
                                <h2>
                                    <span>
                                        {price}
                                    </span>
                                </h2>
                                <img src="img/my_suggestion_img/Vector (1).png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="servis_line"></div>
            <div className="servis-2 df align mobile-servis-2">
                <div className="service_text-3 mobile-service_text-3">
                    <h2>{text("Total:")}:</h2>
                </div>

                <div className="service_text-3 df align mobile-service_text-3">
                    <h4>{time}</h4>

                    <div className="t-1 df align mobile-t-1">
                        <h3>
                            <span>{price}</span>
                        </h3>

                        <div className="img mobile-img">
                            <img src="img/my_suggestion_img/Vector (1).png" alt="" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="custom">
                {error && (
                    <div className="auth-err">
                        {error}
                    </div>
                )}
                <div className="customer_message-but">
                    <button onClick={onSubmit} className="btn">{text("Choose a master")}</button>
                    <Link to={"/client/feedback/" + master_username}>
                        <button className="btnn">{text("Reviews about the master")}</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Suggest;
