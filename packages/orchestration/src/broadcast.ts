const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

interface BroadcastPayload {
  type: 'phase_start' | 'phase_complete' | 'error' | 'complete';
  payload: Record<string, unknown>;
}

async function broadcastViaRest(refineryId: string, event: BroadcastPayload): Promise<void> {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase credentials not configured, skipping broadcast');
    return;
  }

  const topic = `private:refinery:${refineryId}`;

  try {
    const response = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        messages: [{
          topic,
          event: event.type,
          payload: event.payload
        }]
      })
    });

    if (!response.ok) {
      console.error('Broadcast failed:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Broadcast error:', error);
  }
}

export async function broadcastPhaseStart(
  refineryId: string,
  phase: string,
  model: string
): Promise<void> {
  await broadcastViaRest(refineryId, {
    type: 'phase_start',
    payload: { phase, model, timestamp: Date.now() }
  });
}

export async function broadcastPhaseComplete(
  refineryId: string,
  phase: string,
  data: { latencyMs: number; tokensUsed: number; output: unknown }
): Promise<void> {
  await broadcastViaRest(refineryId, {
    type: 'phase_complete',
    payload: { phase, ...data, timestamp: Date.now() }
  });
}

export async function broadcastError(
  refineryId: string,
  error: { message: string; code: string }
): Promise<void> {
  await broadcastViaRest(refineryId, {
    type: 'error',
    payload: { ...error, timestamp: Date.now() }
  });
}

export async function broadcastComplete(
  refineryId: string,
  data: { finalPrompt: string; totalTokens: number }
): Promise<void> {
  await broadcastViaRest(refineryId, {
    type: 'complete',
    payload: { ...data, timestamp: Date.now() }
  });
}
