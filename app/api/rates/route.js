import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEFAULT_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF'];

export async function GET() {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    const { data: watchlist } = await supabase.from('watchlist').select('symbol');
    const symbols = watchlist?.length
      ? watchlist.map((w) => w.symbol)
      : DEFAULT_PAIRS;

    const symbolParam = symbols.join(',');
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(
      symbolParam
    )}&apikey=${apiKey}`;

    const res = await fetch(url, { cache: 'no-store' });
    const raw = await res.json();

    const results = symbols.length === 1 ? { [symbols[0]]: raw } : raw;

    const rows = symbols
      .map((symbol) => {
        const entry = results[symbol];
        const price = entry && entry.price ? parseFloat(entry.price) : null;
        return price !== null ? { symbol, price } : null;
      })
      .filter(Boolean);

    if (rows.length) {
      await supabase.from('price_history').insert(
        rows.map((r) => ({ symbol: r.symbol, price: r.price }))
      );
    }

    return Response.json({ rates: rows, updatedAt: new Date().toISOString() });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
