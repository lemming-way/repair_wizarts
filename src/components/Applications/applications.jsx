import React, { useEffect, useState, Suspense } from 'react';

import '../../scss/applications.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../state/language';

import style from './applications.module.css';
import NavApplication from './NavApplication';
import ApplicationsSkeleton from './ApplicationsSkeleton';
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
  const text = useLanguage();
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const navigator = useNavigate();
  const orders = useService(getMasterOrders, []);

  // Hooks must be called unconditionally
  useEffect(() => {
    document.title = text('Applications');
  }, [text]);

  const [inputChat, setInputChat] = useState('');
  const [isVisibleEmoji, setVisibleEmoji] = useState(false);

  // if still loading — show full-page skeleton (nav + cards + chat-input)
  if (!orders?.data) {
    return (
      <>
        <div className="mini-text">
          <h1>{text('Applications')}</h1>
        </div>
        <ApplicationsSkeleton />
      </>
    );
  }

  const rawRequests = [...Object.values(orders.data?.data?.booking || {})];
  const filteredRequests = rawRequests.filter(
    (item) => item.b_options.type === 'order' && item.u_id !== user.u_id,
  );

  function addEmojiToMessage(emoji) {
    setInputChat((prevMessage) => prevMessage + emoji.emoji);
  }
  return (
    <>
      <div className="mini-text">
        <h1>{text('Applications')}</h1>
      </div>
      <NavApplication />
      {filteredRequests.length === 0 && (
        <div className={style.empty_orders}>
          <img src="/img/robot.png" alt="" />
          <p className={style.heading}>{text('You have no applications yet')}</p>
          <p>{text('Submitted applications will appear on this page!')} </p>
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
                    {text('Cost')}:{' '}
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
                    placeholder={text('Message...')}
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
                      {text('Agree')}
                    </button>
                    <button className={style.button_back}>{text('Decline')}</button>
                  </div>
                  {/* <div style={{flex:1}}></div> */}
                  <div className={style.timing_row}>
                    <p>{text('Set time')}</p>
                    <select className={style.select} name="" id="">
                      <option value="" disabled>
                        {text('Select')}
                      </option>
                      <option value="">{text('Ready to go')}</option>
                      <option value="">{text('1 hour')}</option>
                      <option value="">{text('2 hours')}</option>
                      <option value="">{text('3 hours')}</option>
                      <option value="">{text('4 hours')}</option>
                      <option value="">{text('6 hours')}</option>
                      <option value="">{text('8 hours')}</option>
                      <option value="">{text('24 hours')}</option>
                      <option value="">{text('3 days')}</option>
                      <option value="">{text('7 days')}</option>
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
