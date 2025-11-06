import { useEffect, useState } from "react"

import { useLanguage } from '../state/language';
import { setGlobal } from '../state/global';
import { getCities } from "../services/location.service"

function DropdownCountry() {
    const text = useLanguage() 
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
                placeholder={text("Select a city")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
                {filteredCities.map((v) => (
                    <div className="recent" key={v.id}>
                        <h4
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => setGlobal('map:location', {
                                latitude: v.latitude,
                                longitude: v.longitude
                            })}
                        >
                            {v.name}
                        </h4>
                    </div>
                ))}
        </div>
    )
}

export default DropdownCountry;
