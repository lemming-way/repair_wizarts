import { useState, useRef } from "react"
import style from "./ModalConfirm.module.css"



export default function ModalConfirm({ setVisibleConfirm, setVisibleSuccess }) {

    const [otp, setOtp] = useState(Array(4).fill('')); // Создаем массив из 4 пустых строк
    const inputRef = useRef([]);

    const handleChange = (e, index) => {
        const { value } = e.target;

        // Ограничиваем ввод до одной цифры
        if (!/^[0-9]$/.test(value) && value !== '') {
            return; // Если не цифра, ничего не делаем
        }

        // Обновляем состояние
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Переход к следующему полю ввода
        if (value && index < otp.length - 1) {
            inputRef.current[index + 1].focus();
        }

        // Если поле ввода пустое, переходим к предыдущему полю
        if (!value && index > 0) {
            inputRef.current[index - 1].focus();
        }

        // ввод окончен
        if (value && index == otp.length - 1) {
            setVisibleConfirm(false)
            setVisibleSuccess(true)
        }

    };

    const handleKeyDown = (e, index) => {
        // Переход к предыдущему полю при нажатии Backspace
        if (e.key === 'Backspace' && index > 0 && !otp[index]) {
            inputRef.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`OTP код: ${otp.join('')}`); // Выводим введенный код
    };

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleConfirm(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Подтвердите новые реквизиты</h2>

                    <p className={style.text_block}>Введите последние 4 цифры звонящего номера. <br /><br />

Вам поступит бесплатный звонок, отвечать на него не нужно. Тариф в роуминге зависит от оператора.
</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '200px' }}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => (inputRef.current[index] = el)}
                            className={style.input}
                        />
                    ))}
                </div>
                </div>
            </div>
            
        </>
    )
}