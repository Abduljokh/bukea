import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache 1 hora

const FALLBACK_BCV_RATE = 896.12;

export async function GET() {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`BCV API returned status ${res.status}`);
    }

    const data = await res.json();
    const rate = Number(data.promedio || data.venta || FALLBACK_BCV_RATE);
    const date = data.fechaActualizacion || new Date().toISOString();

    return NextResponse.json({
      rate: Number(rate.toFixed(2)),
      rawRate: rate,
      date,
      source: 'Banco Central de Venezuela (BCV Oficial)',
      status: 'success',
    });
  } catch (error) {
    console.warn('Using fallback BCV rate due to fetch error:', error);
    return NextResponse.json({
      rate: FALLBACK_BCV_RATE,
      rawRate: FALLBACK_BCV_RATE,
      date: new Date().toISOString(),
      source: 'BCV Oficial (Caché local seguro)',
      status: 'fallback',
    });
  }
}
