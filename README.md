# 自作 earth.nullschool

[earth.nullschool.net](https://earth.nullschool.net/)（風の地球儀）を自分の手で作り直すプロジェクト。
ReHackathon（テーマ「車輪の再発明」）の出場作品。

## 目的

完成品を作ることよりも、**本家がなぜその設計にしたのかを、作りながら理解すること**を目的にしています。
各段階で次の流れを記録します。

1. 素朴に実装する
2. 問題に気づく
3. 本家の工夫を理解して実装する
4. 差を実測する

記録は `notes/` に置く予定

## 仕組み

```
NOAA（GFS の GRIB2）
   │ ダウンロード（1回分を保存）
   ▼
pipeline/raw/*.grib2
   │ Python で解読・変換（xarray + cfgrib）
   ▼
web/public/data/wind.json
   │ ブラウザが fetch
   ▼
Next.js（Canvas）で描画
```

重い変換は事前に済ませ、ブラウザは JSON を読んで描くだけにする。

## 構成

```
.
├─ pipeline/   # Python（uv）。GRIB2 → JSON 変換
│   └─ raw/    # GRIB2 原本（git 管理外）
├─ web/        # Next.js（App Router, TypeScript）
└─ notes/      # 実測値・スクリーンショット・詰まった点
```

## セットアップ

必要なもの：git、Node.js 20 以上、[uv](https://docs.astral.sh/uv/)

### pipeline

```bash
cd pipeline
uv sync
uv run python -m eccodes selfcheck
```

`Your system is ready.` と出ない場合は、ecCodes 本体を OS パッケージで入れます。

```bash
sudo apt install libeccodes-dev
```

### web

準備中。

## データと参考元

- 気象データ：[NOAA GFS](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast)（NOMADS から取得）
- 参考実装：[cambecc/earth](https://github.com/cambecc/earth)（旧版、MIT License）

本家の画面やデータは複製・再配布しません。
現行の earth.nullschool.net はクローズドソースのため、参照するのは公開されている旧版のみ。
