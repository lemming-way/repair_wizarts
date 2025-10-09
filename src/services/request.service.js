import { getToken } from './token.service';
import appFetch from './api';
import formatDateForApI from '../utilities/formatDateForApi';

const createRequest = (payload, asAdmin) => {
  const token = getToken();
  const date = new Date();
  const formattedDate = formatDateForApI(date);
  return appFetch(
    '/drive',
    {
      body: {
        u_a_role: 1,
        data: JSON.stringify({
          b_start_address: 'адрес',
          b_start_datetime: formattedDate,
          b_max_waiting: 604800,
          b_payment_way: '2',
          b_options: {
            ...payload.data,
            author: {
              name: token.user?.u_name,
              email: token.user?.u_email,
              phone: token.user?.u_phone,
              photo: token.user?.u_photo,
            },
            status: 'Активно',
            type: 'order',
          },
        }),
      },
    },
    asAdmin,
  );
};
const updateRequest = (id, payload, asAdmin, actingUserId) => {
  const formattedData = Object.entries(payload).map(([key, value]) => [
    '=',
    [key],
    value,
  ]);
  return appFetch(
    'drive/get/' + id,
    {
      body: {
        u_a_role: 1,
        ...(actingUserId ? { u_a_id: actingUserId } : {}),
        action: 'edit',
        data: JSON.stringify({
          b_options: formattedData,
        }),
      },
    },
    asAdmin,
  );
};

const updateRequestStatus = (id, status) => updateRequest(id, { status });

const updateRequestStatusFromMaster = (id, payload) =>
  appFetch(`submission/complete-request/${id}?status=${payload}`, {});

const deleteRequest = (requestId) =>
  appFetch('drive/get/' + requestId, {
    body: { u_a_role: 1, action: 'set_cancel_state' },
  });

const getRequestById = (requestId) =>
  appFetch('submission/request/' + requestId);
const getClientRequests = () => {
  return appFetch('drive', {
    body: {
      u_a_role: 1,
    },
  });
};
const getAllClientRequests = () => {
  return Promise.all([
    appFetch('drive', {
      body: {
        u_a_role: 1,
        lc: 99999999999999,
      },
    }),
    appFetch('drive/archive', {
      body: { lc: 99999999999999 },
    }),
  ]);
};

//~ const getClientRequestsTestData = () => {
  //~ return new Promise((resolve) => {
    //~ const mockResponse = [
      //~ {
        //~ id: 36,
        //~ client_id: 6,
        //~ client: {
          //~ id: 6,
          //~ phone: '+79111111111',
          //~ name: 'test',
          //~ lastname: 'test',
          //~ avatar: 'files/Снимок экрана от 2025-01-28 11-58-29.png',
          //~ number_of_submissions: 4,
        //~ },
        //~ title: 'test',
        //~ description: 'test',
        //~ pictures: [],
        //~ client_price: 1000.0,
        //~ service_type_id: 1,
        //~ service_type: { name: 'Ремонт телефона' },
        //~ status: 'Активно',
        //~ created_at: '2025-02-25T20:06:08.132360',
        //~ expires_at: '2025-02-26T20:06:08.130533',
        //~ number_of_offers: 0,
        //~ views: 0,
      //~ },
    //~ ];

    //~ // Simulate network delay
    //~ setTimeout(() => resolve(mockResponse), 500);
  //~ });
//~ };

const getMasterRequests = () => appFetch('drive', { body: { u_a_role: 1 } });
// appFetch('drive', { body: { u_a_role: 2 } }),

const getMasterPersonalRequests = () => appFetch('submission/master-requests');

export {
  createRequest,
  updateRequest,
  updateRequestStatus,
  updateRequestStatusFromMaster,
  deleteRequest,
  getClientRequests,
  getMasterRequests,
  getMasterPersonalRequests,
  getRequestById,
  getAllClientRequests,
};
