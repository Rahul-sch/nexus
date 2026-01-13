import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getUserId } from '@/lib/auth';
import { redactLog, serializeError } from '@/lib/logging';

export const runtime = 'nodejs';

// GET: Fetch single refinery + messages + artifacts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    // Verify ownership
    const { data: refinery, error: refineryError } = await supabase
      .from('refineries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (refineryError || !refinery) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('refinery_id', id)
      .order('created_at', { ascending: true });

    // Fetch artifacts
    const { data: artifacts } = await supabase
      .from('artifacts')
      .select('*')
      .eq('refinery_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      refinery,
      messages: messages || [],
      artifacts: artifacts || [],
    });

  } catch (error) {
    redactLog('error', 'Refinery GET [id] error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove refinery
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    // Verify ownership
    const { data: refinery, error: checkError } = await supabase
      .from('refineries')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !refinery) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Prevent deletion of running refineries
    if (refinery.status === 'running' || refinery.status === 'queued') {
      return NextResponse.json(
        { error: 'Cannot delete running refinery. Cancel it first.' },
        { status: 400 }
      );
    }

    // Delete (cascade will remove messages + artifacts)
    const { error } = await supabase
      .from('refineries')
      .delete()
      .eq('id', id);

    if (error) {
      redactLog('error', 'Refinery delete error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    redactLog('error', 'Refinery DELETE error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update refinery (title only for now)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Only allow title updates
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Verify ownership
    const { data: refinery, error: checkError } = await supabase
      .from('refineries')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !refinery) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('refineries')
      .update({ title: body.title.slice(0, 200) })
      .eq('id', id)
      .select('id, title, updated_at')
      .single();

    if (error) {
      redactLog('error', 'Refinery update error', { error: serializeError(error) });
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    redactLog('error', 'Refinery PATCH error', { error: serializeError(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
