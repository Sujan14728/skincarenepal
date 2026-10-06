/** Minimal on-brand placeholder shown while a storefront page streams in. */
export default function PageLoading({ label }: { label: string }) {
  return (
    <div
      role='status'
      aria-live='polite'
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--cc-page)'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className='animate-spin'
          style={{
            width: 40,
            height: 40,
            margin: '0 auto 16px',
            borderRadius: '50%',
            border: '3px solid var(--cc-border)',
            borderTopColor: 'var(--cc-green)'
          }}
        />
        <p
          style={{
            color: 'var(--cc-secondary)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
