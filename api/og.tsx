import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nahual = searchParams.get('nahual') || null;
    const tono = searchParams.get('tono') || null;

    // Paleta de marca
    const bronze = '#a3732b';
    const cream = '#faf6f1';
    const dark = '#1c1917';
    const hasResult = Boolean(nahual && tono);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            background: hasResult
              ? `linear-gradient(135deg, ${dark} 0%, #2a2420 100%)`
              : `linear-gradient(135deg, ${cream} 0%, #f0ebe4 100%)`,
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
            fontFamily: 'serif',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '26px',
                letterSpacing: '8px',
                textTransform: 'uppercase',
                color: bronze,
                marginBottom: '28px',
              }}
            >
              Cholq'ij
            </div>

            {hasResult ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
                  <span style={{ fontSize: '150px', fontWeight: 700, color: bronze, lineHeight: 1 }}>
                    {tono}
                  </span>
                  <span style={{ fontSize: '120px', fontWeight: 700, color: cream, lineHeight: 1 }}>
                    {nahual}
                  </span>
                </div>
                <div style={{ fontSize: '34px', color: '#d8cdbb', marginTop: '32px' }}>
                  Tu Nahual Maya
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '108px', fontWeight: 700, color: bronze, lineHeight: 1.05 }}>
                  Descubre tu Nahual
                </div>
                <div style={{ fontSize: '38px', color: '#6b5d49', marginTop: '28px' }}>
                  Tu energía en el calendario sagrado maya
                </div>
              </>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '44px',
              fontSize: '26px',
              fontWeight: 600,
              color: hasResult ? bronze : '#6b5d49',
            }}
          >
            tunahual.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
        },
      }
    );
  } catch (error) {
    console.error('og-image error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
