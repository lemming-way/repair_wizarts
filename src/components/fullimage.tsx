import { useState, useCallback, useEffect } from 'react'
import styles from '../scss/image.module.css'

const Image = ({ zoom, border, ...rest }) => {
    const escFunction = useCallback((event) => {
        if (event.key === 'Escape') {
            setClick(false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false)

        return () => {
            document.removeEventListener('keydown', escFunction, false)
        }
    }, [])

    const [click, setClick] = useState(false)
    const [hovered, setHovered] = useState(false)

    const setFlag = () => {
        setClick(true)
    }

    const unsetFlag = () => {
        setClick(false)
    }

    const onEnter = () => {
        setHovered(true)
    }
    const onExit = () => {
        setHovered(false)
    }

    if (!zoom) return <img {...rest} />
    else
        return (
            <>
                {click ? (
                    <div className={`${styles.lightbox} ${styles.show} relative`}>
                        <img {...rest} className={`${styles.show_image}`}></img>
                        <img
                            onClick={unsetFlag}
                            className={`absolute right-4 -top-8 h-8 w-8`}
                            src="img-iPhone.png"
                        />
                    </div>
                ) : (
                    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onExit}>
                        <img
                            {...rest}
                            className={`relative ${border && 'p-0.5 rounded bg-gray-700 dark:bg-gray-800'}`}
                        ></img>
                        {hovered && (
                            <img
                                onClick={setFlag}
                                className={`absolute -bottom-6 left-2 h-8 w-8 p-0.5 rounded bg-gray-700 dark:bg-gray-800`}
                                src="img-iPhone.png"
                            />
                        )}
                    </div>
                )}
            </>
        )
}

export default Image
