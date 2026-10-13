import json
from pathlib import Path

import numpy as np
import xarray as xr

SRC = Path("raw/gfs.20261012.t00z.1p00.f000.wind10m.grib2")
DST = Path("../web/public/data/wind.json")


def flatten(da: xr.DataArray) -> list[float]:
    # TODO 1: 2次元配列を1次元の Python リストにして、小数1桁に丸める
    ...


def main() -> None:
    ds = xr.open_dataset(SRC, engine="cfgrib")

    header = {
        # TODO 2: ds から読み取って埋める（数字を直接書かない）
    }

    out = {"header": header, "u": flatten(ds.u10), "v": flatten(ds.v10)}

    DST.parent.mkdir(parents=True, exist_ok=True)
    # TODO 3: out を JSON として DST に書き出す（余分な空白を入れない）

    print(f"{SRC.stat().st_size:,} bytes -> {DST.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()