export async function POST() {
  return Response.json(
    { error: "このAPIは廃止されました。チャットAPIを利用してください。" },
    { status: 410 },
  );
}
