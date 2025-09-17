import React, {
    useState,
    useCallback,
    useEffect
} from 'react'
import {
    updateUserService,
    createUserCustomService
} from '../../../services/user.service'
import {
    getServiceCategories,
    getServiceTypesByCategoryId,
    getServiceDevicesByTypeId,
    getServiceRepairsByDeviceId
} from '../../../services/service.service'
import styles from './Services.module.css'

const defaultFormState = {
    category: 0,
    type: 0,
    device_id: 0,
    repair: 0,
    name: "",
    description: "",
    price: "",
    time: "",
}

const defaultServicesState = {
    categories: [],
    types: [],
    devices: [],
    repairs: []
}

const ServicesForm = (props) => {
    const {
        isCustom,
        onSubmit: onSubmitProps
    } = props

    const [services, setServices] = useState(defaultServicesState)
    const [form, setForm] = useState(defaultFormState)

    const getInputProps = useCallback((name) => ({
        value: form[name],
        onChange: (e) => setForm((prev) => ({
            ...prev,
            [name]: e.target.value
        })),
        className: styles.input
    }), [form])

    const onSubmit = (e) => {
        e.preventDefault()
        
        if (isCustom) {
            return createUserCustomService(form)
                .then((service) => onSubmitProps?.(e, service))
        }

        return updateUserService(form, form.repair)
            .then((service) => onSubmitProps?.(e, service))
    }
    
    useEffect(() => {
        getServiceCategories().then((categories) =>
            setServices((prev) => ({ ...prev, categories })))
    }, [])

    useEffect(() => {
        getServiceTypesByCategoryId(form.category).then((types) => {
            setServices((prev) => ({
                ...prev,
                types,
                devices: [],
                repairs: [],
            }))
            setForm((prev) => ({
                ...prev,
                type: 0,
                device_id: 0,
                repair: 0,
            }))
        })
    }, [form.category])
    
    useEffect(() => {
        if (form.type === 0) return

        getServiceDevicesByTypeId(form.type).then((devices) => {
            setServices((prev) => ({
                ...prev,
                devices,
                repairs: []
            }))
            setForm((prev) => ({
                ...prev,
                device_id: 0,
                repair: 0
            }))
        })
    }, [form.type])
    
    useEffect(() => {
        if (form.device_id === 0) return

        getServiceRepairsByDeviceId(form.device_id).then((repairs) => {
            setServices((prev) => ({
                ...prev,
                repairs: repairs.filter((v) => !v.is_custom),
            }))
            setForm((prev) => ({
                ...prev,
                repair: 0
            }))
        })
    }, [form.device_id])

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <select {...getInputProps('category')}>
                <option value="0" disabled>Категория</option>
                {services.categories.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                ))}
            </select>
            <select disabled={form.category === 0} {...getInputProps('type')}>
                <option value="0" disabled>Бренд</option>
                {services.types.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                ))}
            </select>
            <select disabled={form.type === 0} {...getInputProps('device_id')}>
                <option value="0" disabled>Модель</option>
                {services.devices.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                ))}
            </select>
            {isCustom ? (
                <React.Fragment>
                    <input
                        {...getInputProps('name')}
                        placeholder='Заголовок'
                    />
                    <input
                        {...getInputProps('description')}
                        placeholder='Описание'
                    />
                </React.Fragment>
            ) : (
                <select disabled={form.device_id === 0} {...getInputProps('repair')}>
                    <option value="0" disabled>Услуга</option>
                    {services.repairs.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
            )}
            <input
                {...getInputProps('price')}
                placeholder='Цена'
            />
            <input
                {...getInputProps('time')}
                placeholder='Время'
            />
            <button className={styles.button}>Сохранить</button>
        </form>
    )
}

export default ServicesForm
