import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { removeToken } from '../services/token.service';
import { selectUser, wipeUser } from '../slices/user.slice';
import { selectUI, setAuthorization, setMaster } from '../slices/ui.slice';
import '../scss/setout.css';
import { setUserMode } from '../services/user.service';
import { useLanguage } from '../context/LanguageContext'; // путь поправьте под свой

function DropdownService() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ui = useSelector(selectUI);
  const { t } = useLanguage();

  const switchMode = () => {
    console.log(ui);
    if (!ui.isMaster) {
      setUserMode(!ui.isMaster);
      dispatch(setMaster(!ui.isMaster));
      return;
    }
    setUserMode(false);
    dispatch(setMaster(false));
  };

  const logout = (e) => {
    dispatch(wipeUser());
    dispatch(setAuthorization(false));
    removeToken();
    navigate('/');
  };

  return (
    <div className="bldropdownfff-content">
      <div className="fix_hover_drop"></div>
      {ui.isMaster ? (
        <div className="client__dropdown">
          <div className="recent">
            <Link
              to="/client/settings"
              onClick={switchMode}
              className="repair__phone"
            >
              <h4>{t("I am a client")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/master/wallet" className="repair__phone">
              <h4>{t("Personal account")}</h4>
            </Link>
          </div>
          <div className="recent ">
            <span
              className="repair__phonffe dropdown_menu_toolbar_fix"
              onClick={logout}
            >
              <img src="/img/logout.png" alt={t("Logout")} />
              <h4>{t("Logout")}</h4>
            </span>
          </div>
        </div>
      ) : (
        <div className="master__dropdown">
          <div className="recent">
            <Link
              to="/master/wallet"
              onClick={switchMode}
              className="repair__phone"
            >
              <h4>{t("Become a master")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/client/settings" className="repair__phone">
              <h4>{t("Settings")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/client/requests" className="repair__phone">
              <h4>{t("My orders")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/client/requests/my_orders#order" className="repair__phone">
              <h4>{t("All orders")}</h4>
            </Link>
          </div>
          <div className="recent ">
            <span
              className="repair__phonffe dropdown_menu_toolbar_fix"
              onClick={logout}
            >
              <img src="/img/logout.png" alt={t("Logout")} />
              <h4>{t("Logout")}</h4>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownService;
