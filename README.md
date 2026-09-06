# NexAI Platform

専門AIを作成・公開し、他のユーザーが会話できるプラットフォームです。

## 主な機能

- メール認証・ログイン
- 専門AIの作成、公開、編集、削除
- 公開AIの検索、カテゴリ絞り込み
- Geminiによるストリーミングチャット
- 会話履歴の保存、再開、削除
- ログインユーザー単位の日次利用上限
- Supabase RLSによる所有者ベースのアクセス制御

## ローカル起動

1. `.env.example` を参考に `.env.local` を作成します。
2. Supabase SQL Editorで `supabase/schema.sql` を実行します。
3. `npm install` を実行します。
4. `npm run dev` を実行します。

既存のSupabase環境を更新する場合は、`supabase/production-hardening.sql` を一度実行してください。

## 環境変数

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `FREE_DAILY_MESSAGE_LIMIT`（未設定時は30）

## 確認

- `npm run lint`
- `npm run build`

## 有料提供前に必要な設定

- 決済サービスと料金プラン
- 販売事業者名、所在地、連絡先、返金・解約条件
- 問い合わせ窓口
- 本番監視とエラー通知
- Supabase Authの本番用SMTPとリダイレクトURL（`/login/auth/confirm` と `/reset-password/confirm`）
