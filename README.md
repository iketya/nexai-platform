# NexAI Platform

専門AIを作成・公開し、他のユーザーが会話できるプラットフォームです。

## 主な機能

- メール認証・ログイン
- 専門AIの作成、公開、編集、削除
- 公開AIの検索、カテゴリ絞り込み
- Geminiによるストリーミングチャット
- 会話履歴の保存、再開、削除
- ログインユーザー単位の日次利用上限
- Free（30回/日・AI 3個）とPro（月額980円・300回/日・AI 25個）
- Stripe Checkout、Webhook、契約管理ポータル
- Supabase RLSによる所有者ベースのアクセス制御

## ローカル起動

1. `.env.example` を参考に `.env.local` を作成します。
2. Supabase SQL Editorで `supabase/schema.sql` を実行します。
3. `npm install` を実行します。
4. `npm run dev` を実行します。

既存のSupabase環境を更新する場合は、`supabase/production-hardening.sql` と `supabase/production-billing.sql` を一度ずつ実行してください。

## 環境変数

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `FREE_DAILY_MESSAGE_LIMIT`（未設定時は30）
- `PRO_DAILY_MESSAGE_LIMIT`（未設定時は300）
- `PAYMENTS_ENABLED`（法定表示と本番設定が完了するまでは `false`）
- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`（サーバー専用・公開禁止）

## 確認

- `npm run lint`
- `npm run build`

## Stripe本番設定

1. Supabaseで `supabase/production-billing.sql` を実行します。
2. Stripeで「NexAI Pro」、月額980円（税込）のPriceを作成します。
3. Webhook送信先を `https://本番ドメイン/api/stripe/webhook` に設定します。
4. `checkout.session.completed`、`customer.subscription.created`、`customer.subscription.updated`、`customer.subscription.deleted`、`invoice.paid`、`invoice.payment_failed` を購読します。
5. Stripe Customer Portalで支払方法変更と解約を有効にします。
6. VercelへStripeとSupabaseの秘密鍵を登録します。
7. テストモードで購入・更新・失敗・解約を確認します。
8. 法定表示を完成させた後、最後に `PAYMENTS_ENABLED=true` を設定します。

## 有料提供前に残っている設定

- 販売事業者名、所在地、連絡先、返金・解約条件
- 問い合わせ窓口
- 本番監視とエラー通知
- Supabase Authの本番用SMTPとリダイレクトURL（`/login/auth/confirm` と `/reset-password/confirm`）
