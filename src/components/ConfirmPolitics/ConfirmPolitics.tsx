import React from 'react';

import styles from './ConfirmPolitics.module.scss';
import {useConfirmPolitics} from "./ConfirmPoliticsContext";
import SERVER_PATH from "../../constants/SERVER_PATH";

const ConfirmPolitics = () => {
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
        Ознакомлен и согласен с условиями
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
          Политики конфиденциальности
        </a>
      </label>
    </div>
  );
};

export default ConfirmPolitics;