import React from "react";
import { AbsoluteFill } from "remotion";

// 当找不到与视频同名的 JSON 字幕文件时，给出提示
export const NoCaptionFile: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        height: "auto",
        width: "100%",
        backgroundColor: "white",
        fontSize: 50,
        padding: 30,
        top: undefined,
        fontFamily: "sans-serif",
      }}
    >
      No caption file found in the public folder. <br /> Run `node sub-whisperx.mjs` to
      create one using WhisperX.
    </AbsoluteFill>
  );
};
