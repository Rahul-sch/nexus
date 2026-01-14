const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
async function broadcastViaRest(refineryId, event) {
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
    }
    catch (error) {
        console.error('Broadcast error:', error);
    }
}
export async function broadcastPhaseStart(refineryId, phase, model) {
    await broadcastViaRest(refineryId, {
        type: 'phase_start',
        payload: { phase, model, timestamp: Date.now() }
    });
}
export async function broadcastPhaseComplete(refineryId, phase, data) {
    await broadcastViaRest(refineryId, {
        type: 'phase_complete',
        payload: { phase, ...data, timestamp: Date.now() }
    });
}
export async function broadcastError(refineryId, error) {
    await broadcastViaRest(refineryId, {
        type: 'error',
        payload: { ...error, timestamp: Date.now() }
    });
}
export async function broadcastComplete(refineryId, data) {
    await broadcastViaRest(refineryId, {
        type: 'complete',
        payload: { ...data, timestamp: Date.now() }
    });
}
//# sourceMappingURL=broadcast.js.map