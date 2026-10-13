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
                        const k = 0; // TODO 1: 配列の位置
                        const lon = lo1 + i * dx;
                        const lat = la1 - j * dy;

                        const x = 0; // TODO 2: 経度 → x
                        const y = 0; // TODO 2: 緯度 → y

                        const ex = x; // TODO 3: 矢印の先端の x（u を使う）
                        const ey = y; // TODO 3: 矢印の先端の y（v を使う。向きに注意）

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
