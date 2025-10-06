import '../../scss/register.css';

const skeletonLine = (width = '100%', height = 44) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function RegistrationFormSkeleton() {
  return (
    <section className="register">
      <h1>{skeletonLine('220px', 28)}</h1>
      <form>
        {skeletonLine('100%')}
        {skeletonLine('100%')}
        {skeletonLine('100%')}
        {skeletonLine('100%')}
        {skeletonLine('100%')}
        <div className="rel" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#eee', height: 18, width: 18, borderRadius: 4 }} />
          {skeletonLine('280px', 16)}
        </div>
        {skeletonLine('160px', 40)}
      </form>
    </section>
  );
}
