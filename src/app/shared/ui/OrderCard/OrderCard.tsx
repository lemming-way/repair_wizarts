import { useLanguage } from 'app/state/language';
import { useCities } from 'app/state/site-data';
import { formatDate } from 'app/shared/lib/formatDate';
import { useProducts } from 'app/state/site-data';
import { Order, OrderType, orderStatusString } from 'app/state/order';

import styles from './OrderCard.module.css';

type OrderCardProps = {
  order?: Order;
};

export function OrderCard({ order, ...otherProps }: OrderCardProps) {
  const text = useLanguage();
  const { cities } = useCities();
  const { products } = useProducts();

  if (!order) return null;
  const city = cities[order.city]?.name || text('Unknown city');
  const product = products?.[order.productId]?.name || text('Unknown service');

  return (
    <div className={styles.info} {...otherProps}>
      <p className={styles.info__header}>
        <span>
          {text('Order No.')}
        </span>
        {' '}{order.id}
      </p>
      {
        order.type === OrderType.Direct ?
        <>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Category')}
            </span>
            {product}
          </p>
          <div className={styles.info__srvlist}>
            <p className={styles.info__text_about_light}>
              {text('Service')}
            </p>
            <div>
              {order.services?.map((service, i) =>
                <p key={i}>{service.service}</p>
              )}
            </div>
          </div>
        </>
        :
        <p>
          <span className={styles.info__text_about_light}>
            {text('Service')}
          </span>
          {product}
        </p>
      }
      <p>
        <span className={styles.info__text_about_light}>
          {text('City')}
        </span>
        {city}
      </p>
      <p>
        <span className={styles.info__text_about_light}>
          {text('Address')}
        </span>
        {order.address}
      </p>
      <p>
        <span className={styles.info__text_about_light}>
          {text('Creation date')}
        </span>
        {formatDate(order.createdAt)}
      </p>
      <p>
        <span className={styles.info__text_about_light}>
          {text('Status')}
        </span>
        {text(orderStatusString[order.status] || 'Unknown status')}
      </p>
      <p>
        <span className={styles.info__text_about_light}>
          {text('Price')}
        </span>
        {order.agreedPrice || order.desiredPrice}
      </p>
      <p>
        <span className={styles.info__text_about_light}>
          {text('Description')}
        </span>
        {order.description}
      </p>
    </div>
  );
}
