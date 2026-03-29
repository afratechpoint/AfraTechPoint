import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
export const productsFile = path.join(dataDir, 'products.json');
export const ordersFile = path.join(dataDir, 'orders.json');
export const settingsFile = path.join(dataDir, 'settings.json');
export const profilesFile = path.join(dataDir, 'profiles.json');

export async function readData(filePath: string, defaultVal: any = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultVal;
  }
}

export async function writeData(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
