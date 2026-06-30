"use client";

import { useRef, useEffect } from "react";
import type { RarityId } from "@/src/game/canon/types";
import sapphireVert from "@/src/render/shaders/sapphire.vert.glsl";
import sapphireFrag from "@/src/render/shaders/sapphire.frag.glsl";

// How visible the effect is per rarity
const INTENSITY: Partial<Record<RarityId, number>> = {
  maitrise: 0.32,
  virtuosite: 0.52,
  "grande-oeuvre": 0.76,
  "opus-aeternum": 1.0,
};

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

interface SapphireOverlayProps {
  rarity: RarityId;
}

export default function SapphireOverlay({ rarity }: SapphireOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const intensity = INTENSITY[rarity] ?? 0;
    if (intensity === 0) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    // DPR-aware size
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = 280 * dpr;
    canvas.height = 420 * dpr;

    const vert = compileShader(gl, gl.VERTEX_SHADER, sapphireVert);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, sapphireFrag);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");

    // Empty VAO needed for gl_VertexID approach without any vertex buffers
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    const parent = canvas.parentElement;
    parent?.addEventListener("mousemove", onMouseMove);

    let rafId: number;
    const render = (ms: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uTime, ms * 0.001);
      gl.uniform1f(uIntensity, intensity);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      parent?.removeEventListener("mousemove", onMouseMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteVertexArray(vao);
    };
  }, [rarity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        borderRadius: 10,
        pointerEvents: "none",
        mixBlendMode: "overlay",
      }}
      aria-hidden="true"
    />
  );
}
