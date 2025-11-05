import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import style from './blackListModal.module.css';
import { updateUser } from '../../../services/user.service';
import appFetch from '../../../utilities/appFetch';
import { useUserQuery } from '../../../hooks/useUserQuery';
import { userKeys } from '../../../queries';

const EMPTY_ARRAY = []

export default function BlackListModal({ setVisibleBlackList }) {
  const queryClient = useQueryClient();
  const { user } = useUserQuery();
  const blackList = user.u_details?.black_list || EMPTY_ARRAY;

  const [blackListData, setBlackListData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await Promise.all(
        blackList.map(async (item) => {
          const userReq = await appFetch(`user/${item.id}`, {}, true);
          const targetUser = Object.values(userReq.data.user || {})[0];
          const date = new Date(item.date);
          const pad = (n) => String(n).padStart(2, '0');

          const formattedDate = `${pad(date.getDate())}.${pad(
            date.getMonth() + 1,
          )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(
            date.getMinutes(),
          )}`;

          return {
            id: item.id,
            name: targetUser?.u_name || 'Неизвестно',
            date: formattedDate,
          };
        }),
      );

      setBlackListData(data);
    };

    if (blackList.length > 0) {
      fetchUsers();
    }
  }, [blackList]);

  const handleUnblock = (id) => {
    const newList = blackList.filter((l) => l.id !== id);
    console.log(newList);
    if (!user.u_id) {
      return;
    }
    updateUser(
      {
        details: {
          black_list: newList,
        },
      },
      user.u_id,
    ).then(() => queryClient.invalidateQueries({ queryKey: userKeys.all }));  // todo: перенести в state/user
    setBlackListData((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setVisibleBlackList(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>Черный список</h2>
        <div className={style.row_td}>
          <p>Дата</p>
          <p>Пользователь</p>
        </div>
        {blackListData.length === 0 ? (
          <p>Пока пусто</p>
        ) : (
          blackListData.map((item) => (
            <div key={item.id} className={style.user_ban}>
              <div
                className={style.row_button}
                onClick={() => handleUnblock(item.id)}
              >
                <div className={style.button}>Разблокировать</div>
              </div>
              <div className={style.data}>
                <p>{item.date}</p>
                <p>{item.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
