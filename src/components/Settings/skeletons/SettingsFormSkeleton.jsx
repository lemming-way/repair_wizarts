import style from '../SettingsMaster.module.css';

const skeletonLine = (width = '100%', height = 40) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function SettingsFormSkeleton() {
  return (
    <div className={`mini-main df ${style.form_wrap_flex}`}>
      <form className={`input-wrap ${style.form}`}>
        {skeletonLine('60%', 24)}
        {skeletonLine('100%')}
        {skeletonLine('100%')}
        {skeletonLine('48%')}
        {skeletonLine('48%')}
        {skeletonLine('100%')}
        {skeletonLine('100%')}
        <div className={style.buttons_row} style={{ gap: 12 }}>
          {skeletonLine('200px', 40)}
          {skeletonLine('180px', 40)}
        </div>
      </form>

      <div className={`photo-wrap ${style.photo_wrap}`}>
        <div style={{ width: 180, height: 180, borderRadius: 90, background: '#eee' }} />
        <div className="links" style={{ marginTop: 12 }}>
          {skeletonLine('120px', 32)}
        </div>
      </div>
    </div>
  );
}
