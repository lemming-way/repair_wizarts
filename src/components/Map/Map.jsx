import {
    useEffect,
    useId,
    useMemo
} from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { useSelector } from "react-redux"
import {
    Map as YandexMap,
    SearchControl,
    Placemark,
    withYMaps
} from "react-yandex-maps"
import { Rating } from "react-simple-star-rating"
import {
    getMapBalloonTemplate,
    getMapBalloonOverrides
} from './mapBalloonLayout'
import { selectUI } from "../../slices/ui.slice"
import { CLIENT_PATH } from "../../constants/SERVER_PATH"

const Map = (props) => {
    const {
        masters,
        selectedMaster,
        selectMaster
    } = props
    const {
        templateLayoutFactory
    } = props.ymaps

    useEffect(() => {
        const element = document.getElementById("mapBalloonButton")

        const onClick = (e) => window.location
            .replace(CLIENT_PATH + "contact?pics=1&id=" + selectedMaster.username)
        element?.addEventListener("click", onClick)

        return () => {
            element?.removeEventListener("click", onClick)
        }
    }, [selectedMaster])

    const ui = useSelector(selectUI)
    const balloonId = useId()

    const ratingElement = useMemo(() => renderToStaticMarkup(
        <Rating
            size={24}
            readonly
            initialValue={selectedMaster.rating * 20} // filled-stars width fix
        />
    ), [selectedMaster])

    const availableFrom = selectedMaster.availability_from?.split(":")[0] || 0
    const availableTo = selectedMaster.availability_to?.split(":")[0] || 0

    return (
        <YandexMap
            /*
             * FIXME:
             * it's refreshing when you are selecting master
             * because of the changes in the state
            */
            state={{
                center: [ui.location.latitude, ui.location.longitude],
                zoom: 10,
            }}
            options={{
                suppressMapOpenBlock: true
            }}
            height="500px"
            width="100%"
        >
            <SearchControl
                options={{ fitMaxWidth: true, maxWidth: '660px' }}
            />
            {masters?.map((v) => (
                <Placemark
                    key={v.id}
                    geometry={[v.latitude, v.longitude]}
                    modules={['geoObject.addon.balloon']}
                    properties={{
                        name: selectedMaster.name,
                        lastname: selectedMaster.lastname,
                        business: selectedMaster.business_model,
                        address: selectedMaster.address,
                        avatar: selectedMaster.avatar,
                        element: ratingElement,
                        rating: selectedMaster.rating,
                        organizationName: selectedMaster.organization_name,
                        availableFrom,
                        availableTo
                    }}
                    onClick={(e) => selectMaster(e, v.id)}
                    options={{
                        balloonLayout: templateLayoutFactory.createClass(
                            getMapBalloonTemplate(balloonId),
                            getMapBalloonOverrides(balloonId)
                        ),
                    }}
                />
            ))}
        </YandexMap>
    )
}

export default withYMaps(Map, true, ['templateLayoutFactory'])
