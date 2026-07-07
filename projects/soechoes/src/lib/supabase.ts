import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = 'love' | 'funny' | 'regret' | 'sidequest' | 'latenight' | 'milestone' | 'forsomeone';

export interface Memory {
  id: string;
  text: string;
  category: Category;
  lat: number;
  lng: number;
  is_spot: boolean;
  felt_count: number;
  location_name: string;
  created_at: string;
}

export const CATEGORIES: Record<Category, { label: string; emoji: string; color: string }> = {
  love: { label: 'Love', emoji: '❤️', color: '#c97b7b' },
  funny: { label: 'Funny', emoji: '😂', color: '#c9a84c' },
  regret: { label: 'Regret', emoji: '😔', color: '#7b92b5' },
  sidequest: { label: 'Sidequest', emoji: '🗺️', color: '#7da888' },
  latenight: { label: 'Late-Night', emoji: '🌙', color: '#8b80b5' },
  milestone: { label: 'Milestone', emoji: '🎓', color: '#d4956a' },
  forsomeone: { label: 'For Someone', emoji: '🕯️', color: '#c4845a' },
};

export async function getMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
  return data as Memory[];
}

export async function getRandomMemory() {
  // Using a simple random offset for now
  const { count } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true });
    
  if (!count) return null;
  
  const randomOffset = Math.floor(Math.random() * count);
  const { data } = await supabase
    .from('memories')
    .select('*')
    .range(randomOffset, randomOffset)
    .single();
    
  return data as Memory;
}

export async function incrementFeltCount(memoryId: string) {
  // The RPC function increment_felt_count needs to be created in Supabase
  // create function increment_felt_count(memory_id uuid) returns void as $$ update memories set felt_count = felt_count + 1 where id = memory_id; $$ language sql security definer;
  const { error } = await supabase.rpc('increment_felt_count', { memory_id: memoryId });
  if (error) console.error('Error incrementing felt count', error);
}

export async function createMemory(memory: Omit<Memory, 'id' | 'created_at' | 'felt_count'>) {
  const { data, error } = await supabase
    .from('memories')
    .insert([memory])
    .select()
    .single();

  if (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
  
  return data as Memory;
}
