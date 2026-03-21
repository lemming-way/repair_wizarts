import style from './Allorders.module.css';

// Принимаем stats как пропс
export default function StatsBlock({ stats }) {
  // Форматируем число, чтобы оно выглядело красиво (например, 123 000)
  const formattedAmount = new Intl.NumberFormat('ru-RU').format(
    stats?.totalAmount || 0,
  );

  return (
    <>
      <div className={style.stats_block}>
        <div className={style.stats_row}>
          <img src="/img/bar-graph.png" alt="" />
          <p className={style.filter__heading2}>Статистика заказов за месяц</p>
        </div>
        {/* Используем данные из props. Добавляем '|| 0' на случай, если данные еще не загрузились */}
        <p className={style.stats__p_row}>
          <span>Проектов</span>
          <span>{stats?.totalProjects || 0}</span>
        </p>
        <p className={style.stats__p_row}>
          <span>На сумму</span>
          <span>{formattedAmount} ₽</span>
        </p>
        <p className={style.stats__p_row}>
          <span>Заказов</span>
          <span>{stats?.totalOrders || 0}</span>
        </p>
      </div>
    </>
  );
}
