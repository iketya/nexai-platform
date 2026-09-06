# NexAI Platform 開発引き継ぎ

## 1. プロジェクト概要

**NexAI Platform** というWebサービスを開発中。

目標は単なる生成AIチャットではなく、

> **誰でも専門AIを作成 → 公開 → 他ユーザーが利用 →
> 将来的に収益化できるAIプラットフォーム**

を作ること。

将来的には100ページ以上・50機能規模まで拡張し、事業として大きくすることも想定。

### 想定AI

-   Python家庭教師AI
-   ES添削AI
-   就活AI
-   英会話AI
-   数学AI
-   経理AI
-   営業AI
-   ユーザー独自の専門AI

------------------------------------------------------------------------

## 2. 技術構成

-   Frontend / Backend: Next.js 16.2.11 / TypeScript / React / Tailwind
    CSS v4
-   Database / Auth: Supabase（Authentication / PostgreSQL / RLS）
-   AI: Gemini API / Gemini 2.5 Flash
-   Hosting: Vercel
-   GitHub Repository: `iketya/nexai-platform`
-   ローカル: `C:\nexai-platform`
-   本番: `https://nexai-platform-b7f9-one.vercel.app/`

------------------------------------------------------------------------

## 3. 現在完成しているもの

### インフラ

-   [x] Next.js
-   [x] GitHub
-   [x] Vercel自動デプロイ
-   [x] Supabase
-   [x] Gemini API
-   [x] `.env.local`
-   [x] Vercel Environment Variables

### 認証

-   [x] 新規登録
-   [x] ログイン
-   [x] Supabase Auth
-   [x] セッション

### AI

-   [x] AI作成
-   [x] Supabase保存
-   [x] AI一覧
-   [x] AI詳細
-   [x] AI公開
-   [x] Geminiチャット

基本フロー：

`ログイン → AI作成 → Supabase保存 → AI公開 → AI詳細 → Geminiと会話`

------------------------------------------------------------------------

## 4. AI作成

ルート: `/create`

設定項目： - AI名 - 説明 - アイコン - カテゴリ - 話し方 - System
Prompt - 公開 / 非公開

保存先: Supabase `agents`

主要ファイル： - `app/create/page.tsx` -
`app/create/create-agent-form.tsx` - `app/create/actions.ts`

------------------------------------------------------------------------

## 5. slug

日本語slugをredirectへ渡した際、

`Invalid character in header content ["x-action-redirect"]`

が発生したためASCII英数字slugへ変更。

例：

`Python家庭教師AI → /agents/agent-a1b2c3d4`

表示名は日本語のまま。

------------------------------------------------------------------------

## 6. Geminiチャット

主要ファイル： - `app/api/chat/route.ts` - `components/agent-chat.tsx`

処理：

`ユーザー入力 → /api/chat → agentsから設定取得 → system_prompt + tone + 会話履歴 → Gemini → 回答`

AIの名前、System Prompt、toneをSystem
InstructionとしてGeminiへ渡している。

------------------------------------------------------------------------

## 7. ストリーミング / Markdown

`streamGenerateContent`
を使用して、回答をリアルタイム表示する構成へ変更済み。

導入済み：

``` powershell
npm install react-markdown remark-gfm
npm install -D @tailwindcss/typography
```

`app/globals.css`：

``` css
@plugin "@tailwindcss/typography";
```

Markdown、見出し、太字、リスト、コードブロックなどを表示可能。

------------------------------------------------------------------------

## 8. 会話履歴DB

Supabaseに作成済み： - `conversations` - `messages`

構造：

`auth.users → conversations → messages`

### conversations

-   id
-   user_id
-   agent_id
-   title
-   created_at
-   updated_at

### messages

-   id
-   conversation_id
-   role
-   content
-   created_at

roleは `user` / `assistant`。

RLS設定済みで、自分のconversation/messagesのみ操作可能。

------------------------------------------------------------------------

## 9. 会話保存API

作成を進めているAPI： - `app/api/conversations/route.ts` -
`app/api/conversations/[id]/route.ts` - `app/api/messages/route.ts`

処理：

`conversation作成 → user message保存 → Gemini生成 → assistant message保存`

`AgentChat` に `conversationId` stateを追加済み。

一度 `useState` をコンポーネント外に置いて `Invalid hook call`
が発生したが、コンポーネント内部へ移して解決済み。

------------------------------------------------------------------------

## 10. 現在地点

本番環境で動作確認済み。

-   [x] AIチャット
-   [x] Gemini
-   [x] ストリーミング
-   [x] Markdown
-   [x] 会話保存DB/API基盤
-   [x] 過去の会話一覧
-   [x] 会話の選択とmessages読み込み
-   [x] 過去の会話の続きからチャット
-   [x] 新しいチャット
-   [x] 会話削除
-   [x] 最初の質問から会話タイトルを自動生成
-   [x] チャットをログイン必須化し会話をサーバー側で保存
-   [x] 共通ヘッダー・フッターと販売向けトップページ
-   [x] AI検索・カテゴリ絞り込み
-   [x] 作成者ダッシュボード
-   [x] AI編集・削除
-   [x] 利用規約・プライバシーポリシー草案
-   [x] ログイン必須チャットと日次利用上限
-   [x] パスワード再設定フロー
-   [x] API入力検証・安全なエラー表示・セキュリティヘッダー

------------------------------------------------------------------------

## 11. 次に実装する機能

会話履歴と販売基盤の第1段階は完了。次の優先候補：

1.  Supabaseで `supabase/production-hardening.sql` を実行
2.  Supabase Authの本番SMTP・リダイレクトURLを設定
3.  Stripe課金と料金プラン
4.  問い合わせ窓口・事業者情報の確定
5.  お気に入り、利用回数、人気ランキング
6.  通報・モデレーション
7.  ユーザープロフィール

### 2026-09-07 本番確認時の注意

GitHub `main` への反映とNext.js本番ビルドは成功。
本番URL自体は応答するが、Supabaseホスト
`iadykdfitagzyunnulkj.supabase.co` がCloudflare 521を返しており、
公開AI一覧および会話履歴の実データ確認は未完了。
Supabaseプロジェクトの稼働状態を確認後、ログイン状態で会話の作成・再読込・削除を確認する。

------------------------------------------------------------------------

## 12. Supabaseで発生した問題

誤り：

``` env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co/rest/v1/
```

正：

``` env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

`/rest/v1/` は付けない。

環境変数： - `NEXT_PUBLIC_SUPABASE_URL` -
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - `GEMINI_API_KEY`

Gemini APIキーは過去に露出したため再発行対応。

------------------------------------------------------------------------

## 13. Vercelで発生した問題

ローカルでは動くが本番でInternal Server Errorが発生。

原因はVercel側にSupabase環境変数がなかったこと。

Vercel `Settings → Environment Variables`
に以下を登録してRedeployし解決： - `NEXT_PUBLIC_SUPABASE_URL` -
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - `GEMINI_API_KEY`

------------------------------------------------------------------------

## 14. Git / GitHub

Repository: `https://github.com/iketya/nexai-platform.git`

プロジェクト作り直し後、履歴が異なったため以下で再接続：

``` powershell
git remote add origin https://github.com/iketya/nexai-platform.git
git branch -M main
git fetch origin
git push -u origin main --force-with-lease
```

通常：

``` powershell
git add .
git commit -m "変更内容"
git push
```

`GitHub → Vercel → 自動デプロイ`

------------------------------------------------------------------------

## 15. 解決済みエラー

-   `Can't resolve './globals.css'` → `app/globals.css` を作成
-   `Can't resolve 'react-markdown'` → パッケージ導入
-   `Invalid hook call` → HookをAgentChat内部へ移動
-   `x-action-redirect` → ASCII slugへ変更
-   Vercel Supabase client error → Environment Variables設定

------------------------------------------------------------------------

## 16. ロードマップ

1.  過去の会話一覧
2.  新しいチャット
3.  会話削除
4.  AI編集
5.  AI検索
6.  カテゴリ
7.  お気に入り
8.  いいね
9.  レビュー
10. 利用回数
11. 人気ランキング
12. ユーザープロフィール
13. AI作成者ページ
14. RAG
15. PDFアップロード
16. Web情報取り込み
17. AI分析ダッシュボード
18. Stripe
19. 有料AI
20. AI作成者への収益分配

将来的にはAI Store / AI Marketplace / AI Agent / 複数AI連携も検討。

------------------------------------------------------------------------

## 17. 差別化方針

単なる「Gemini + System Prompt」のサイトにはしない。

目標：

> **専門知識を持ったAIを誰でも作成・公開・改善・収益化できるプラットフォーム**

重要候補： - RAG：独自PDF・資料・データをAIの知識として利用 -
Marketplace：AIを公開・販売 -
評価：レビュー・利用回数・お気に入り・ランキング - AI
Agent：複数専門AIの連携

------------------------------------------------------------------------

## 18. 次のチャットへの指示

このNexAI Platformを引き継いで開発する。

現在、本番環境で **Next.js + Supabase + Gemini** を使った

`ログイン → AI作成 → 公開 → Geminiチャット`

まで動作している。

`conversations` / `messages` とRLSも作成済みで、会話保存機能は実装済み。

会話履歴の一覧・選択・再開・新規作成・削除・タイトル自動生成まで実装済み。

Supabaseの521エラーは復旧済み。会話履歴とAI編集まで実装済み。
次は `supabase/production-hardening.sql` の本番適用、Supabase Authの本番設定、料金プラン決定、Stripe課金、
問い合わせ窓口と事業者情報の確定を進める。

既存コードを壊さないよう、必要なファイルはできるだけ**丸ごとの差し替えコード**で提示して開発を続ける。
