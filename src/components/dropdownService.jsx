import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate, Link} from 'react-router-dom';
import {Dropdown} from 'rsuite';
import {selectServices} from '../slices/services.slice'

function DropdownService({children}) {
    const services = useSelector(selectServices)
    const navigate = useNavigate()

    const dropdownItems = useMemo(() => services.categories.map(category => ({
        id: category.id,
        label: category.name,
        items: services.service_types.filter(serviceType => serviceType.category_id === category.id).map(serviceType => ({
            id: serviceType.id,
            label: serviceType.name,
            href: `/devices/${serviceType.id}`,
            items: services.devices.filter(device => device.service_id === serviceType.id).map((device) => ({
                id: device.id,
                label: device.name,
                href: `/services/${device.id}`,
            }))
        })),
    })), [services])

    const renderDropdownItem = (item) => {
        if (item.items) {
            return <Dropdown.Menu key={item.id} title={item.href ?       <Link className="dropdown-link" to={item.href}>
                <h4>{item.label}</h4>
            </Link> : item.label} position="right">
                {item.items.map(renderDropdownItem)}
            </Dropdown.Menu>
        }

        return <Dropdown.Item
            key={item.id}
            onSelect={() => {
                navigate(item.href)
            }}
        >
            {item.label}
        </Dropdown.Item>
    }

    return <Dropdown
        renderToggle={(props, ref) => <div {...props} ref={ref}>{children}</div>}
        trigger="hover"
    >
        {dropdownItems.map(renderDropdownItem)}
    </Dropdown>
}


export default DropdownService;