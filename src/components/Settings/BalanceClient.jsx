import { useEffect, useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { useQueryClient } from '@tanstack/react-query';

import style from './Balance.module.css';
import ModalConfirm from './ModalConfirm';
import ModalDelete from './ModalDelete';
import ModalSuccess from './ModalSuccess';
import { updateUser } from '../../services/user.service';
import ModalVivod from '../ChoiceOfReplenishmentMethod/ModalVivod';
import { useUserQuery } from '../../hooks/useUserQuery';
import { userKeys } from '../../queries';

const BalanceClient = () => {
  const queryClient = useQueryClient();
  const { user } = useUserQuery();

  const [isVisibleModalVivod, setInputModalVivod] = useState(false);
  const [isVisibleRow, setVisibleRow] = useState(false);
  const [inputCard, setInputCard] = useState('2202 20** **** 0719');
  const [inputPrice, setInputPrice] = useState('100 001.53');
  const [isVisibleConfirm, setVisibleConfirm] = useState(false);
  const [isVisibleSuccess, setVisibleSuccess] = useState(false);
  const [isVisibleDelete, setVisibleDelete] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const walletValue = user?.u_details?.wallets?.[0]?.value;
  const userBalance = user?.u_details?.balance;

  useEffect(() => {
    //~ if (user) {
      setInputCard(walletValue || 'не указано');
      setInputPrice(userBalance || '0.0');
      setCurrentPage(1); // сбрасываем страницу при смене данных
    //~ }
  }, [walletValue, userBalance]);

  const allPayments = user?.u_details?.history_of_pay || [];

  // Apply filtering
  const filteredPayments = allPayments.filter((item) => {
    const itemDate = new Date(item.date);

    const isAfterStart = startDate ? itemDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? itemDate <= new Date(endDate) : true;
    const isTypeMatch = selectedType ? item.type === selectedType : true;

    return isAfterStart && isBeforeEnd && isTypeMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const tableInfoPayments = currentPayments.map((item, idx) => {
    const isoString = item.date;
    const date = new Date(isoString);
    const optionsDate = { day: 'numeric', month: 'long', timeZone: 'UTC' };
    const optionsTime = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    };

    const formattedDate = new Intl.DateTimeFormat('ru-RU', optionsDate).format(
      date,
    );
    const formattedTime = new Intl.DateTimeFormat('ru-RU', optionsTime).format(
      date,
    );
    const result = `${formattedDate}, ${formattedTime}`;

    return (
      <div key={idx} className={style.order_row_v2}>
        <p>
          <span style={{ whiteSpace: 'nowrap' }}>{result}</span>
        </p>
        <p className={style.decr_width}>{item.title}</p>
        <p className={style.table__price}>{item.cost} ₽</p>
        <div>
          <div className={style.status}>{item.status}</div>
        </div>
      </div>
    );
  });

  return (
    <>
      {isVisibleModalVivod && (
        <ModalVivod setInputModalVivod={setInputModalVivod} />
      )}

      {isVisibleConfirm && (
        <ModalConfirm
          setVisibleConfirm={setVisibleConfirm}
          setVisibleSuccess={setVisibleSuccess}
        />
      )}

      {isVisibleSuccess && (
        <ModalSuccess setVisibleSuccess={setVisibleSuccess} />
      )}

      {isVisibleDelete && <ModalDelete setVisibleDelete={setVisibleDelete} />}

      <div className={style.main}>
        <h3 className={style.heading}>Баланс</h3>

        <div className={style.wrap_row1}>
          <p className={style.balance}>{user?.u_details?.balance || '0.0'}</p>

          {!isVisibleRow && (
            <div className={style.buttons_row}>
              <button className={style.button}>Пополнить баланс</button>
              <button
                className={style.button_back}
                onClick={() => {
                  setVisibleRow(true);
                }}
              >
                Вывести средства
              </button>
            </div>
          )}

          {isVisibleRow && user?.u_details?.wallets && (
            <div className={style.wrap_row1__row}>
              <select
                className={style.select}
                onChange={(e) => {
                  const currentCard = user?.u_details.wallets.find(
                    (item) => item.type === e.target.value,
                  );
                  setInputCard(currentCard.value);
                }}
              >
                {user?.u_details?.wallets.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.type}
                  </option>
                ))}
              </select>
              <input
                className={style.input_date}
                type="text"
                value={inputCard}
                onChange={(event) => setInputCard(event.target.value)}
              />
              <input
                className={style.input_date}
                type="text"
                value={inputPrice}
                onChange={(event) => setInputPrice(event.target.value)}
              />
              <div className={style.buttons_row}>
                <button
                  className={style.button}
                  onClick={() => {
                    setInputModalVivod(true);
                    const oldHistory = user?.u_details?.history_of_pay
                      ? user?.u_details?.history_of_pay
                      : [];
                    const newPayment = {
                      cost: Number(inputPrice),
                      type: 'вывод',
                      date: new Date().toISOString(),
                      status: 'Успешно',
                      title: 'Вывод средств',
                    };
                    if (!user?.u_id) {
                      return;
                    }
                    updateUser(
                      {
                        details: {
                          balance:
                            (user?.u_details?.balance || 0) -
                            Number(inputPrice),
                          history_of_pay: [...oldHistory, newPayment],
                        },
                      },
                      user.u_id,
                    ).then(() =>
                      queryClient.invalidateQueries({ queryKey: userKeys.all }),
                    );
                  }}
                >
                  Вывести
                </button>
                <button
                  className={style.button_back}
                  onClick={() => setVisibleRow(false)}
                >
                  Отменить
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={style.wrap_row2}>
          <input
            className={style.input_date}
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            className={style.input_date}
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className={style.select}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Все операции</option>
            <option value="replenishment">Пополнение</option>
            <option value="refund">Возврат оплаты заказа</option>
            <option value="balance_topup">Пополнение баланса</option>
            <option value="withdrawal">Списание</option>
            <option value="order_payment">Оплата заказов</option>
            <option value="application_payment">Оплата заявок</option>
          </select>
        </div>

        <div className={style.wrap_row3}>
          <p>Дата</p>
          <p className={style.decr_width}>Списание</p>
          <p>Сумма</p>
          <p>Статус</p>
        </div>

        {filteredPayments.length === 0 ? (
          <p style={{ padding: '1rem' }}>Нет подходящих операций</p>
        ) : (
          tableInfoPayments
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination>
              {[...Array(totalPages).keys()].map((number) => (
                <Pagination.Item
                  key={number + 1}
                  active={number + 1 === currentPage}
                  onClick={() => setCurrentPage(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
};

export default BalanceClient;
