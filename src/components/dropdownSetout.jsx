import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { removeToken } from '../services/token.service';
import { selectUI, setAuthorization, setMaster } from '../slices/ui.slice';
import '../scss/setout.css';
import { setUserMode } from '../services/user.service';
import { useLanguage } from '../state/language';
import { userKeys } from '../queries';

function DropdownService() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const ui = useSelector(selectUI);
  const text = useLanguage();

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
    dispatch(setAuthorization(false));
    queryClient.removeQueries({ queryKey: userKeys.all });
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
              <h4>{text("I am a client")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/master/wallet" className="repair__phone">
              <h4>{text("Personal account")}</h4>
            </Link>
          </div>
          <div className="recent ">
            <span
              className="repair__phonffe dropdown_menu_toolbar_fix"
              onClick={logout}
            >
              <img src="/img/logout.png" alt={text("Logout")} />
              <h4>{text("Logout")}</h4>
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
              <h4>{text("Become a master")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/client/settings" className="repair__phone">
              <h4>{text("Settings")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/client/requests" className="repair__phone">
              <h4>{text("My orders")}</h4>
            </Link>
          </div>
          <div className="recent">
            <Link to="/client/requests/my_orders#order" className="repair__phone">
              <h4>{text("All orders")}</h4>
            </Link>
          </div>
          <div className="recent ">
            <span
              className="repair__phonffe dropdown_menu_toolbar_fix"
              onClick={logout}
            >
              <img src="/img/logout.png" alt={text("Logout")} />
              <h4>{text("Logout")}</h4>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownService;
