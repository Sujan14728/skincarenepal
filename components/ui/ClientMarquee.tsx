export const revalidate = 0;
import MarqueeFeature from './marquee';
import { prisma } from '@/lib/prisma';

type MarqueeType = {
  id: number;
  text: string;
};

async function getMarquees(): Promise<MarqueeType[]> {
  try {
    // Fetch directly from database instead of making HTTP request
    const marquees = await prisma.marquee.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        text: true
      }
    });
    return marquees;
  } catch (error) {
    console.error('Failed to fetch marquees:', error);
    return [];
  }
}

export default async function ClientMarquee() {
  const marquees = await getMarquees();
  return <MarqueeFeature marquees={marquees} />;
}
