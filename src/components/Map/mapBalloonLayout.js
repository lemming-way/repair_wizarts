import SERVER_PATH from '../../constants/SERVER_PATH'
import styles from './Map.module.css'

const getMapBalloonTemplate = (id) => `
    <div class=${styles.balloon}>
        <button class=${styles.balloonClose} id="close${id}">×</button>
        <div class=${styles.balloonHeader}>
            <div class=${styles.balloonHeaderPicture}>
                <img src="${SERVER_PATH}/{{properties.avatar}}" class=${styles.balloonHeaderPictureImg} />
            </div>
            <div class=${styles.balloonHeaderInfo}>
                <h3 class=${styles.balloonHeaderName}>
                    {{properties.name}} {{properties.lastname}}
                </h3>
                <p class=${styles.balloonHeaderType}>{{properties.business}}</p>
                <div class=${styles.balloonHeaderRate}>
                    {{properties.element|raw}}
                </div>
            </div>
        </div>
        <div class=${styles.balloonBody}>
            <p class=${styles.balloonBodyAddress}>{{properties.address}}</p>
            <div class=${styles.balloonBodyBottom}>
                <div class=${styles.balloonBodyInfo}>
                    <div class=${styles.ballonBodyInfoTitle}>
                        На сайте:
                    </div>
                    <div class=${styles.ballonBodyInfoContent}>
                        с 2023 года
                    </div>
                    <div class=${styles.ballonBodyInfoTitle}>
                        Оценка:
                    </div>
                    <div class=${styles.ballonBodyInfoContent}>
                        {{properties.rating}}/5
                    </div>
                    <div class=${styles.ballonBodyInfoTitle}>
                        Доступен:
                    </div>
                    <div class=${styles.ballonBodyInfoContent}>
                        С {{properties.availableFrom}} до {{properties.availableTo}}
                    </div>
                    <div class=${styles.ballonBodyInfoTitle}>
                        Имя организации:
                    </div>
                    <div class=${styles.ballonBodyInfoContent}>
                        {{properties.organizationName}}
                    </div>
                    <button
                        id="mapBalloonButton"
                        class=${styles.balloonBodyButton}
                    >
                        Показать фото
                    </button>
                </div>
            </div>
        </div>
    <div>
`

const getMapBalloonOverrides = (id) => ({
    build() {
        this.constructor.superclass.build.call(this)

        this.closeElement = document.getElementById(`close${id}`)
        this.updatePosition()

        this.onCloseClick = this.onCloseClick.bind(this)
        this.closeElement.addEventListener('click', this.onCloseClick)
    },
    clear() {
        this.constructor.superclass.clear.call(this)
        this.closeElement.removeEventListener('click', this.onCloseClick)
    },
    onCloseClick(e) {
        e.preventDefault()
        this.events.fire('userclose')
    },
    updatePosition() {
        const el = this._element.children[0]
        el.style.left = -(el.offsetWidth / 2) + "px"
    }
})

export { getMapBalloonTemplate, getMapBalloonOverrides }
