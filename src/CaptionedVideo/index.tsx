// 作用：渲染视频并叠加同名 JSON 字幕，输出抖音风格逐词字幕
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import { z } from "zod";
import SubtitlePage from "./SubtitlePage";
import { parseMedia } from "@remotion/media-parser";
import { loadFont } from "../load-font";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";

export type SubtitleProp = {
  startInSeconds: number;
  text: string;
};

// 入参校验：仅要求传入视频路径 src
export const captionedVideoSchema = z.object({
  src: z.string(),
});

// 元数据计算：用 parseMedia 读取时长，按固定 fps 推出总帧数
export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const resolveSrc = (input: string): string => {
    if (/^(https?:|data:|blob:)/.test(input)) {
      return input;
    }
    // Treat as path under public/
    return staticFile(input.replace(/^\//, ""));
  };

  const media = await parseMedia({
    src: resolveSrc(props.src),
    fields: {
      durationInSeconds: true,
    },
  });

  const durationSec = media.durationInSeconds ?? 0;
  return {
    fps,
    durationInFrames: Math.max(1, Math.floor(durationSec * fps)),
  };
};


// 每页字幕显示时长（毫秒）。
// 可尝试：
// - 1500：同屏显示更多单词
// - 200：单词快速切换、基本逐词
const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const CaptionedVideo: React.FC<{
  src: string;
}> = ({ src }) => {
  // 字幕数组状态
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  // 渲染阻塞句柄：等待字幕加载完成后再继续渲染
  const [handle] = useState(() => delayRender());
  // 当前 composition 的帧率
  const { fps } = useVideoConfig();

  // 将相对路径映射到 public/；网络资源保持原样
  const resolveSrc = useCallback((input: string): string => {
    if (/^(https?:|data:|blob:)/.test(input)) {
      return input;
    }
    return staticFile(input.replace(/^\//, ""));
  }, []);

  const resolvedVideoSrc = useMemo(() => resolveSrc(src), [resolveSrc, src]);

  // 由视频名推导同名字幕 JSON 路径（扩展名改为 .json）
  const subtitlesRelativePath = useMemo(() => {
    return src
      .replace(/\.mp4$/i, ".json")
      .replace(/\.mkv$/i, ".json")
      .replace(/\.mov$/i, ".json")
      .replace(/\.webm$/i, ".json")
      .replace(/^\/+/, "");
  }, [src]);

  const subtitlesFile = useMemo(() => {
    return resolveSrc(subtitlesRelativePath);
  }, [resolveSrc, subtitlesRelativePath]);

  // 加载字体 → 拉取字幕 → 归一化为 Caption[] → 继续渲染
  const fetchSubtitles = useCallback(async () => {
    try {
      await loadFont();
      const res = await fetch(subtitlesFile);
      const raw = (await res.json()) as any[];
      // 归一化字段，兼容 fromMs/toMs 与 startMs/endMs 两种格式
      const normalized: Caption[] = (raw ?? [])
        .map((c: any) => {
          const startMs = Number.isFinite(c?.startMs)
            ? Number(c.startMs)
            : Number(c?.fromMs);
          const endMs = Number.isFinite(c?.endMs)
            ? Number(c.endMs)
            : Number(c?.toMs);
          const text = String(c?.text ?? "");
          if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
            return null;
          }
          return {
            text,
            startMs,
            endMs,
            timestampMs: Number.isFinite(c?.timestampMs)
              ? Number(c.timestampMs)
              : Math.round((startMs + endMs) / 2),
            confidence:
              typeof c?.confidence === "number" ? c.confidence : undefined,
          } as Caption;
        })
        .filter((c): c is Caption => c !== null)
        .sort((a, b) => a.startMs - b.startMs);
      setSubtitles(normalized);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle, subtitlesFile]);

  // 首次进入与字幕文件更新时，重新加载字幕
  useEffect(() => {
    fetchSubtitles();

    const c = watchStaticFile(subtitlesFile, () => {
      fetchSubtitles();
    });

    return () => {
      c.cancel();
    };
  }, [fetchSubtitles, src, subtitlesFile]);

  // 将逐词字幕在时间上分页，构成可切换的字幕块
  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill>
        <OffthreadVideo
          style={{
            objectFit: "cover",
          }}
          src={resolvedVideoSrc}
        />
      </AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS,
        );
        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage key={index} page={page} />
          </Sequence>
        );
      })}
      {/* 仅渲染字幕，不显示“无字幕文件”提示 */}
    </AbsoluteFill>
  );
};
