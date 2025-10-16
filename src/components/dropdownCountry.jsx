import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setLocation } from "../slices/ui.slice"
import { getCities } from "../services/location.service"

function DropdownCountry() {
    const dispatch = useDispatch()

    const [query, setQuery] = useState("")
    const [cities, setCities] = useState([])

    const filteredCities = cities.filter((v) =>
        v.name.toLowerCase().includes(query.trim().toLowerCase()))

    useEffect(() => {
        getCities().then(setCities)
    }, [])

    return (
        <div className="dropdown-content">
            <input
                type="text"
                placeholder="Выберите город"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
                {filteredCities.map((v) => (
                    <div className="recent" key={v.id}>
                        <h4
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => dispatch(setLocation({
                                latitude: v.latitude,
                                longitude: v.longitude
                            }))}
                        >
                            {v.name}
                        </h4>
                    </div>
                ))}
        </div>
    )
}

export default DropdownCountry;