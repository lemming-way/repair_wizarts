import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import style from './Client.module.css';
import ClientTabs from './ClientTabs';
import { useLanguage } from 'app/state/language';


const listLinks = [
  '/client/settings',
  '/client/settings/wallet',
  '/client/settings/finance',
  '/client/settings/balance',
];

function ClientSettingsNavigator() {
  const text = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = text('Settings');
  }, [text]);

  const [numberElementMenu, setNumberElementMenu] = useState(1);
  const [offsetMenu, setOffsetMenu] = useState(1);

  function NavigateLeft() {
    var n = numberElementMenu;
    if (n - 1 < 0) {
      return;
    }
    const newNumber = n - 1;
    setNumberElementMenu(newNumber);
    navigate(listLinks[newNumber]);
  }
  function NavigateRight() {
    var n = numberElementMenu;
    if (n + 1 > listLinks.length - 1) {
      return;
    }
    const newNumber = n + 1;
    setNumberElementMenu(newNumber);
    navigate(listLinks[newNumber]);
  }

  useEffect(() => {
    const n = listLinks.indexOf(window.location.pathname);
    setNumberElementMenu(n);

    if (window.innerWidth > 700) {
      setOffsetMenu(0);
    } else if (n > 3) {
      setOffsetMenu(3);
    } else {
      setOffsetMenu(n);
    }
  }, []);

  return (
    <div className={style.main_block}>
      <div className={style.block_settings_client}>
        <div className={style.block_heading}>
          <div>
            <h1>{text('Settings')}</h1>
          </div>
          <div className={style.arrows_block}>
            <img
              src="/img/img-right.png"
              style={{
                rotate: '180deg',
                opacity: numberElementMenu === 0 ? 0.5 : 1,
              }}
              alt=""
              onClick={NavigateLeft}
            />
            <img
              src="/img/img-right.png"
              style={{
                opacity: numberElementMenu === listLinks.length - 1 ? 0.5 : 1,
              }}
              alt=""
              onClick={NavigateRight}
            />
          </div>
        </div>

        <ClientTabs
          numberElementMenu={numberElementMenu}
          offsetMenu={offsetMenu}
        />

        <Outlet />
      </div>
    </div>
  );
}

export default ClientSettingsNavigator;
