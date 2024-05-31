# nLFaceController(顔ス コントローラー)
 nizimaLIVEのパラメータを読み取り、pyautogui経由でキー入力をエミュレートするプラグインです。

## 使用方法
 1. ```pip install pyautogui```でpyautoguiを使用可能な状態にしておく
 2. ```npm start```や```nodemon start```等で実行
 3. ```localhost:3000```にブラウザ経由で接続
 4. 設定して実行

## 各ファイル
 `index.js`: api等を司る
 `public`ディレクトリ: フロントエンド部分
 `key.py`:index.jsと連携しキー入力を発火する
 `rules.csv`: パラメータと設定する最大最小値、発火するキーを保存した一覧

## 注意
 キー入力をエミュレートする関係上、意図しないキー入力をするおそれがあります。Pause/Resumeボタンで適切に管理してください。

## リンク
 [Live2D/nizimaLIVEPluginAPI](https://github.com/Live2D/nizimaLIVEPluginAPI)