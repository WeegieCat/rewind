# 自作 earth.nullschool（ReHackathon 出場作品）

## このプロジェクトについて
- ReHackathon（テーマ「車輪の再発明」）の出場作品として、earth.nullschool.net（風の地球儀）を自作する。
- 評価軸は「題材をどこまで探究したか／何をどう考えて実装したか／発表で伝えられたか」。有用性・新規性はほぼ評価されない。
- 各段階で「素朴な実装 → 問題に気づく → 本家の工夫を理解・実装 → 差を実測」を記録し、発表（5〜10分）の材料にする。
- 開発者：山内敬太（九工大 情報工学部3年）。TypeScript / Next.js / React Three Fiber / Cloudflare が得意。気象データと WebGL シェーダは初挑戦。

## Claude への依頼方針
- 回答は日本語。結論を先に、手順は具体的に。
- 全部を代わりに書かない。**本人が理解して発表で説明できること**を優先し、「仕組みの説明 → ヒント → 必要ならコード」の順で手伝う。
- 新しい概念（双線形補間、投影と歪み補正、GRIB2、GPU粒子など）は「なぜ本家はそう設計したか」の視点で説明する。
- タスクは小さく区切り、「次にやる1つ」を常に明示する（ADHD傾向あり）。
- 作業の終わりに、発表で使えるネタ（比較・実測値・失敗談）があれば一言添える。
- スコープが膨らみそうなら指摘し、マイルストーンに照らして優先度を提案する。
- ライブラリ・サービスの仕様など変わりうる情報は、公式ドキュメントで確認してから答える。

## リポジトリ構成（モノレポ、git はルートで1つだけ）
```
earth-rehack/
├─ CLAUDE.md
├─ pipeline/          # Python（uv）。GRIB2 → JSON 変換
│   ├─ raw/           # GRIB2 原本（.gitignore 対象）
│   └─ convert.py
├─ web/               # Next.js（App Router, TypeScript）
│   └─ public/data/wind.json   # pipeline の出力先
└─ notes/             # 発表用ログ（実測値・スクショ・詰まった点）
```
- `web/` 内に `.git` を作らない（入れ子リポジトリ禁止）。
- Python と Node の設定はそれぞれのフォルダ内に置く。

## 技術方針
- データ：GFS（NOAA、1°格子、1日4回）を NOMADS から GRIB2 で取得。`UGRD`/`VGRD`、10 m above ground に絞る。
  - 代替：AWS Open Data の `noaa-gfs-bdp-pds`（直近分のみ残るので取れたら即保存）。最終手段は ECMWF 公開データ。
  - 1回分を保存し、以降は同じデータで再現可能に開発する。
- 変換：Python（xarray + cfgrib + eccodes）。ecCodes が見つからない場合は OS パッケージで本体を入れる。
- 描画：Canvas 2D（CPU版）→ 理解が固まったら WebGL / React Three Fiber で GPU 化。
- インフラ：Cloudflare Workers。
  - **今はローカルの `next dev` のみ。デプロイは12月以降。**
  - デプロイ時は vinext を使う（Cloudflare の現在の推奨。OpenNext ではない）。`web/` で `npx vinext check` → `npx vinext init`。ベータ版なので互換性を確認する。
  - 変換済みデータは R2 に置き、Worker 経由（`cloudflare:workers` の `env` バインディング）で同一オリジン配信。
  - GRIB2 変換は Workers で動かさない。定期更新が必要になったら GitHub Actions（schedule）→ R2 にアップロード。

## 本家（cambecc/earth 旧版、MIT）の構成メモ
- 事前変換：GFS GRIB2 → grib2json（Java）→ JSON、Natural Earth → GDAL → TopoJSON。
- 配信：S3 静的ホスティング（dev-server.js は代役）。サーバロジックはほぼなし。
- ブラウザ：双線形補間（作者いわく「かなり重い」）→ 投影の歪みを有限差分で近似 → D3 の SVG ＋ Canvas×2 で描画。
- 地球の内外判定は、別 Canvas に球を描いたマスクで行う。
- 状態管理：Backbone.js（設定を URL ハッシュと同期）。イベント連鎖で一瞬表示が乱れる弱点を作者自身が認めている。
- 現行サイトはクローズドソース。発表では「公開されている旧版では」と限定して語る。

## マイルストーン
| 時期 | ゴール |
|---|---|
| 〜10月末 | GFS を取得して JSON 化。平面地図（正距円筒）に風の矢印を表示 |
| 〜11月 | Canvas 2D で粒子アニメーション（CPU版）。双線形補間 |
| 〜12月 | 地球儀（正射図法）に投影し、歪みを補正 |
| 〜1月 | GPU 化で粒子数を桁違いに増やす |
| 〜発表 | 本家との比較、追加レイヤ、配信キャッシュ |

## 現在地と次の一手（2026-10-07 時点）
- [ ] 環境構築（uv / Node / git、pipeline と web の雛形）
- [ ] NOMADS の GFS フィルタページ（gfs_1p00）が使えるか確認
- [ ] GRIB2 を1回分ダウンロードして `pipeline/raw/` に保存
- [ ] xarray で中身を確認（緯度の向き 90→-90 か、経度 0〜359 か、U=東向き・V=北向き正か）
- [ ] JSON に書き出し、GRIB2 と JSON のサイズを notes/ に記録
- [ ] Canvas に5°おきの矢印を描画（偏西風が西→東になっているか確認）

## データ利用の線引き
- 公開データは提供元の条件に従う。本家の画面・データは複製・再配布しない。本家ソースは MIT の範囲で読む。
- Natural Earth などの地図データはライセンス表記を守る。
