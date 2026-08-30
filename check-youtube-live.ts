import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "content-type":"application/json" };

function youtubeIdentity(value: string) {
  try {
    const url = new URL(value);
    if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && /^UC[\w-]{20,}$/.test(parts[1] || "")) return { channelId:parts[1] };
    if ((parts[0] || "").startsWith("@")) return { handle:parts[0].slice(1) };
    if (parts[0] === "user" && parts[1]) return { username:parts[1] };
  } catch (_) {}
  return null;
}

async function resolveChannelId(apiKey: string, profileUrl: string) {
  const identity = youtubeIdentity(profileUrl);
  if (!identity) return null;
  if (identity.channelId) return identity.channelId;
  const query = identity.handle ? `forHandle=${encodeURIComponent(identity.handle)}` : `forUsername=${encodeURIComponent(identity.username || "")}`;
  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&${query}&key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) return null;
  const body = await response.json();
  return body.items?.[0]?.id || null;
}

async function findLiveVideo(apiKey: string, channelId: string) {
  const feedResponse = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
  if (!feedResponse.ok) return null;
  const feed = await feedResponse.text();
  const videoIds = [...feed.matchAll(/<yt:videoId>([A-Za-z0-9_-]{6,20})<\/yt:videoId>/g)]
    .map(match => match[1]).slice(0, 15);
  if (!videoIds.length) return null;
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${encodeURIComponent(videoIds.join(","))}&key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) return null;
  const body = await response.json();
  const live = (body.items || []).find((item: any) =>
    item.snippet?.liveBroadcastContent === "live" ||
    (item.liveStreamingDetails?.actualStartTime && !item.liveStreamingDetails?.actualEndTime)
  );
  return live?.id || null;
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const youtubeKey = Deno.env.get("YOUTUBE_API_KEY") || "";
  if (!supabaseUrl || !serviceKey || !youtubeKey) return new Response(JSON.stringify({ ok:false,error:"missing_secret" }),{ status:500,headers:cors });
  const sb = createClient(supabaseUrl, serviceKey, { auth:{ persistSession:false } });
  await sb.rpc("expire_manual_tiktok_lives");
  const { data:profiles, error } = await sb.from("profiles").select("id,social_youtube,youtube_channel_id,youtube_is_live").eq("is_creator",true).not("social_youtube","is",null);
  if (error) return new Response(JSON.stringify({ ok:false,error:error.message }),{ status:500,headers:cors });

  let checked = 0;
  for (const profile of profiles || []) {
    const channelId = profile.youtube_channel_id || await resolveChannelId(youtubeKey, profile.social_youtube);
    if (!channelId) continue;
    const videoId = await findLiveVideo(youtubeKey, channelId);
    await sb.from("profiles").update({
      youtube_channel_id:channelId,
      youtube_is_live:!!videoId,
      youtube_live_video_id:videoId,
      live_started_at:videoId && !profile.youtube_is_live ? new Date().toISOString() : undefined
    }).eq("id",profile.id);
    checked++;
  }
  return new Response(JSON.stringify({ ok:true,checked }),{ headers:cors });
});
