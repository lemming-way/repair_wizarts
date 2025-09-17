import { useState } from 'react'
import { useClickAway } from '@uidotdev/usehooks'
import cn from 'classnames'
import styles from './SelectInput.module.css'

const SelectInput = (props) => {
    const {
        title,
        options,
        value,
        onSelect,
        disabled
    } = props

    const [active, setActive] = useState(false)
    const menuRef = useClickAway((e) => setActive(false))

    const onOpen = (e) => {
        e.stopPropagation()
        
        if (disabled) return

        setActive(prev => !prev)
    }

    return (
        <div className={styles.select}>
            <div
                className={cn(styles.selectTitle, disabled && styles.selectTitleDisabled)}
                onMouseDown={onOpen}
            >
                {title}
            </div>
            {!disabled && active && (
                <ul className={styles.selectList} ref={menuRef}>
                    {options?.map((v) => (
                        <li
                            className={cn(styles.selectItem, value?.includes(v.id) && styles.selectItemActive)}
                            onClick={onSelect}
                            data-value={v.id}
                            key={v.id}
                        >
                            <span className={styles.selectItemText}>{v.name}</span>
                        </li>
                    ))}
                    
                </ul>
            )}
        </div>
    )
}

export default SelectInput
