const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envFile, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function main() {
  const eventSlug = 'iqranurul-wedding';
  const eventId = '30b2edf8-aa12-43a1-b47c-11fbb607ed0a';

  console.log(`Checking entries for event: ${eventSlug} (${eventId})...`);

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .or(`event_slug.eq.${eventSlug},event_id.eq.${eventId}`);

  if (error) {
    console.error('Error fetching entries:', error);
    return;
  }

  console.log(`Found ${entries ? entries.length : 0} entries to delete:`);
  if (entries && entries.length > 0) {
    entries.forEach(e => {
      console.log(`- [${e.id}] Guest: "${e.guest_name}", CreatedAt: ${e.created_at}`);
      console.log(`  Photo: ${e.photo_url}`);
      if (e.voice_note_url) console.log(`  Voice: ${e.voice_note_url}`);
    });

    // Delete files from Supabase Storage bucket 'ruangtemu-media'
    const filesToDelete = [];
    for (const e of entries) {
      if (e.photo_url && e.photo_url.includes('/ruangtemu-media/')) {
        const parts = e.photo_url.split('/ruangtemu-media/');
        if (parts[1]) filesToDelete.push(parts[1]);
      }
      if (e.voice_note_url && e.voice_note_url.includes('/ruangtemu-media/')) {
        const parts = e.voice_note_url.split('/ruangtemu-media/');
        if (parts[1]) filesToDelete.push(parts[1]);
      }
    }

    if (filesToDelete.length > 0) {
      console.log('Removing storage files:', filesToDelete);
      const { data: rmData, error: rmErr } = await supabase.storage
        .from('ruangtemu-media')
        .remove(filesToDelete);
      if (rmErr) {
        console.warn('Storage removal warning:', rmErr.message);
      } else {
        console.log('Storage files deleted successfully.');
      }
    }

    // Delete entries from database table
    const ids = entries.map(e => e.id);
    const { error: delErr } = await supabase
      .from('entries')
      .delete()
      .in('id', ids);

    if (delErr) {
      console.error('DB delete error:', delErr.message);
    } else {
      console.log(`Successfully deleted ${ids.length} records from 'entries' table.`);
    }
  } else {
    console.log('No entries found for this event.');
  }

  // Also verify entries table count now
  const { data: remaining } = await supabase
    .from('entries')
    .select('id, guest_name')
    .or(`event_slug.eq.${eventSlug},event_id.eq.${eventId}`);
  console.log('Remaining entries for Nurul & Iqra:', remaining ? remaining.length : 0);
}

main().catch(console.error);
