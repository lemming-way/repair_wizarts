
import style from "./OnlineDotted.module.css"

export default function OnlineDotted({isVisible}) {
    return (
        <>
            { isVisible && 
                <div className={style.Dotted}></div>
            }
        </>
    )
}