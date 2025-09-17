import React from 'react';
import {Link} from "react-router-dom";

interface Props {
  link: string;
  name: string;
  onClick?: () => void;
  className?: string;
  item?: boolean;
  openItem?: boolean;
}

const ListItemElectronic: React.FC<Props> = ({link, name, onClick, className, item, openItem}) => {
  return (
    <li onClick={onClick}>
      <Link className={className} to={link}>
        <img src="/img/microshema.png" alt="" /> {name}
        {item && <div style={{rotate: openItem ? "0deg": "-90deg"}}><img src="/img/header/icons/arrow-down-icon.svg" alt="" /></div>}
      </Link>
    </li>
  );
};

export default ListItemElectronic;