import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../slices/user.slice';
import style from './AddOrderModal.module.css';
import { updateRequest } from '../../../services/request.service';
import { useParams } from 'react-router-dom';

export default function AddOrderModal({
  setVisibleAddOrder,
  setVisibleOkModal,
  currentOrder,
}) {
  const user = Object.values(useSelector(selectUser)?.data?.user || {})[0];
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async () => {
    console.log({ title, description, budget, deadline });
    const currentExtraOrders = Array.isArray(
      currentOrder.b_options.extra_orders,
    )
      ? currentOrder.b_options.extra_orders
      : [];
    const newExtraOrder = {
      id: Math.floor(Math.random() * currentOrder),
      title,
      description,
      client_price: budget,
      time: deadline,
    };
    await updateRequest(id, {
      extra_orders: [...currentExtraOrders, newExtraOrder],
    });
    setVisibleAddOrder(false);
    setVisibleOkModal(true);
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setVisibleAddOrder(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>Предложить заказ</h2>
        {(user?.u_details?.balance || 0) < 500 && (
          <p className={style.error}>
            Пожалуйста пополните баланс на 500 рублей
          </p>
        )}
        <div>
          <input
            className={style.input_heading}
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <p className={style.textarea_description}>2000 символов, мин 100</p>
          <textarea
            className={style.textarea}
            rows={8}
            placeholder="Напишите, что требуется выполнить"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className={style.row1}>
          <div>
            <p className={style.mini_heading}>Бюджет</p>
            <p className={style.balance}>
              Баланс {user?.u_details?.balance || 0} ₽
            </p>
            <div className={style.icon}>
              <input
                className={style.input_balance}
                type="text"
                placeholder="500 - 20000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img className={style.icon2} src="/img/icons/clock.png" alt="" />
            <p className={style.mini_heading}>Срок</p>
            <select
              className={style.select}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            >
              <option value="" disabled>
                Выберите
              </option>
              <option value="ready">Готов ждать</option>
              <option value="1">1 час</option>
              <option value="2">2 часа</option>
              <option value="3">3 часа</option>
              <option value="4">4 часа</option>
              <option value="6">6 часов</option>
              <option value="8">8 часов</option>
              <option value="24">24 часа</option>
              <option value="72">3 дня</option>
              <option value="168">7 дней</option>
            </select>
          </div>
        </div>

        <div className={style.block_photo}>
          <p className={style.heading_h3}>Добавить фотографии</p>
          <div className={style.add_photo}>
            <img src="/img/icons/camera.png" alt="" />
          </div>
        </div>

        <div className={style.buttons}>
          <div className={style.button} onClick={handleSubmit}>
            Отправить
          </div>
          <div
            className={style.button_back}
            onClick={() => setVisibleAddOrder(false)}
          >
            Назад
          </div>
        </div>
      </div>
    </div>
  );
}
