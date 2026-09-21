import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or local storage configuration
const ENV_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const CONFIG_STORAGE_KEY = 'ziplind_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return { ...parsed, isCustom: true };
      }
    }
  } catch (e) {
    console.error('Failed to read stored Supabase config', e);
  }

  return {
    url: ENV_SUPABASE_URL || 'https://ziplind-shinmado.supabase.co',
    anonKey: ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-anon-key',
    isCustom: Boolean(ENV_SUPABASE_URL && ENV_SUPABASE_ANON_KEY),
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  try {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    // Reinitialize
    initSupabaseClient();
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let isConnectedToLiveSupabase = false;

export function initSupabaseClient(): SupabaseClient {
  const config = getStoredSupabaseConfig();
  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    isConnectedToLiveSupabase = Boolean(
      config.url &&
      !config.url.includes('dummy') &&
      config.anonKey &&
      !config.anonKey.includes('dummy')
    );

    return supabaseInstance;
  } catch (error) {
    console.warn('Supabase initialization warning:', error);
    // Fallback safe client
    supabaseInstance = createClient('https://fallback.supabase.co', 'fallback-key');
    return supabaseInstance;
  }
}

export const supabase = initSupabaseClient();

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
}

export interface SupabaseConnectionResult {
  connected: boolean;
  isConnected: boolean;
  success: boolean;
  message: string;
  latencyMs?: number;
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionResult> {
  const client = getSupabaseClient();
  const startTime = Date.now();
  try {
    const { data, error } = await client.from('technicians').select('count', { count: 'exact', head: true });
    if (error) {
      return {
        connected: false,
        isConnected: false,
        success: false,
        message: error.message || 'Gagal tersambung ke tabel Supabase.',
      };
    }
    const latency = Date.now() - startTime;
    isConnectedToLiveSupabase = true;
    return {
      connected: true,
      isConnected: true,
      success: true,
      message: `Tersambung ke Supabase Cloud (${latency}ms)`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      connected: false,
      isConnected: false,
      success: false,
      message: err?.message || 'Tidak dapat menghubungi endpoint Supabase. Berjalan dalam local fallback mode.',
    };
  }
}

export const testSupabaseConnection = checkSupabaseConnection;

/**
 * Upload an image or file to Supabase Storage bucket
 */
export async function uploadSupabaseDocument(
  file: File,
  bucketName = 'ziplind-documents'
): Promise<{ url: string; path: string; error?: string }> {
  const client = getSupabaseClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  try {
    const { data, error } = await client.storage.from(bucketName).upload(filePath, file);
    if (error) {
      console.warn('Supabase storage upload fallback:', error.message);
      // Generate object URL for immediate display
      return {
        url: URL.createObjectURL(file),
        path: filePath,
        error: error.message,
      };
    }

    const { data: publicData } = client.storage.from(bucketName).getPublicUrl(filePath);
    return {
      url: publicData.publicUrl,
      path: filePath,
    };
  } catch (e: any) {
    return {
      url: URL.createObjectURL(file),
      path: filePath,
      error: e?.message,
    };
  }
}
