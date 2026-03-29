import React from 'react';

import styles from './RegistrationPage.module.scss';
import SERVER_PATH from "config/SERVER_PATH";
import { useLanguage } from 'app/state/language';

export const ConfirmPolitics = ({ accept, onChange }) => {
  const text = useLanguage();

  return (
    <div className={styles.registrationPage_checkbox_container}>
      {/*В старом коде className="rel"*/}
      <input
        type="checkbox"
        id="confirm"
        checked={accept}
        onChange={(e) => onChange(e.target.checked)}
      />

      <label htmlFor="confirm">
        {text('I have read and agree to the terms of the')}
        <a
          style={{
            textDecoration: "underline",
            marginLeft: "5px",
            color: "#000"
          }}
          target="_blank"
          rel="noopener noreferrer"
          href={SERVER_PATH + "files/privacy-policy.pdf"}
        >
          {text('privacy_policy')}
        </a>
      </label>
    </div>
  );
};
