import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import { useLanguage } from "../state/language";

import SERVER_PATH from "../../config/SERVER_PATH";
import { createDialog } from "../services/dialog.service";
import { sendOfferAccept } from "../services/notification.service";
import { acceptOffer } from "../services/offer.service"
import { useUser } from "../state/user";
import { useContractorByUsernameQuery } from "../hooks/useContractorByUsernameQuery";
import { useContractorServicesQuery } from "../hooks/useContractorServicesQuery";
import { messageKeys, offerKeys, requestKeys, normalizeOptionalOfferRequestId } from "../queries";

const Offer = (props) => {
    const text = useLanguage();
    const {
        id: offerId,
        request_id,
        contractor_username,
        price,
        message,
        time,
    } = props

    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useUser()

    const [error, setError] = useState("")
    const { data: contractorData } = useContractorByUsernameQuery(contractor_username)
    const { data: servicesData } = useContractorServicesQuery(contractor_username)

    const contractor = contractorData || {}
    const services = servicesData || {}

    const acceptOfferMutation = useMutation({  // todo: перенести всё в state, и без useMutation
        mutationFn: acceptOffer,
        onSuccess: async () => {
            const normalizedRequestId = normalizeOptionalOfferRequestId(request_id);

            const invalidations = [
                queryClient.invalidateQueries({ queryKey: requestKeys.client() }),
                queryClient.invalidateQueries({ queryKey: requestKeys.clientAll() }),
                queryClient.invalidateQueries({ queryKey: requestKeys.contractorOrders() }),
                queryClient.invalidateQueries({ queryKey: messageKeys.unread() }),
            ];

            if (normalizedRequestId) {
                invalidations.push(
                    queryClient.invalidateQueries({ queryKey: offerKeys.list(normalizedRequestId) })
                );
            }

            await Promise.all(invalidations)
        }
    })

    const createDialogMutation = useMutation({
        mutationFn: createDialog,
    })

    const onSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        setError("")

        try {
            if (!user.id) {
                setError("Пользователь не авторизован")
                return
            }
            const res = await acceptOfferMutation.mutateAsync(offerId)
            const payload = {
                sender1_id: user.id,
                sender2_id: res.contractor_id,
                request_id
            }

            const dialog = await createDialogMutation.mutateAsync(payload)
            sendOfferAccept(res.contractor_id, offerId)
            navigate("/client/chat/" + dialog.id)
        } catch (err) {
            if (err?.status === 402) {
                setError(text("Contractor has insufficient funds"))
                return
            }

            setError(text("This contractor is unavailable"))
        }
    }

    return (
        <div>
            <div className="big_frame mobile-big_frame">
                <div className="frame_2 mobile-frame_2">
                    <div className="nav_right-2 df mobile-nav_right-2">
                        <div className="nav_left-alecsandr_2 df font_abel align">
                            <div className="alecsandr_img-4-afdsda">
                                <img
                                    src={SERVER_PATH + contractor.avatar}
                                    width="96px"
                                    height="96px"
                                    style={{ borderRadius: "48px", objectFit: "cover" }}
                                    alt=""
                                />
                            </div>

                            <div className="alecsandr_info align">
                                <div className="alecsandr_text-2">
                                    <h2><i>{contractor.name} {contractor.lastname}</i></h2>
                                    <h2>{contractor.business_model}</h2>
                                </div>

                                <div className="grade_text df align mobile-grade_text">
                                    <Rating
                                        readonly
                                        size="32"
                                        allowFraction
                                        initialValue={contractor.rating}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="o df">
                            <div className="alecsandr_info-text">
                                <div className="info_cards df align">
                                    <div className="info_cards-text_1">
                                        <h2>{text("Address")}:</h2>
                                        <h2>{text("Rating")}:</h2>
                                    </div>

                                    <div className="info_cards-text_2">
                                        <h2>{contractor.address}</h2>
                                        <h2>{contractor.rating}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="frame_3">
                        <div className="offer-contractor__bar">
                            <div className="nav_bottom-text_active df align">
                                <div className="nav_bottom-text_img">
                                    <img src="/img/my_offer_img/Star 1.png" alt="no img" />
                                </div>
                                <h2><span>{contractor.rating}</span></h2>
                            </div>

                            <div className="nav_bottom-text">
                                <h2><span>{contractor.number_of_feedbacks}</span>{text("reviews received")}</h2>
                            </div>
                            
                            <div className="nav_bottom-text">
                                <h2><span>{contractor.number_of_submissions}</span>{text("number of orders")}</h2>
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
                                    <td><span>{text("Organization name")}:</span></td>
                                    <td>
                                        <p>{contractor.organization_name}</p>
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
                                    <td><span>{text("Your activity")}:</span></td>
                                    <td>
                                        <p>{contractor.specialty}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Main direction")}:</span></td>
                                    <td>
                                        <p>{contractor.main_business}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Main business")}:</span></td>
                                    <td>
                                        <p>{contractor.business_model}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>{text("Status:")}:</span></td>
                                    <td>
                                        <p>{contractor.status}</p>
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
                                <img src="img/my_offer_img/Vector (1).png" alt="" />
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
                            <img src="img/my_offer_img/Vector (1).png" alt="" />
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
                    <button
                        onClick={onSubmit}
                        className="btn"
                        disabled={acceptOfferMutation.isPending || createDialogMutation.isPending}
                    >
                        {acceptOfferMutation.isPending || createDialogMutation.isPending ? text("Processing...") : text("Choose a contractor")}
                    </button>
                    <Link to={"/client/feedback/" + contractor_username}>
                        <button className="btnn">{text("Reviews about the contractor")}</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Offer;
