import React from 'react';

import styles from './ConfirmPolitics.module.scss';
import {useConfirmPolitics} from "./ConfirmPoliticsContext";
import SERVER_PATH from "../../constants/SERVER_PATH";
import { useLanguage } from '../../state/language';

const ConfirmPolitics = () => {
  const text = useLanguage();
  const { accept, setAccept } = useConfirmPolitics();

  return (
    <div className={styles.confirmPolitics}>
      {/*В старом коде className="rel"*/}
      <input
        type="checkbox"
        id="confirm"
        checked={accept}
        onChange={(e) => setAccept(e.target.checked)}
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

export default ConfirmPolitics;
