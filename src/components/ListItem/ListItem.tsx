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

const ListItem: React.FC<Props> = ({link, name, onClick, className, item, openItem}) => {
  return (
    <li onClick={onClick}>
      <Link className={className} to={link}>
        {name}
        {item && <div style={{rotate: openItem ? "0deg": "-90deg"}}><img src="/img/header/icons/arrow-down-icon.svg" alt="" /></div>}
      </Link>
    </li>
  );
};

export default ListItem;