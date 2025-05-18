import appFetch from '../utilities/appFetch';

const getServices = () => appFetch('service/all-services');

const getServiceCategories = () => appFetch('service/categories');

const getServiceTypes = () => appFetch('service/types');

const getServiceTypesByCategoryId = (categoryId) =>
  appFetch('service/types/' + categoryId);

const getServiceDevices = () => appFetch('service/devices');

const getServiceDevicesByTypeId = (typeId) =>
  appFetch('service/devices/' + typeId);

const getServiceRepairs = () => appFetch('service/repair_types');

const getServiceRepairsByDeviceId = (deviceId) =>
  appFetch('service/repair_types/' + deviceId);
// Mock method to fetch all services
const getServicesTestData = () => {
  return new Promise((resolve) => {
    const mockServices = [
      {
        id: 1,
        name: 'Электроника',
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockServices), 500);
  });
};

// Mock method to fetch service categories
const getServiceCategoriesTestData = () => {
  return new Promise((resolve) => {
    const mockCategories = [
      {
        id: 1,
        name: 'Электроника',
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockCategories), 500);
  });
};

// Mock method to fetch service types
const getServiceTypesTestData = () => {
  return new Promise((resolve) => {
    const mockServiceTypes = [
      {
        id: 1,
        name: 'Ремонт телефона',
        category_id: 1,
      },
      {
        id: 2,
        name: 'Ремонт ноутбука',
        category_id: 1,
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockServiceTypes), 500);
  });
};

// Mock method to fetch service types by category ID
const getServiceTypesByCategoryIdTestData = (categoryId) => {
  return new Promise((resolve) => {
    const mockServiceTypesByCategory = [
      {
        id: 1,
        name: 'Ремонт телефона',
        category_id: categoryId,
      },
      {
        id: 2,
        name: 'Ремонт ноутбука',
        category_id: categoryId,
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockServiceTypesByCategory), 500);
  });
};

// Mock method to fetch service devices
const getServiceDevicesTestData = () => {
  return new Promise((resolve) => {
    const mockDevices = [
      {
        id: 1,
        name: 'Iphone',
        picture: 'files/28a4a22666fd96fa10a0b436b0666605.jpeg',
        service_id: 1,
      },
      {
        id: 2,
        name: 'MacBook',
        picture: null,
        service_id: 2,
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockDevices), 500);
  });
};

// Mock method to fetch service devices by type ID
const getServiceDevicesByTypeIdTestData = (typeId) => {
  return new Promise((resolve) => {
    const mockDevicesByType = [
      {
        id: 1,
        name: 'Iphone',
        picture: 'files/28a4a22666fd96fa10a0b436b0666605.jpeg',
        service_id: typeId,
      },
      {
        id: 2,
        name: 'MacBook',
        picture: null,
        service_id: typeId,
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockDevicesByType), 500);
  });
};

// Mock method to fetch service repairs
const getServiceRepairsTestData = () => {
  return new Promise((resolve) => {
    const mockRepairs = [
      {
        id: 1,
        name: 'Ремонт экрана',
        description: 'Ремонт экрана',
        price: 10000.0,
        device_id: 1,
        is_custom: false,
        master: null,
        devices: [
          {
            id: 1,
            name: 'Iphone',
            picture: 'files/28a4a22666fd96fa10a0b436b0666605.jpeg',
            service_id: 1,
          },
          {
            id: 2,
            name: 'MacBook',
            picture: null,
            service_id: 2,
          },
        ],
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockRepairs), 500);
  });
};

// Mock method to fetch service repairs by device ID
const getServiceRepairsByDeviceIdTestData = (deviceId) => {
  return new Promise((resolve) => {
    const mockRepairsByDevice = [
      {
        id: 1,
        name: 'Ремонт экрана',
        description: 'Ремонт экрана',
        price: 10000.0,
        device_id: deviceId,
        is_custom: false,
        master: null,
      },
    ];

    // Simulate network delay
    setTimeout(() => resolve(mockRepairsByDevice), 500);
  });
};

const getMasterRepairs = () => appFetch('service/master-repairs');

const getMasterRepairsByUsername = (username) =>
  appFetch('service/master-repairs?master_username=' + username);

const getMasterServices = (id) => appFetch('service/master-services/' + id);

const updateMasterRepair = (repairId, payload) =>
  appFetch('service/master-repair/' + repairId, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

const updateMasterCustomRepair = (repairId, payload) =>
  appFetch('service/repair_type/' + repairId, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

const removeMasterRepair = (repairId) =>
  appFetch('service/master-repair/' + repairId, {
    method: 'DELETE',
  });

export {
  getServices,
  getServiceCategories,
  getServiceTypes,
  getServiceTypesByCategoryId,
  getServiceDevices,
  getServiceDevicesByTypeId,
  getServiceRepairs,
  getServiceRepairsByDeviceId,
  getMasterRepairs,
  getMasterRepairsByUsername,
  getMasterServices,
  updateMasterRepair,
  updateMasterCustomRepair,
  removeMasterRepair,
  getServiceRepairsTestData,
};
