import React from 'react';
import styles from './Error.module.scss';

interface Props {
  error: any;
}

const Error: React.FC<Props> = ({error}) => {
  return (
    <div className={styles.error}>
      {error}
    </div>
  );
};

export default Error;