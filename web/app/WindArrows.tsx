"use client";

import { useEffect, useRef } from "react";

type Wind = {
    header: {
        nx: number;
        ny: number;
        lo1: number;
        la1: number;
        dx: number;
        dy: number;
        refTime: string;
    };
    u: number[];
    v: number[];
};

const WIDTH = 720;
const HEIGHT = 360;
const STEP = 5; // 何度おきに描くか
const SCALE = 1.5; // 1 m/s を何ピクセルで描くか

export default function WindArrows() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        fetch("/data/wind.json")
            .then((res) => res.json())
            .then((wind: Wind) => {
                const { nx, ny, lo1, la1, dx, dy } = wind.header;
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                ctx.strokeStyle = "white";
                ctx.fillStyle = "white";

                for (let j = 0; j < ny; j += STEP) {
                    for (let i = 0; i < nx; i += STEP) {
                        const k = j * nx + i; // 1次元配列での位置
                        const lon = lo1 + i * dx;
                        const lat = la1 - j * dy;

                        // 正距円筒図法：経度・緯度をそのまま横・縦に置く
                        const x = (lon / 360) * WIDTH;
                        const y = ((90 - lat) / 180) * HEIGHT;

                        // V は北（画面の上）が正、Canvas の y は下が正なので引く
                        const ex = x + wind.u[k] * SCALE;
                        const ey = y - wind.v[k] * SCALE;

                        // 根元の点
                        ctx.fillRect(x - 1, y - 1, 2, 2);

                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(ex, ey);
                        ctx.stroke();
                    }
                }
            });
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className='bg-black'
        />
    );
}
