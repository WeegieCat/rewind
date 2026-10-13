"use client";

import { useEffect, useRef } from "react";

const SIZE = 600;
const R = 280; // 球の半径（ピクセル）
const CENTER = { lon: 135, lat: 35 }; // 視点の中心（日本付近）
const RAD = Math.PI / 180;

// 緯度経度 → 画面座標。裏側なら null を返す
function project(lon: number, lat: number): [number, number] | null {
    const λ = (lon - CENTER.lon) * RAD;
    const φ = lat * RAD;
    const φ0 = CENTER.lat * RAD;

    const cosC = 0; // TODO 1: 裏側の判定に使う値
    if (cosC < 0) return null;

    const x = 0; // TODO 2
    const y = 0; // TODO 2

    // TODO 3: 画面の中心に寄せて返す（y の向きに注意）
    return [x, y];
}

// 点の列を線で結ぶ。裏側に入ったら線を切る
function drawLine(ctx: CanvasRenderingContext2D, points: [number, number][]) {
    ctx.beginPath();
    let drawing = false;
    for (const [lon, lat] of points) {
        const p = project(lon, lat);
        if (!p) {
            drawing = false;
            continue;
        }
        if (drawing) ctx.lineTo(p[0], p[1]);
        else ctx.moveTo(p[0], p[1]);
        drawing = true;
    }
    ctx.stroke();
}

export default function Globe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, SIZE, SIZE);

        // 球の輪郭
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(SIZE / 2, SIZE / 2, R, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "gray";
        // 経線（10°おき）：緯度を -90 → 90 まで 2°刻みでたどる
        for (let lon = 0; lon < 360; lon += 10) {
            const points: [number, number][] = [];
            for (let lat = -90; lat <= 90; lat += 2) points.push([lon, lat]);
            drawLine(ctx, points);
        }
        // 緯線（10°おき）：経度を 0 → 360 まで 2°刻みでたどる
        for (let lat = -80; lat <= 80; lat += 10) {
            const points: [number, number][] = [];
            for (let lon = 0; lon <= 360; lon += 2) points.push([lon, lat]);
            drawLine(ctx, points);
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className='bg-black'
        />
    );
}
