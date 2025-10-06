import { useEffect, lazy, Suspense } from 'react';

import { fetchUser, selectUser, selectUserStatus } from '../slices/user.slice';

import '../scss/swiper.css';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';

import WalletHistoryClient from './ChoiceOfReplenishmentMethod/WalletHistoryClient';
import ClientSettingsWrap from './pages/ClientSettingsWrap';
import MasterSettingsWrap from './pages/MasterSettingsWrap';

// import RegistrationMasterPage from '../features/RegistrationPage/RegistrationMasterPage/RegistrationMasterPage';

// Order imports

import SettingsAll from './Settings/Settings-all';
import Reviews from './Reviews';

import Offer from './Orders/Offer';

// after login
import WalletFH from './full-height/WalletFH';

// after login end

import ProfileNumber from './Chat/profileNumber';
// import AddDevices from './addDevices/AddDevices';
import AddedDevices from './addDevices/AddedDevices';
// import TitleService from './addDevices/TitleService';
// import Remont from './remont';
import AuthLogin from './Registration/AuthLogin';
import ClientRoute from './ClientRoute';
import MasterRoute from './MasterRoute';
import WalletConfirm from './ChoiceOfReplenishmentMethod/WalletConfirm';
import Finance from './Settings/Finance';
import Balance from './Settings/Balance';
import Article from './Article';
import FetchStatus from '../constants/FetchStatus';
import { fetchServices } from '../slices/services.slice';
import {
  setAuthorization,
  setLoading,
  setLocation,
  setMaster,
} from '../slices/ui.slice';
import { getLocation } from '../services/location.service';
import { getToken } from '../services/token.service';
import { getUserMode, updateUser } from '../services/user.service';
import PersonalRequests from './Orders/PersonalRequests';
import Articles from './Article/Articles';
import WalletHistory from './ChoiceOfReplenishmentMethod/WalletHistory';
// import AddedDevicesPage from './Orders/AddedDevicesPage';

import Home from './Home';
import FinanceClient from './Settings/FinanceClient';
import MasterChatWrap from './pages/MasterChatWrap';
import PickLog from './Registration/pick-log';
import { setCategories } from '../slices/cateories.slice';
import Footer from '../UI/Footer/FooterDesktop';
import Toolbar from '../UI/Toolbar/Toolbar';
import OrdersListSkeleton from './Orders/skeletons/OrdersListSkeleton';
import RegistrationFormSkeleton from './Registration/skeletons/RegistrationFormSkeleton';
import ServiceDetailSkeleton from './Service/skeletons/ServiceDetailSkeleton';
import SettingsFormSkeleton from './Settings/skeletons/SettingsFormSkeleton';
import WalletFormSkeleton from './ChoiceOfReplenishmentMethod/skeletons/WalletFormSkeleton';
import WalletHistorySkeleton from './ChoiceOfReplenishmentMethod/skeletons/WalletHistorySkeleton';

const MapMaster = lazy(() => import('./Pick-master/masters'));
const FChatKirill = lazy(() => import('./full-chat/fakeChat/Kirill'));
const ServiceDetail = lazy(() => import('./Service/ServiceDetail'));

// Lazy route-level components for Orders/Offers package
const AllOrders = lazy(() => import('./Orders/Allorders'));
const Orders = lazy(() => import('./Orders/Orders'));
const OfferAService = lazy(() => import('./Orders/OfferAService'));
const Applications = lazy(() => import('./Applications/applications'));
const MyOrdersMaster = lazy(() => import('./Orders/MyOrdersMaster'));
const Mysuggest = lazy(() => import('./mysuggest'));
const MyOrder = lazy(() => import('./Orders/MyOrder'));

const FALLBACKS = {
  default: (
    <div
      style={{
        padding: '24px',
        display: 'grid',
        gap: 16,
        background: '#f7f7f7',
        borderRadius: 12,
        minHeight: 160,
      }}
    >
      <div style={{ background: '#e5e5e5', height: 28, borderRadius: 8, width: '40%' }} />
      <div style={{ background: '#e5e5e5', height: 16, borderRadius: 8, width: '60%' }} />
      <div style={{ background: '#e5e5e5', height: 16, borderRadius: 8, width: '55%' }} />
      <div style={{ background: '#e5e5e5', height: 120, borderRadius: 12 }} />
    </div>
  ),
  service: <ServiceDetailSkeleton />,
  orders: <OrdersListSkeleton />,
  registration: <RegistrationFormSkeleton />,
  settings: <SettingsFormSkeleton />,
  wallet: <WalletFormSkeleton />,
  walletHistory: <WalletHistorySkeleton />,
  balance: <div style={{padding: 24}} />,
  balanceClient: <div style={{padding: 24}} />,
  finance: <div style={{padding: 24}} />,
  financeClient: <div style={{padding: 24}} />,
  profile: <div style={{padding: 24}} />,
  profileFull: <div style={{padding: 24}} />,
  feedback: <div style={{padding: 24}} />,
};

// Lazy-load components for Settings/Profile package
const Profile = lazy(() => import('./Settings/Profile'));
const SettingsMaster = lazy(() => import('./Settings/SettingsMaster'));
const Services = lazy(() => import('./Settings/services'));
const ProfileFH = lazy(() => import('./full-height/ProfileFH'));
const BalanceClient = lazy(() => import('./Settings/BalanceClient'));
const ChoiceOfReplenishmentMethod = lazy(
  () => import('./ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethod'),
);
const ChoiceOfReplenishmentMethodClient = lazy(
  () => import('./ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodClient'),
);

// Lazy-load Registration & Review package
const RegistrationMasterPage = lazy(
  () =>
    import(
      '../features/RegistrationPage/RegistrationMasterPage/RegistrationMasterPage'
    ),
);
const RegisterLazy = lazy(() => import('./Registration/register'));
const ProfileFeedbackMasterLazy = lazy(
  () => import('./profileNumberClient/ProfileFeedbackMaster'),
);

// Lazy-load Catalog & Services package
const AddDevices = lazy(() => import('./addDevices/AddDevices'));
const TitleService = lazy(() => import('./addDevices/TitleService'));
const Remont = lazy(() => import('./remont'));

function App() {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const __location__ = useLocation();
  const dispatch = useDispatch();

  const userStatus = useSelector(selectUserStatus);
  const { categories } = useSelector((state) => state.categories);

  // Add visibility change tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateUser(
          {
            details: {
              isOnline: false,
              lastTimeBeenOnline: new Date().toISOString(),
            },
          },
          user.u_id,
        );
      } else if (document.visibilityState === 'visible') {
        updateUser(
          {
            details: {
              isOnline: true,
              lastTimeBeenOnline: new Date().toISOString(),
            },
          },
          user.u_id,
        );
      }
    };

    // Add page unload tracking
    const handleBeforeUnload = (event) => {
      updateUser(
        {
          details: {
            isOnline: false,
            lastTimeBeenOnline: new Date().toISOString(),
          },
        },
        user.u_id,
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch, user.u_id]);

  useEffect(() => {
    const isMaster = getUserMode();
    const location = getLocation();

    if (location) {
      dispatch(setLocation(location));
    }
    if (isMaster) {
      dispatch(setMaster(true));
    }
  }, [dispatch]);

  useEffect(() => {
    const token = getToken();
    if (token) dispatch(fetchUser());
  }, [__location__.pathname, dispatch]);

  useEffect(() => {
    const fetchFullDataAboutCategories = async () => {
      try {
        const sectionData = JSON.parse(localStorage.getItem('sections'));
        console.log(sectionData);
        if (sectionData) return dispatch(setCategories(sectionData));
        const response = await fetch(
          'https://profiback.itest24.com/api/full-data',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${'123'}`,
            },
          },
        );
        const data = await response.json();
        data.forEach((item) =>
          item.subsections
            .slice(0, 5)
            .forEach((item) => item.services.slice(0, 5)),
        );
        localStorage.setItem('sections', JSON.stringify(data));
        dispatch(setCategories(data));
      } catch (error) {
        console.error(error);
      }
    };

    if (categories.length === 0) {
      fetchFullDataAboutCategories();
    }
  }, [categories, dispatch]);
  useEffect(() => {
    const token = getToken();
    if (userStatus === FetchStatus.IDLE) {
      if (token) {
        dispatch(fetchUser());
        //dispatch(fetchMessages());
      } else {
        dispatch(setLoading(false));
      }

      // dispatch({ type: 'notifications/disconnect' });
      dispatch(fetchServices());
    }
    if (userStatus === FetchStatus.SUCCEEDED) {
      dispatch({ type: 'notifications/connect' });
      dispatch(setLoading(false));
      dispatch(setAuthorization(true));
    }
    if (userStatus === FetchStatus.FAILED) {
      dispatch(setLoading(false));
    }
  }, [userStatus, dispatch]);
  if (categories.length === 0) {
    return 'Loading...';
  }

  return (
    <>
      {/* <Notifications /> */}
      <Toolbar />
      <main>
        <Routes>
          <Route>
            <Route index element={<Home />} />
            <Route
              path="devices/:sectionId/:subsectionId"
              element={
                <Suspense fallback={FALLBACKS.service}>
                  <Remont />
                </Suspense>
              }
            />
            <Route
              path="services/:sectionId/:subsectionId/:serviceId"
              element={
                <Suspense fallback={FALLBACKS.service}>
                  <ServiceDetail />
                </Suspense>
              }
            />
            <Route path="articles/:id" element={<Article />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="articles" element={<Articles />} />
            <Route
              path="contact"
              element={
                <Suspense fallback={FALLBACKS.default}>
                  <MapMaster />
                </Suspense>
              }
            />
            <Route path="login" element={<AuthLogin />} />
            <Route path="register">
              <Route index element={<PickLog />} />
              <Route
                path="master"
                element={
                  <Suspense fallback={FALLBACKS.registration}>
                    <RegistrationMasterPage />
                  </Suspense>
                }
              />
              <Route
                path="client"
                element={
                  <Suspense fallback={FALLBACKS.registration}>
                    <RegisterLazy />
                  </Suspense>
                }
              />
            </Route>
          </Route>
          <Route
            path="client/settings/wallet_history"
            element={
              <Suspense fallback={FALLBACKS.walletHistory}>
                <WalletHistoryClient />
              </Suspense>
            }
          />
          <Route path="client" element={<ClientRoute />}>
            <Route path="settings" element={<ClientSettingsWrap />}>
              <Route
                index
                element={
                  <Suspense fallback={FALLBACKS.profileFull}>
                    <ProfileFH />
                  </Suspense>
                }
              />
              <Route path="picture" element={<WalletFH />} />
              <Route
                path="wallet"
                element={
                  <Suspense fallback={FALLBACKS.wallet}>
                    <ChoiceOfReplenishmentMethodClient />
                  </Suspense>
                }
              />
              <Route
                path="finance"
                element={
                  <Suspense fallback={FALLBACKS.financeClient ?? FALLBACKS.settings}>
                    <FinanceClient />
                  </Suspense>
                }
              />
              <Route
                path="balance"
                element={
                  <Suspense fallback={FALLBACKS.balanceClient ?? FALLBACKS.settings}>
                    <BalanceClient />
                  </Suspense>
                }
              />
            </Route>

            <Route path="requests">
              <Route index element={<AddedDevices />} />
              {/* <Route path="archived" element={<Archive />} /> */}
              <Route
                path="my_orders"
                element={
                  <Suspense fallback={FALLBACKS.orders}>
                    <MyOrdersMaster />
                  </Suspense>
                }
              />
              <Route
                path="my_order/:id"
                element={
                  <Suspense fallback={FALLBACKS.orders}>
                    <MyOrder />
                  </Suspense>
                }
              />
              <Route path="create">
                <Route
                  path="title"
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <TitleService />
                    </Suspense>
                  }
                />
                <Route
                  path="data"
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <AddDevices />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
            <Route
              path="offers/:id"
              element={
                <Suspense fallback={FALLBACKS.orders}>
                  <Mysuggest />
                </Suspense>
              }
            />
            {/* клиент на странице мастера может оставить отзыв */}
            <Route
              path="feedback/:id"
              element={
                <Suspense fallback={FALLBACKS.feedback}>
                  <ProfileFeedbackMasterLazy />
                </Suspense>
              }
            />
            {/* чат связан с бэком */}
            {/* <Route path="chat" element={<FChat />} /> */}
            {/* <Route path="chat/:id" element={<FChat />} /> */}
            {/* Чат без связи с бэком, только заготовка */}
            <Route
              path="chat"
              element={
                <Suspense fallback={FALLBACKS.default}>
                  <FChatKirill />
                </Suspense>
              }
            />
            <Route
              path="chat/:id"
              element={
                <Suspense fallback={FALLBACKS.default}>
                  <FChatKirill />
                </Suspense>
              }
            />

            {/* страница для оставления фидбека. Не знаю, что в ней, наверное её пересоздал выше */}
            {/* <Route path="feedback/:username" element={<ReviewsMaster />} /> */}
          </Route>

          <Route basename="master" path="master" element={<MasterRoute />}>
            {/* Чат без связи с бэком, только заготовка */}
            <Route element={<MasterChatWrap />}>
              <Route
                path="chat"
                element={
                  <Suspense fallback={FALLBACKS.default}>
                    <FChatKirill />
                  </Suspense>
                }
              />
              <Route
                path="chat/:id"
                element={
                  <Suspense fallback={FALLBACKS.default}>
                    <FChatKirill />
                  </Suspense>
                }
              />
              {/* прежний чат, был связана с бэком */}
              {/* <Route path="chat/" element={<FChat baseRoute="/master/chat/" showSidebar />} />
                        <Route path="chat/:id" element={<FChat baseRoute="/master/chat/" showSidebar />} /> */}
            </Route>
            <Route element={<MasterSettingsWrap />}>
              <Route
                path="wallet"
                element={
                  <Suspense fallback={FALLBACKS.settings}>
                    <ChoiceOfReplenishmentMethod />
                  </Suspense>
                }
              />
              <Route
                path="wallet_history"
                element={
                  <Suspense fallback={FALLBACKS.walletHistory}>
                    <WalletHistory />
                  </Suspense>
                }
              />
              <Route path="wallet/:id" element={<WalletConfirm />} />
              <Route path="settings" element={<SettingsAll />}>
                <Route
                  index
                  element={
                    <Suspense fallback={FALLBACKS.settings}>
                      <SettingsMaster />
                    </Suspense>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <Suspense fallback={FALLBACKS.settings}>
                      <Profile />
                    </Suspense>
                  }
                />
                <Route
                  path="services"
                  element={
                    <Suspense fallback={FALLBACKS.settings}>
                      <Services />
                    </Suspense>
                  }
                />
                <Route path="finance" element={<Finance />} />
                <Route path="balance" element={<Balance />} />
                <Route path="photo" element={<WalletFH />} />
              </Route>
              <Route path="orders">
                <Route
                  index
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <Applications />
                    </Suspense>
                  }
                />
                <Route
                  path="completed"
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <Applications />
                    </Suspense>
                  }
                />
                <Route
                  path="canceled"
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <Applications />
                    </Suspense>
                  }
                />
                <Route
                  path="all"
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <Applications />
                    </Suspense>
                  }
                />
              </Route>

              <Route path="feedback" element={<ProfileNumber />} />

              <Route path="requests">
                <Route
                  index
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <AllOrders />
                    </Suspense>
                  }
                />
                <Route path="offer/:id" element={<Offer />} />
                <Route
                  path="orders"
                  element={
                    <Suspense fallback={FALLBACKS.orders}>
                      <Orders />
                    </Suspense>
                  }
                />
                <Route path="personal" element={<PersonalRequests />} />
                {/* <Route path=":id" element={<MyOrders />} /> */}
              </Route>
              <Route
                path="offers/create/:id"
                element={
                  <Suspense fallback={FALLBACKS.orders}>
                    <OfferAService />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </main>
      {__location__.pathname.includes('/chat') || <Footer />}
    </>
}

export default App;
