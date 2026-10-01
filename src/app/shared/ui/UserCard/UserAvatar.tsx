import { MouseEventHandler, CSSProperties } from 'react';

import { useLanguage } from 'app/state/language';
import { UserProfile } from 'app/state/user';
import classes from './UserCard.module.css';

type UserAvatarProps = {
  user?: UserProfile;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function UserAvatar({ user, className, style, onClick }: UserAvatarProps) {
  const text = useLanguage();
  const _className = className ? `${classes.avatar_wrap} ${className}` : classes.avatar_wrap;
  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      return onClick(e);
    }
  };

  return (
    <div
      className={_className}
      style={style}
      onClick={handleClick}
    >
      <img src={user?.avatar || "/img/user_avatar.png"} alt={user?.fullname || text('Unknown user')} className={classes.avatar_img} />
      {user?.isOnline &&
        <div className={classes.avatar_dotted}><div className={classes.avatar_dotted_inner} /></div>
      }
    </div>
  );
}
