
import style from "./OnlineDotted.module.css"

export default function OnlineDotted({isVisible, className = ''}) {
    return (
        <>
            { isVisible && 
                <div className={`${style.Dotted} ${className}`}></div>
            }
        </>
    )
}
