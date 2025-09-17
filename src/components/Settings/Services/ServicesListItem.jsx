import {
    useState,
    useCallback
} from 'react'
import {
    updateMasterRepair,
    updateMasterCustomRepair,
    removeMasterRepair
} from '../../../services/service.service'
import editIcon from '../../../img/pencil.png'
import removeIcon from '../../../img/trash-bin.png'
import styles from './Services.module.css'

const ServicesListItem = (props) => {
    const {
        repair_id,
        device,
        repair_name,
        repair_description,
        price,
        time,
        is_custom,
        onDelete: onDeleteProps
    } = props

    const [form, setForm] = useState({
        device,
        name: repair_name,
        description: repair_description,
        price,
        time
    })

    const getInputProps = useCallback((name) => ({
        value: form[name],
        onChange: (e) => setForm((prev) => ({
            ...prev,
            [name]: e.target.value
        })),
        className: styles.listItemInput
    }), [form])

    const onSubmit = (e) => {
        e.preventDefault()

        if (is_custom) {
            return updateMasterCustomRepair(repair_id, {
                name: form.name,
                description: form.description,
                price: form.price,
                time: form.time
            })
        }
        
        return updateMasterRepair(repair_id, {
            price: form.price,
            time: form.time
        })
    }

    const onDelete = (e) => {
        e.preventDefault()
        return removeMasterRepair(repair_id).then(() => {
            onDeleteProps?.(e, repair_id)
        })
    }

    return (
        <li className={styles.listItem}>
            <form className={styles.listItemForm} onSubmit={onSubmit}>
                <input
                    disabled
                    {...getInputProps('device')}
                    placeholder='Устройство'
                />
                <input
                    disabled={!is_custom}
                    {...getInputProps('name')}
                    placeholder='Заголовок'
                />
                <input
                    disabled={!is_custom}
                    {...getInputProps('description')}
                    placeholder='Описание'
                />
                <input
                    {...getInputProps('price')}
                    placeholder='Цена'
                />
                <input {...getInputProps('time')}
                    placeholder='Время'
                />
                <button type="submit" className={styles.listItemButton}>
                    <img src={editIcon} alt="update" />
                </button>
                <button
                    type="button"
                    className={styles.listItemButton}
                    onClick={onDelete}
                >
                    <img src={removeIcon} alt="delete" />
                </button>
            </form>
        </li>
    )
}

export default ServicesListItem
