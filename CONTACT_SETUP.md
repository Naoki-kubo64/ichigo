# 問い合わせ送信の有効化

通知先はサーバー側で固定：
- info.ichigo.kubo@gmail.com
- info.ichigo.matsumoto@gmail.com

現在は未接続のためフォームを停止しています。入力チェック、確認画面、サーバー送信、失敗時の表示は実装済みです。

Vercel の ichigo プロジェクトで次を設定し再デプロイします。秘密の値はGitHubやチャットに貼らず、VercelのEnvironment Variablesへ直接入力してください。

- RESEND_API_KEY: Resendの送信権限付きAPIキー
- CONTACT_FROM: Resendで認証した送信元ドメインのアドレス（Gmailアドレスを勝手に送信元にしない）
- TURNSTILE_SITE_KEY: Cloudflare Turnstileの公開サイトキー
- TURNSTILE_SECRET_KEY: 同サービスの秘密キー
- CONTACT_ALLOWED_ORIGINS: 必要な場合のみ、実際の仮サイトURLをカンマ区切り（httpsから、末尾スラッシュなし）

Turnstileには使用する仮サイトのホスト名を登録してください。本公開時は独自ドメインも追加します。Previewに使う場合はPreview環境にも設定します。
Resendのテスト送信元には宛先制限があるため、2名への配送には送信ドメイン認証が必要です。
送信サービスの利用条件・料金は登録時に確認してください。

本公開前：担当者2名への到達・迷惑メール振り分け・返信先を実メールで確認。個人情報の保存期間と削除対応、公開用のプライバシーポリシーを法人で決定。フォームはメールを送るだけで問い合わせ履歴DBを持ちません。
Vercelからエックスサーバーへ移す際、HTML/CSSは再利用可能ですが api/contact.mjs はPHP等への移植または外部APIの継続利用が必要です。
