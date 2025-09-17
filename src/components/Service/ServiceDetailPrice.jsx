import { useContext } from "react"
import cn from "classnames"
import ServiceDetailContext from "./ServiceDetailContext"

const ServiceDetailPrice = (props) => {
    const {
        id,
        price,
        name,
        description
    } = props

    const { selected } = useContext(ServiceDetailContext)
    const isSelected = selected.includes(id)

    const priceClassName = cn("detail__price__card", {
        "red": !isSelected
    })

    return (
        <div className={priceClassName}>
            <div className="price">
                <h1>{price}</h1>
                <img src="/img/rubl.png" alt="" />
            </div>
            <p>{name}: {description}</p>
        </div>
    )
}

export default ServiceDetailPrice
