import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import '../scss/setout.css';
import { useLanguage } from '../state/language';
import { useUser, logout, UserRole } from '../state/user';

function DropdownService() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useUser();
  const text = useLanguage();

  //~ const switchMode = () => {
    //~ const isContractor = user.role === UserRole.Contractor;
    //~ if (!isContractor) {
      //~ setUserMode(true);
      //~ return;
    //~ }
    //~ setUserMode(false);
  //~ };

  const handleLogout = (e) => {
    e.preventDefault(); // Предотвращаем дефолтное поведение ссылки
    logout(queryClient); // Используем функцию logout из state/user.ts
    navigate('/');
  };

  return (
    <div className="bldropdownfff-content">
      <div className="fix_hover_drop"></div>
      {user.role === UserRole.Contractor ? (
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
            <Link to="/contractor/wallet" className="repair__phone">
              <h4>{text("Personal account")}</h4>
            </Link>
          </div>
          <div className="recent ">
            <span
              className="repair__phonffe dropdown_menu_toolbar_fix"
              onClick={handleLogout}
            >
              <img src="/img/logout.png" alt={text("Logout")} />
              <h4>{text("Logout")}</h4>
            </span>
          </div>
        </div>
      ) : (
        <div className="contractor__dropdown">
          <div className="recent">
            <Link
              to="/contractor/wallet"
              onClick={/*switchMode*/null}
              className="repair__phone"
            >
              <h4>{text("Become a contractor")}</h4>
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
              onClick={handleLogout}
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
