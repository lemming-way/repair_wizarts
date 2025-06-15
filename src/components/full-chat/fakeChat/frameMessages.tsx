import { useEffect, useMemo } from 'react'; // Добавил useMemo
import '../../../scss/chat.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../slices/user.slice';
import { getAllClientRequests } from '../../../services/request.service';
import { useService } from '../../../hooks/useService';
import { selectUI } from '../../../slices/ui.slice';
import { getMasterOrders } from '../../../services/order.service';

function App() {
  const ui = useSelector(selectUI);
  const user =
    (Object.values(useSelector(selectUser)?.data?.user || {})[0] as any) ||
    ({} as any);
  const userRequests = useService(
    ui.isMaster ? getMasterOrders : getAllClientRequests,
    [],
  );

  const groupedChats = useMemo(() => {
    const rawRequests = Array.from(
      new Map(
        userRequests?.data
          ?.map((item) => Object.values(item?.data?.booking || {}))
          .flat()
          .filter((request) => request?.b_id)
          .map((request) => [request.b_id, request]),
      ).values(),
    );
    const filteredRequests = rawRequests.filter(
      (item: any) =>
        item.b_options?.winnerMaster && item.drivers && item.drivers.length > 0,
    );
    const chatsByMaster: any = filteredRequests.reduce(
      (acc: any, request: any) => {
        const masterId = request.b_options.winnerMaster;
        if (!acc[masterId]) {
          acc[masterId] = [];
        }
        acc[masterId].push(request);
        return acc;
      },
      {},
    );
    return Object.values(chatsByMaster).map((orders: any) => {
      const firstOrder = orders[0];
      const winnerDriver = firstOrder.drivers.find(
        (d) => d.u_id === firstOrder.b_options.winnerMaster,
      );
      return {
        isOwner: firstOrder.u_id === user.u_id,
        chatId: `${firstOrder.u_id}_${firstOrder.b_options.winnerMaster}`,
        clientInfo: firstOrder.b_options.author || {},
        masterInfo: winnerDriver.c_options.author || {},
        orders: orders,
      };
    });
  }, [userRequests.data]);
  // console.log(groupedChats);
  // --- КОНЕЦ ИЗМЕНЕНИЯ ---

  useEffect(() => {
    document.title = 'Чат';
  }, []);

  return (
    <div className="frame_messages frame_messages__fullchat">
      <div className="block_messages font_inter">
        <div className="messages_text">
          <h2>Сообщения</h2>
        </div>
        <div className="magnafire df align">
          <div className="magnafire_img">
            <img src="/img/chat_img/лупа.png" alt="no img" />
          </div>
          <div className="magnafire_input">
            <input type="text" placeholder="Поиск..." />
          </div>
        </div>
      </div>

      <div className="big_messages__wrap">
        {/* --- ИЗМЕНЕНИЕ: Рендерим сгруппированные чаты --- */}
        {groupedChats.length === 0
          ? 'Пусто'
          : groupedChats.map(({ chatId, masterInfo, isOwner, clientInfo }) => (
              <div className="big_messages" key={chatId}>
                <Link
                  to={
                    window.location.href.includes('master')
                      ? `/master/chat/${chatId}`
                      : `/client/chat/${chatId}`
                  }
                >
                  <div className="ilya df font_inter align">
                    <div className="ilya_img">
                      <img
                        src={masterInfo.u_photo || '/img/img-camera.png'}
                        style={{ height: 65, width: 66, borderRadius: 30 }}
                        alt="chat icon"
                      />
                    </div>

                    <div className="ilya_text">
                      <h2>
                        {isOwner
                          ? masterInfo.u_name || 'Мастер'
                          : clientInfo.name || 'Мастер'}
                      </h2>

                      <h3
                        className="txt-text-small-ver"
                        style={{ color: '#D9573B' }}
                      >
                        Печатает...
                      </h3>
                    </div>

                    <div className="ilya_text-2">
                      <h2>
                        {new Date(
                          masterInfo.u_details?.lastTimeBeenOnline ||
                            new Date().toISOString(),
                        )?.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </h2>
                      <h3>1</h3>
                    </div>
                  </div>
                  <div className="line_ilya"></div>
                </Link>
              </div>
            ))}
      </div>
    </div>
  );
}

export default App;
