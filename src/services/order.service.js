import appFetch from '../utilities/appFetch';

const getMasterOrders = () =>
  appFetch('/drive', {
    body: {
      u_a_role: 2,
    },
  });
// Mock method to fetch master orders
const getMasterOrdersTestData = () => {
  return new Promise((resolve) => {
    const mockOrders = [
      {
        order_id: 1,
        client_price: 10000.0,
        client_id: 6,
        repairs: [
          {
            id: 1,
            name: 'Ремонт экрана',
            description: 'Ремонт экрана',
            price: 10000.0,
          },
        ],
        created_at: '2025-02-25T18:00:00',
        client_message: 'Пожалуйста, почините экран как можно скорее.',
        status: 'в процессе',
      },
      {
        order_id: 2,
        client_price: 15000.0,
        client_id: 7,
        repairs: [
          {
            id: 2,
            name: 'Ремонт аккумулятора',
            description: 'Замена аккумулятора',
            price: 5000.0,
          },
        ],
        created_at: '2025-02-26T10:30:00',
        client_message: 'Мне нужно заменить батарею на MacBook.',
        status: 'новый',
      },
      {
        order_id: 3,
        client_price: 8000.0,
        client_id: 8,
        repairs: [
          {
            id: 3,
            name: 'Ремонт клавиатуры',
            description: 'Заменить несколько клавиш',
            price: 3000.0,
          },
        ],
        created_at: '2025-02-26T14:15:00',
        client_message: 'Требуется починить клавиатуру ноутбука.',
        status: 'завершён',
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockOrders), 500);
  });
};

const createOrder = (payload) =>
  appFetch('submission/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

const updateOrderStatus = (id, payload) =>
  appFetch('submission/order/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ status: payload }),
  });

const updateOrderStatusFromClient = (id, payload) =>
  appFetch(`submission/finish-order/${id}?status=${payload}`, {
    method: 'PATCH',
  });

export {
  getMasterOrders,
  createOrder,
  updateOrderStatus,
  updateOrderStatusFromClient,
};
