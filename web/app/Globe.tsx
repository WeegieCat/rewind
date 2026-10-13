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

    // 視点の中心とその地点のあいだの角度の余弦。負なら裏側
    const cosC =
        Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ);
    if (cosC < 0) return null;

    // 正射図法：球の中心が原点、上が正
    const x = R * Math.cos(φ) * Math.sin(λ);
    const y =
        R *
        (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ));

    // Canvas は左上が原点、下が正なので、中心に寄せて y を反転する
    return [SIZE / 2 + x, SIZE / 2 - y];
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
