# NexAI Sprint 1

実装内容:
- メール登録・ログイン・ログアウト
- AI作成
- 公開AI一覧
- AI詳細
- Geminiとの会話
- Supabase保存
- RLSアクセス制御

## 導入
1. `npm install @supabase/supabase-js @supabase/ssr`
2. `.env.local` に以下を設定
```env
NEXT_PUBLIC_SUPABASE_URL=SupabaseのProject URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SupabaseのPublishable key
GEMINI_API_KEY=Google AI StudioのAPIキー
```
3. SupabaseのSQL Editorで `supabase/schema.sql` を実行
4. ZIP内の `app`, `components`, `lib`, `proxy.ts` をプロジェクトへコピー
5. `npm run dev`
