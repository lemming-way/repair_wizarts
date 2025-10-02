import React, { useEffect, useState, Suspense } from 'react';

import '../../scss/applications.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import style from './applications.module.css';
import NavApplication from './NavApplication';
import { useService } from '../../hooks/useService';
import { getMasterOrders } from '../../services/order.service';
import { selectUser } from '../../slices/user.slice';

const EmojiPickerLazy = React.lazy(() => import('emoji-picker-react'));
//~ const statusEnum = {
  //~ '#order': 'Активно',
  //~ '#all': 'Активно',
  //~ '#working': 'В работе',
  //~ '#cancel': 'Отменено',
//~ };
const StylesStatusEnum = {
  Активно: 'status_green',
  'В работе': 'status_in_progress',
  Пауза: 'status_stop',
};
function MyApplications() {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const navigator = useNavigate();
  const orders = useService(getMasterOrders, []);
  const rawRequests = [...Object.values(orders.data?.data?.booking || {})];
  const filteredRequests = rawRequests.filter(
    (item) => item.b_options.type === 'order' && item.u_id !== user.u_id,
  );
  //   // test
  //   // const filteredOrders = [
  //   //     {
  //   //         "id": 1,
  //   //         "order_id": "test",
  //   //         "client_price": "test",
  //   //         "client_id": "test",
  //   //         "repairs": ["test1", "test2"],
  //   //         "created_at": "test",
  //   //         "client_message": "test",
  //   //         "status": "статус"
  //   //     }
  //   // ]

  //   const test_orders = [
  //     {
  //       orderid: 1,
  //       clientprice: 250.0,
  //       clientid: 101,
  //       repairs: [{ name: 'Замена масла' }, { name: 'Проверка тормозов' }],
  //       createdat: '2023-10-01T10:00:00Z',
  //       clientmessage: 'Пожалуйста, позвоните перед выполнением работ.',
  //       status: 'Ожидание',
  //     },
  //     {
  //       orderid: 2,
  //       clientprice: 150.5,
  //       clientid: 102,
  //       repairs: ['Ремонт подвески'],
  //       createdat: '2023-10-02T12:30:00Z',
  //       clientmessage: 'Нужна срочная замена деталей.',
  //       status: 'В процессе',
  //     },
  //     {
  //       orderid: 3,
  //       clientprice: 75.0,
  //       clientid: 103,
  //       repairs: ['Замена стекла'],
  //       createdat: '2023-10-03T14:15:00Z',
  //       clientmessage: 'Работы должны быть выполнены не позже завтрашнего дня.',
  //       status: 'Завершено',
  //     },
  //     {
  //       orderid: 4,
  //       clientprice: 300.0,
  //       clientid: 104,
  //       repairs: ['Полная диагностика', 'Замена аккумулятора'],
  //       createdat: '2023-10-04T09:00:00Z',
  //       clientmessage: 'Пожалуйста, проверьте все компоненты.',
  //       status: 'Ожидание',
  //     },
  //     {
  //       orderid: 5,
  //       clientprice: 120.0,
  //       clientid: 105,
  //       repairs: ['Ремонт кузова'],
  //       createdat: '2023-10-05T11:45:00Z',
  //       client_message: 'Работы требуются срочно из-за ДТП.',
  //       status: 'В процессе',
  //     },
  //   ];

  useEffect(() => {
    document.title = 'Заявки';
  }, []);

  const [inputChat, setInputChat] = useState('');
  const [isVisibleEmoji, setVisibleEmoji] = useState(false);

  function addEmojiToMessage(emoji) {
    setInputChat((prevMessage) => prevMessage + emoji.emoji);
  }
  return (
    <>
      <div className="mini-text">
        <h1>Заявки</h1>
      </div>
      <NavApplication />
      {filteredRequests.length === 0 && (
        <div className={style.empty_orders}>
          <img src="/img/robot.png" alt="" />
          <p className={style.heading}>У вас пока нет заявок</p>
          <p>Оформленные заявки отобразятся на этой странице! </p>
        </div>
      )}

      <div className={style.orders}>
        {filteredRequests.map((item) => {
          return (
            <details className={style.details}>
              <summary className={style.summary}>
                <div className={style.summary_row}>
                  <p>{item.b_options.author.name}</p>
                  <p>{item.b_created}</p>
                </div>
                <div className={style.summary_row}>
                  <p>{item.b_options.title}</p>
                  <p>
                    Стоимость:{' '}
                    <span className={style.price}>
                      {item.b_options.client_price}₽
                    </span>
                  </p>
                </div>
                <div className={style.summary_row}>
                  <div
                    className={`${style.status} ${
                      style[StylesStatusEnum[item.b_options.status]]
                    }`}
                  >
                    {item.b_options.status}
                  </div>
                  <div className={style.flex_empty}></div>
                  <div className={style.miniSwiperWrap}>
                    <div className="miniSlider">
                      <img
                        style={{ width: '40px' }}
                        src="/img/sentence_img/iphone-x.png"
                        alt=""
                      />
                    </div>
                  </div>
                  <div>
                    <img className={style.arrow} src="/img/bot.png" alt="" />
                  </div>
                </div>
              </summary>
              <div className={style.details_body}>
                <p className={style.name_heading}>
                  {item.b_options.author.name}
                </p>
                <p className={style.text}>{item.b_options.description}</p>
                {/* <div className={style.alert}>чтобы взять новую заявку, пожалуйста подтвердите предыдущую которая в чате </div> */}
                <div className={style.chat_wrap}>
                  {isVisibleEmoji ? (
                    <div className={style.emoji_pos}>
                      <Suspense fallback={<div className="emoji-loading" />}>
                        <EmojiPickerLazy onEmojiClick={addEmojiToMessage} />
                      </Suspense>
                    </div>
                  ) : null}
                  <input
                    className={style.input_chat}
                    value={inputChat}
                    onChange={(event) => setInputChat(event.target.value)}
                    placeholder="Сообщение..."
                    type="text"
                  />
                  <img
                    className={style.skrepka}
                    src="/img/screpka.png"
                    alt=""
                  />
                  <img
                    className={style.smile}
                    src="/img/smile.png"
                    onClick={() => setVisibleEmoji((prev) => !prev)}
                    alt=""
                  />
                </div>
                <div className={style.buttons_row}>
                  <div className={style.buttons}>
                    <button
                      className={style.button}
                      onClick={() => navigator('/master/chat/168789461')}
                    >
                      Согласиться
                    </button>
                    <button className={style.button_back}>Отказаться</button>
                  </div>
                  {/* <div style={{flex:1}}></div> */}
                  <div className={style.timing_row}>
                    <p>Выставить время</p>
                    <select className={style.select} name="" id="">
                      <option value="" disabled>
                        Выберите
                      </option>
                      <option value="">Готов выехать</option>
                      <option value="">1 час</option>
                      <option value="">2 часа</option>
                      <option value="">3 часа</option>
                      <option value="">4 часа</option>
                      <option value="">6 часов</option>
                      <option value="">8 часов</option>
                      <option value="">24 часа</option>
                      <option value="">3 дня</option>
                      <option value="">7 дней</option>
                    </select>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* <div className="so_3"> */}
      {/* {filteredOrders?.map((v) => ( */}
      {/* {test_orders.map((v) => ( */}
      {/* <Application {...v} order_id={v.id} key={v.id} status={v.status} /> */}
      {/* // ))} */}
      {/* </div> */}
    </>
  );
}

export default MyApplications;
