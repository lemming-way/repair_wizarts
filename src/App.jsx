import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import WalletHistoryClient from './components/ChoiceOfReplenishmentMethod/WalletHistoryClient';
import ClientSettingsWrap from './components/pages/ClientSettingsWrap';
import ContractorSettingsWrap from './components/pages/ContractorSettingsWrap';

import RegistrationContractorPage from './features/user/registration/RegistrationContractorPage';

// Order imports
import AllOrders from './components/Orders/Allorders';

import SettingsAll from './components/Settings/Settings-all';
import Profile from './components/Settings/Profile';
//~ import Services from './components/Settings/services';
import Reviews from './components/Reviews';

import Orders from './components/Orders/Orders';
import Offer from './components/Orders/Offer';

// after login
import ProfileFH from './components/full-height/ProfileFH';
import WalletFH from './components/full-height/WalletFH';

// after login end

import MapContractor from './components/Pick-contractor/contractors';
import ProfileNumber from './components/Chat/profileNumber';
import OfferAService from './components/Orders/OfferAService';
import AddDevices from './components/addDevices/AddDevices';
import AddedDevices from './components/addDevices/AddedDevices';
import TitleService from './components/addDevices/TitleService';
import Applications from './components/Applications/applications';
import LoginPage from './features/user/login/LoginPage';
import WalletConfirm from './components/ChoiceOfReplenishmentMethod/WalletConfirm';
import Finance from './components/Settings/Finance';
import Balance from './components/Settings/Balance';
import Article from './components/Article';
import { getLocation } from './services/location.service';
import { useUser, updateUserDetails } from './state/user';
import PersonalRequests from './components/Orders/PersonalRequests';
import Articles from './components/Article/Articles';
import ChoiceOfReplenishmentMethod from './components/ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethod';
import ChoiceOfReplenishmentMethodClient from './components/ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodClient';
import MyOrdersContractor from './components/Orders/MyOrdersContractor';
import WalletHistory from './components/ChoiceOfReplenishmentMethod/WalletHistory';
// import AddedDevicesPage from './components/Orders/AddedDevicesPage';
import FChatKirill from './components/full-chat/fakeChat/Kirill';
import Home from './components/Home';
import FinanceClient from './components/Settings/FinanceClient';
import SettingsContractor from './components/Settings/SettingsContractor';
import ContractorChatWrap from './components/pages/ContractorChatWrap';
import Mysuggest from './components/mysuggest';
import MyOrder from './components/Orders/MyOrder';
import ProfileFeedbackContractor from './components/profileNumberClient/ProfileFeedbackContractor';
import RegistrationPickPage from './features/user/registration/RegistrationPickPage';
import RegistrationUserPage from './features/user/registration/RegistrationUserPage';
import Remont from './components/remont';
import { ServiceDetail } from './components/Service';
import BalanceClient from './components/Settings/BalanceClient';
import Footer from './UI/Footer/FooterDesktop';
import Toolbar from './UI/Toolbar/Toolbar';
import { useServices } from './state/site-data';
import { setGlobal } from './state/global';
import { useNotifications } from './state/notifications/NotificationsContext';

import './scss/swiper.css';

function App() {
  const { user, status } = useUser();
  const location = useLocation();
  const { connect: connectNotifications } = useNotifications();
  const queryClient = useQueryClient();

  const { sections, isLoading: areServicesLoading } = useServices();

  // Add visibility change tracking
  useEffect(() => {
    if (!user.id) {
      return undefined;
    }

    const handleVisibilityChange = async () => {
      const isVisible = document.visibilityState === 'visible';

      await updateUserDetails(
        queryClient,
        {
          isOnline: isVisible,
          lastTimeBeenOnline: new Date().toISOString(),
        }
      );
    };

    // Add page unload tracking
    const handleBeforeUnload = async () => {
      await updateUserDetails(
        queryClient,
        {
          isOnline: false,
          lastTimeBeenOnline: new Date().toISOString(),
        }
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user.id, queryClient]);

  useEffect(() => {
    const mapLocation = getLocation();

    if (mapLocation) {
      setGlobal( 'map:location', mapLocation );
    }
  }, []);

  useEffect(() => {
    if (!user.id) {
      return;
    }

    if (status === 'success') {
      connectNotifications();
    }
  }, [connectNotifications, status, user.id]);

  if (Object.keys(sections).length === 0 && areServicesLoading) {
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
              path="categories/:id"
              element={<Remont />}
            />
            <Route
              path="services/:id"
              element={<ServiceDetail />}
            />
            <Route path="articles/:id" element={<Article />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="articles" element={<Articles />} />
            <Route path="contact" element={<MapContractor />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register">
              <Route index element={<RegistrationPickPage />} />
              <Route path="contractor" element={<RegistrationContractorPage />} />
              <Route path="client" element={<RegistrationUserPage />} />
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
              <Route path="my_orders" element={<MyOrdersContractor />} />
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
              element={<ProfileFeedbackContractor />}
            />
            {/* чат связан с бэком */}
            {/* <Route path="chat" element={<FChat />} /> */}
            {/* <Route path="chat/:id" element={<FChat />} /> */}
            {/* Чат без связи с бэком, только заготовка */}
            <Route path="chat" element={<FChatKirill />} />
            <Route path="chat/:id" element={<FChatKirill />} />

            {/* страница для оставления фидбека. Не знаю, что в ней, наверное её пересоздал выше */}
            {/* <Route path="feedback/:username" element={<ReviewsContractor />} /> */}
          </Route>

          <Route basename="contractor" path="contractor">
            {/* Чат без связи с бэком, только заготовка */}
            <Route element={<ContractorChatWrap />}>
              <Route path="chat" element={<FChatKirill />} />
              <Route path="chat/:id" element={<FChatKirill />} />
              {/* прежний чат, был связана с бэком */}
              {/* <Route path="chat/" element={<FChat baseRoute="/contractor/chat/" showSidebar />} />
                        <Route path="chat/:id" element={<FChat baseRoute="/contractor/chat/" showSidebar />} /> */}
            </Route>
            <Route element={<ContractorSettingsWrap />}>
              <Route
                path="wallet"
                element={<ChoiceOfReplenishmentMethod />}
              />
              <Route path="wallet_history" element={<WalletHistory />} />
              <Route path="wallet/:id" element={<WalletConfirm />} />
              <Route path="settings" element={<SettingsAll />}>
                <Route index element={<SettingsContractor />} />
                <Route path="profile" element={<Profile />} />
                <Route path="prices" element={null/*<Services />*/} />
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
