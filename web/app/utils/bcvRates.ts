/**
 * Utilidades para cálculo y visualización de precios en Bolívares (Bs.)
 * actualizados a la tasa oficial del Banco Central de Venezuela (BCV).
 */

export const DEFAULT_BCV_RATE = 896.12;

/**
 * Formatea un monto en Bolívares al estilo venezolano (con separador de miles '.' y coma decimal ',')
 * Ejemplo: 34052.65 -> "Bs. 34.052,65"
 */
export function formatBs(amountUSD: number, bcvRate: number = DEFAULT_BCV_RATE): string {
  const totalBs = amountUSD * bcvRate;
  const parts = totalBs.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1];
  return `Bs. ${intPart},${decPart}`;
}

/**
 * Formatea un monto en USD y su equivalente exacto en Bolívares BCV
 * Ejemplo: formatDualPrice(38, 896.12) -> "$38.00 USD · Bs. 34.052,56"
 */
export function formatDualPrice(amountUSD: number, bcvRate: number = DEFAULT_BCV_RATE): string {
  return `$${amountUSD.toFixed(2)} USD · ${formatBs(amountUSD, bcvRate)}`;
}

/**
 * Obtiene la tasa del BCV en el cliente con persistencia local
 */
export async function getClientBcvRate(): Promise<{ rate: number; date: string; source: string }> {
  try {
    const res = await fetch('/api/bcv');
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined' && data.rate) {
        localStorage.setItem('bukea_bcv_rate', String(data.rate));
        localStorage.setItem('bukea_bcv_date', data.date || '');
      }
      return data;
    }
  } catch (err) {
    console.warn('Error fetching /api/bcv, using cached or fallback rate:', err);
  }

  let cachedRate = DEFAULT_BCV_RATE;
  let cachedDate = '';
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bukea_bcv_rate');
    if (saved && !isNaN(Number(saved))) {
      cachedRate = Number(saved);
      cachedDate = localStorage.getItem('bukea_bcv_date') || '';
    }
  }

  return {
    rate: cachedRate,
    date: cachedDate,
    source: 'BCV Oficial (Caché local)',
  };
}
