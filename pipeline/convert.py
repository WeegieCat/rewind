import json
from pathlib import Path

import numpy as np
import xarray as xr

SRC = Path("raw/gfs.20261012.t00z.1p00.f000.wind10m.grib2")
DST = Path("../web/public/data/wind.json")


def flatten(da: xr.DataArray) -> list[float]:
    # float32 のまま丸めると 2.1 が 2.0999999046325684 になるので、先に float64 にする
    return np.round(da.values.astype(np.float64).ravel(), 1).tolist()

def main() -> None:
    ds = xr.open_dataset(SRC, engine="cfgrib")

    lon = ds.longitude.values
    lat = ds.latitude.values
    header = {
        "nx": ds.sizes["longitude"],
        "ny": ds.sizes["latitude"],
        "lo1": float(lon[0]),
        "la1": float(lat[0]),
        "dx": float(abs(lon[1] - lon[0])),
        "dy": float(abs(lat[1] - lat[0])),
        "refTime": np.datetime_as_string(ds.time.values, unit="s") + "Z",
    }

    out = {"header": header, "u": flatten(ds.u10), "v": flatten(ds.v10)}

    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(json.dumps(out, separators=(",", ":")))

    print(f"{SRC.stat().st_size:,} bytes -> {DST.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()