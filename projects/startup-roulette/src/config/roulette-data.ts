import data from './database.json';

export const PRODUCT_TYPES = data.productTypes;
export const AUDIENCES = data.audiences;
export const TWISTS = data.twists;
export const TECHNOLOGIES = data.technologies;
export const BUSINESS_MODELS = data.businessModels;
export const CONSTRAINTS = data.constraints;
export const CHAOS_MODIFIERS = data.chaosModifiers;

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export function getRandomByRarity(items: string[]): { item: string, rarity: Rarity } {
  const roll = Math.random();
  let tier: Rarity;
  let slice: string[];

  const commonCount = Math.floor(items.length * 0.8);
  const rareCount = Math.floor(items.length * 0.15);
  const epicCount = Math.floor(items.length * 0.04) || 1;
  
  if (roll < 0.80) {
    tier = 'Common';
    slice = items.slice(0, commonCount);
  } else if (roll < 0.95) {
    tier = 'Rare';
    slice = items.slice(commonCount, commonCount + rareCount);
  } else if (roll < 0.99) {
    tier = 'Epic';
    slice = items.slice(commonCount + rareCount, items.length - 1);
  } else {
    tier = 'Legendary';
    slice = items.slice(items.length - 1);
  }

  if (slice.length === 0) slice = items;

  const item = slice[Math.floor(Math.random() * slice.length)];
  return { item, rarity: tier };
}

export function getRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}
