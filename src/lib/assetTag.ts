import connectToDatabase from './mongodb';
import Device from '@/models/Device';

export async function generateAssetTag(): Promise<string> {
  await connectToDatabase();
  const year = new Date().getFullYear();
  const prefix = `AST-${year}`;

  // Find the highest asset tag number for this year
  const latestDevice = await Device.findOne(
    { assetTag: { $regex: `^${prefix}` } },
    { assetTag: 1 }
  ).sort({ assetTag: -1 });

  let nextNum = 1;
  if (latestDevice?.assetTag) {
    const match = latestDevice.assetTag.match(/-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${String(nextNum).padStart(5, '0')}`;
}

