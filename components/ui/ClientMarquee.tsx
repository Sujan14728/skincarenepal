import MarqueeFeature from './marquee';

type MarqueeType = {
  id: number;
  text: string;
};

async function getMarquees(): Promise<MarqueeType[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/marquee`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.marquees || [];
  } catch (error) {
    console.error('Failed to fetch marquees:', error);
    return [];
  }
}

export default async function ClientMarquee() {
  const marquees = await getMarquees();
  return <MarqueeFeature marquees={marquees} />;
}
