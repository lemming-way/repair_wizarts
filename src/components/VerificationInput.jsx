import { useState, useEffect } from 'react'
import { Popup } from 'reactjs-popup'
import {
    sendEmailCode,
    sendEmailVerificationCode,
    sendPhoneCode,
    sendPhoneVerificationCode
} from '../services/verification.service'
import mailIcon from '../img/mail.png'
import phoneIcon from '../img/mobile-phone.png'
import '../scss/verification-input.css'

const VerificationInput = (props) => {
    const {
        isConfirmed,
        isEmail,
        value,
        onChange,
        mask_value,
        onChangeMask
    } = props

    const sendCode = isEmail ? sendEmailCode : sendPhoneCode
    const sendVerificationCode = isEmail
        ? sendEmailVerificationCode
        : sendPhoneVerificationCode

    const [isModalOpen, setModalOpen] = useState(false)
    const [code, setCode] = useState("")

    useEffect(() => { if (isModalOpen) sendCode() }, [isModalOpen])

    const onSubmit = (e) => {
        e.preventDefault()
        sendVerificationCode(code).then(() => {
            setModalOpen(false)
        })
    }

    return (
        <div className='mail-input'>
            <input
                className='mail-input__input'
                placeholder={isEmail ? 'Электронная почта' : 'Телефон'}
                // value={value}
                value={mask_value}
                // onChange={onChange}
                onChange={onChangeMask}
            />
            {!isConfirmed && (
                <>
                    <button
                        className='mail-input__confirm'
                        type="button"
                        onClick={() => setModalOpen(true)}
                    >
                        <img
                            className='mail-input-confirm__img'
                            src={isEmail ? mailIcon : phoneIcon}
                            alt=""
                        />
                    </button>
                    <Popup open={isModalOpen} onClose={() => setModalOpen(false)}>
                        <div className='mail-input__modal'>
                            <button className='mail-input-modal__close'></button>
                            <div className='mail-input-modal__content'>
                                <h3 className='mail-input-modal__title'>Подтверждение почты</h3>
                                <p className='mail-input-modal__description'>
                                    На вашу почту {"{email}"} пришло письмо с кодом подтверждения.
                                    Чтобы подтвердить аккаунт введите этот код в форму, находящуюся ниже.
                                </p>
                                <div className='mail-input-modal__form'>
                                    <input
                                        className='mail-input-modal__input'
                                        value={code}
                                        placeholder='Код подтверждения'
                                        onChange={(e) => e.target.value.length <= 6 && setCode(e.target.value)}
                                    />
                                    <button className='mail-input-modal__button' onClick={onSubmit}>Подтвердить</button>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </>
            )}
        </div>
    )
}

export default VerificationInput
