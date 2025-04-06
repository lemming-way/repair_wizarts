import { useEffect, useState } from 'react';
import Header from './Header';
import { fetchUser, selectUserStatus } from '../slices/user.slice';
import '../scss/swiper.css';
import Footer from '../UI/Footer/FooterDesktop';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation, matchPath } from 'react-router-dom';

import Home from './Home';
import PickLog from './Registration/pick-log';
import Register from './Registration/register';
import Remont from './remont';
import { ServiceDetail } from './Service';
import ChoiceOfReplenishmentMethod from './ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethod';
import Applications from './Applications/applications';
import Toolbar from '../UI/Toolbar/Toolbar';
import ChoiceOfReplenishmentMethodClient from './ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodClient';
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
import AuthLogin from './Registration/AuthLogin';
import Mysuggest from './mysuggest';
import ClientRoute from './ClientRoute';
import MasterRoute from './MasterRoute';
import Notifications from './Notifications/Notifications';
import WalletConfirm from './ChoiceOfReplenishmentMethod/WalletConfirm';
import Finance from './Settings/Finance';
import Balance from './Settings/Balance';
import Photo from './Settings/Photo';
import Article from './Article';
import FetchStatus from '../constants/FetchStatus';
import { fetchMessages } from '../slices/messages.slice';
import { fetchServices } from '../slices/services.slice';
import {
  setAuthorization,
  setLoading,
  setLocation,
  setMaster,
} from '../slices/ui.slice';
import { getLocation } from '../services/location.service';
import { getToken } from '../services/token.service';
import { getUserMode } from '../services/user.service';
import PersonalRequests from './Orders/PersonalRequests';
import Articles from './Article/Articles';
import MyOrdersMaster from './Orders/MyOrdersMaster';

import MyOrder from './Orders/MyOrder';
import WalletHistory from './ChoiceOfReplenishmentMethod/WalletHistory';
// import AddedDevicesPage from './Orders/AddedDevicesPage';
import ProfileFeedbackMaster from './profileNumberClient/ProfileFeedbackMaster';

import FChatKirill from './full-chat/fakeChat/Kirill';
import FinanceClient from './Settings/FinanceClient';
import BalanceClient from './Settings/BalanceClient';
import SettingsMaster from './Settings/SettingsMaster';
import MasterChatWrap from './pages/MasterChatWrap';
import HomeV2 from './home_v2/HomeV2';

function App() {
  const __location__ = useLocation();
  const dispatch = useDispatch();

  const userStatus = useSelector(selectUserStatus);
  const [currentHome, setCurrentHome] = useState('electron');

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
    const currentVersion = new URLSearchParams(window.location.search).get(
      'main',
    );
    setCurrentHome(currentVersion || 'electron');
  }, []);
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

  // FIXME: such a moron made this
  // setTimeout(() => {
  //   if (matchPath('/services/:id', __location__.pathname)) {
  //     let hg = document.querySelector('.hhun');
  //     hg?.classList.add('nhh');
  //   }
  // }, 1000);

  return (
    <>
      {currentHome === 'new' ? (
        <HomeV2 />
      ) : (
        <>
          {/* <Notifications /> */}
          <Toolbar />
          <main>
            <Routes>
              <Route>
                <Route index element={<Home />} />
                <Route path="devices/:id" element={<Remont />} />
                <Route path="services/:id" element={<ServiceDetail />} />
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
              <Route
                path="client/settings/wallet_history"
                element={<WalletHistoryClient />}
              />
              <Route path="client" element={<ClientRoute />}>
                <Route path="settings" element={<ClientSettingsWrap />}>
                  <Route index element={<ProfileFH />} />
                  <Route path="picture" element={<WalletFH />} />
                  <Route
                    path="wallet"
                    element={<ChoiceOfReplenishmentMethodClient />}
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

              <Route basename="master" path="master" element={<MasterRoute />}>
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
                    <Route path="photo" element={<Photo />} />
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
                    <Route path="offer" element={<Offer />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="personal" element={<PersonalRequests />} />
                    {/* <Route path=":id" element={<MyOrders />} /> */}
                  </Route>
                  <Route path="offers/create/:id" element={<OfferAService />} />
                </Route>
              </Route>
            </Routes>
          </main>
          {__location__.pathname.includes('/chat') || <Footer />}
        </>
      )}
    </>
  );
}

export default App;
