import ServicesListItem from './ServicesListItem'
import styles from './Services.module.css'

const ServicesList = (props) => {
    const {
        repairs,
        onDelete,
    } = props

    return (
        <ul className={styles.list}>
            {repairs.map((rep) => (
                <ServicesListItem
                    {...rep}
                    key={rep.repair_id}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    )
}

export default ServicesList
