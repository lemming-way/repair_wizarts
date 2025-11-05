import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { removeToken } from '../services/token.service';
import '../scss/setout.css';
//~ import { setUserMode } from '../services/user.service';
import { useLanguage } from '../state/language';
import { userKeys } from '../queries';
import { useUserQuery } from '../hooks/useUserQuery';

function DropdownService() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useUserQuery();
  const text = useLanguage();

  //~ const switchMode = () => {
    //~ const isMaster = user.u_role === "2";
    //~ if (!isMaster) {
      //~ setUserMode(true);
      //~ return;
    //~ }
    //~ setUserMode(false);
  //~ };

  const logout = (e) => {
    queryClient.removeQueries({ queryKey: userKeys.all });
    removeToken();
    navigate('/');
  };

  return (
    <div className="bldropdownfff-content">
      <div className="fix_hover_drop"></div>
      {user.u_role === "2" ? (
        <div className="client__dropdown">
          <div className="recent">
            <Link
              to="/client/settings"
              onClick={/*switchMode*/null}
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
              onClick={/*switchMode*/null}
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
