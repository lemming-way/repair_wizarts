import { useEffect } from 'react';

import '../scss/swiper.css';
import { Routes, Route, useLocation } from 'react-router-dom';

import WalletHistoryClient from './ChoiceOfReplenishmentMethod/WalletHistoryClient';
import ClientSettingsWrap from './pages/ClientSettingsWrap';
import MasterSettingsWrap from './pages/MasterSettingsWrap';

import RegistrationMasterPage from '../features/RegistrationPage/RegistrationMasterPage/RegistrationMasterPage';

// Order imports
import AllOrders from './Orders/Allorders';

import SettingsAll from './Settings/Settings-all';
import Profile from './Settings/Profile';
import Services from './Settings/services';
import Reviews from './Reviews';

import Orders from './Orders/Orders';
import Offer from './Orders/Offer';

// after login
import ProfileFH from './full-height/ProfileFH';
import WalletFH from './full-height/WalletFH';

// after login end

import MapMaster from './Pick-master/masters';
import ProfileNumber from './Chat/profileNumber';
import OfferAService from './Orders/OfferAService';
import AddDevices from './addDevices/AddDevices';
import AddedDevices from './addDevices/AddedDevices';
import TitleService from './addDevices/TitleService';
import Applications from './Applications/applications';
import AuthLogin from './Registration/AuthLogin';
import WalletConfirm from './ChoiceOfReplenishmentMethod/WalletConfirm';
import Finance from './Settings/Finance';
import Balance from './Settings/Balance';
import Article from './Article';
import { getLocation } from '../services/location.service';
import { getToken } from '../services/token.service';
import { updateUser } from '../services/user.service';
import { useUserQuery } from '../hooks/useUserQuery';
import PersonalRequests from './Orders/PersonalRequests';
import Articles from './Article/Articles';
import ChoiceOfReplenishmentMethod from './ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethod';
import ChoiceOfReplenishmentMethodClient from './ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodClient';
import MyOrdersMaster from './Orders/MyOrdersMaster';
import WalletHistory from './ChoiceOfReplenishmentMethod/WalletHistory';
// import AddedDevicesPage from './Orders/AddedDevicesPage';
import FChatKirill from './full-chat/fakeChat/Kirill';
import Home from './Home';
import FinanceClient from './Settings/FinanceClient';
import SettingsMaster from './Settings/SettingsMaster';
import MasterChatWrap from './pages/MasterChatWrap';
import Mysuggest from './mysuggest';
import MyOrder from './Orders/MyOrder';
import ProfileFeedbackMaster from './profileNumberClient/ProfileFeedbackMaster';
import PickLog from './Registration/pick-log';
import Register from './Registration/register';
import Remont from './remont';
import { ServiceDetail } from './Service';
import BalanceClient from './Settings/BalanceClient';
import Footer from '../UI/Footer/FooterDesktop';
import Toolbar from '../UI/Toolbar/Toolbar';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';
import { useServicesQuery } from '../hooks/useServicesQuery';
import { setGlobal } from '../state/global';
import { useNotifications } from '../state/notifications/NotificationsContext';
import { QueryDevtools } from '../app/providers/QueryDevtools';

const isDevelopment = process.env.NODE_ENV === 'development';  // todo: Перенести в /index

function App() {
  const { user, status } = useUserQuery();
  const location = useLocation();
  const { connect: connectNotifications } = useNotifications();

  const { categories, isLoading: areCategoriesLoading } = useCategoriesQuery();
  useServicesQuery();

  // Add visibility change tracking
  useEffect(() => {
    if (!user.u_id) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';

      updateUser(
        {
          details: {
            isOnline: isVisible,
            lastTimeBeenOnline: new Date().toISOString(),
          },
        },
        user.u_id,
      );
    };

    // Add page unload tracking
    const handleBeforeUnload = () => {
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
  }, [user.u_id]);

  useEffect(() => {
    const mapLocation = getLocation();

    if (mapLocation) {
      setGlobal( 'map:location', mapLocation );
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    if (status === 'success') {
      connectNotifications();
    }
  }, [connectNotifications, status]);

  if (!categories.length && areCategoriesLoading) {
    return 'Loading...';
  }

  return (
    <>
      {/* <Notifications /> */}
      <Toolbar />
      {isDevelopment ? <QueryDevtools /> : null}
      <main>
        <Routes>
          <Route>
            <Route index element={<Home />} />
            <Route
              path="devices/:sectionId/:subsectionId"
              element={<Remont />}
            />
            <Route
              path="services/:sectionId/:subsectionId/:serviceId"
              element={<ServiceDetail />}
            />
            <Route path="articles/:id" element={<Article />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="articles" element={<Articles />} />
            <Route path="contact" element={<MapMaster />} />
            <Route path="login" element={<AuthLogin />} />
            <Route path="register">
              <Route index element={<PickLog />} />
              <Route path="master" element={<RegistrationMasterPage />} />
              <Route path="client" element={<Register />} />
            </Route>
          </Route>
          <Route path="client">
            <Route path="settings" element={<ClientSettingsWrap />}>
              <Route index element={<ProfileFH />} />
              <Route path="picture" element={<WalletFH />} />
              <Route
                path="wallet"
                element={<ChoiceOfReplenishmentMethodClient />}
              />
              <Route
                path="wallet_history"
                element={<WalletHistoryClient />}
              />
              <Route path="finance" element={<FinanceClient />} />
              <Route path="balance" element={<BalanceClient />} />
            </Route>

            <Route path="requests">
              <Route index element={<AddedDevices />} />
              {/* <Route path="archived" element={<Archive />} /> */}
              <Route path="my_orders" element={<MyOrdersMaster />} />
              <Route path="my_order/:id" element={<MyOrder />} />
              <Route path="create">
                <Route path="title" element={<TitleService />} />
                <Route path="data" element={<AddDevices />} />
              </Route>
            </Route>
            <Route path="offers/:id" element={<Mysuggest />} />
            {/* клиент на странице мастера может оставить отзыв */}
            <Route
              path="feedback/:id"
              element={<ProfileFeedbackMaster />}
            />
            {/* чат связан с бэком */}
            {/* <Route path="chat" element={<FChat />} /> */}
            {/* <Route path="chat/:id" element={<FChat />} /> */}
            {/* Чат без связи с бэком, только заготовка */}
            <Route path="chat" element={<FChatKirill />} />
            <Route path="chat/:id" element={<FChatKirill />} />

            {/* страница для оставления фидбека. Не знаю, что в ней, наверное её пересоздал выше */}
            {/* <Route path="feedback/:username" element={<ReviewsMaster />} /> */}
          </Route>

          <Route basename="master" path="master">
            {/* Чат без связи с бэком, только заготовка */}
            <Route element={<MasterChatWrap />}>
              <Route path="chat" element={<FChatKirill />} />
              <Route path="chat/:id" element={<FChatKirill />} />
              {/* прежний чат, был связана с бэком */}
              {/* <Route path="chat/" element={<FChat baseRoute="/master/chat/" showSidebar />} />
                        <Route path="chat/:id" element={<FChat baseRoute="/master/chat/" showSidebar />} /> */}
            </Route>
            <Route element={<MasterSettingsWrap />}>
              <Route
                path="wallet"
                element={<ChoiceOfReplenishmentMethod />}
              />
              <Route path="wallet_history" element={<WalletHistory />} />
              <Route path="wallet/:id" element={<WalletConfirm />} />
              <Route path="settings" element={<SettingsAll />}>
                <Route index element={<SettingsMaster />} />
                <Route path="profile" element={<Profile />} />
                <Route path="services" element={<Services />} />
                <Route path="finance" element={<Finance />} />
                <Route path="balance" element={<Balance />} />
                <Route path="photo" element={<WalletFH />} />
              </Route>
              <Route path="orders">
                <Route index element={<Applications />} />
                <Route path="completed" element={<Applications />} />
                <Route path="canceled" element={<Applications />} />
                <Route path="all" element={<Applications />} />
              </Route>

              <Route path="feedback" element={<ProfileNumber />} />

              <Route path="requests">
                <Route index element={<AllOrders />} />
                <Route path="offer/:id" element={<Offer />} />
                <Route path="orders" element={<Orders />} />
                <Route path="personal" element={<PersonalRequests />} />
                {/* <Route path=":id" element={<MyOrders />} /> */}
              </Route>
              <Route path="offers/create/:id" element={<OfferAService />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {location.pathname.includes('/chat') || <Footer />}
    </>
  );
}

export default App;
