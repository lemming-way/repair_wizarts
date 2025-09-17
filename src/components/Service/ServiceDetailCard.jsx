import { useContext } from "react"
import cn from "classnames"
import ServiceDetailContext from "./ServiceDetailContext"

const ServiceDetailCard = (props) => {
    const {
        id,
        name,
        description,
        price,
    } = props

    const { selected, setSelected } = useContext(ServiceDetailContext)
    const isSelected = selected.includes(id)

    const onSetActive = (e) => isSelected
        ? setSelected((prev) => prev.filter((v) => v !== id))
        : setSelected(prev => [...prev, id])

    const cardClassName = cn("first__s__card", {
        "active-card": isSelected
    })

    return (
        <div className={cardClassName}>
            <div className="main__info__content__card">
                <div className="main__card__first">
                    <h4>{name}</h4>
                    <p>{description}</p>
                </div>
                <div className="main__card__second">
                    <p><span>{price}₽</span></p>
                    <button className="pickfaf" onClick={onSetActive}>
                        {isSelected ? "Удалить" : "Выбрать"}
                    </button>
                </div>
                <div className="main__card__third"></div>
            </div>
        </div>
    )
}

export default ServiceDetailCard
