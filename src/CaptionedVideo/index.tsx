import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  getStaticFiles,
  staticFile,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import { z } from "zod";
import SubtitlePage from "./SubtitlePage";
import { getVideoMetadata } from "@remotion/media-utils";
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";

export type SubtitleProp = {
  startInSeconds: number;
  text: string;
};

export const captionedVideoSchema = z.object({
  src: z.string(),
});

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

  const metadata = await getVideoMetadata(resolveSrc(props.src));

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};

const getFileExists = (file: string) => {
  const files = getStaticFiles();
  const fileExists = files.find((f) => {
    return f.src === file;
  });
  return Boolean(fileExists);
};

// How many captions should be displayed at a time?
// Try out:
// - 1500 to display a lot of words at a time
// - 200 to only display 1 word at a time
const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const CaptionedVideo: React.FC<{
  src: string;
}> = ({ src }) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const resolveSrc = useCallback((input: string): string => {
    if (/^(https?:|data:|blob:)/.test(input)) {
      return input;
    }
    return staticFile(input.replace(/^\//, ""));
  }, []);

  const resolvedVideoSrc = useMemo(() => resolveSrc(src), [resolveSrc, src]);

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

  useEffect(() => {
    fetchSubtitles();

    const c = watchStaticFile(subtitlesFile, () => {
      fetchSubtitles();
    });

    return () => {
      c.cancel();
    };
  }, [fetchSubtitles, src, subtitlesFile]);

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
      {getFileExists(`/${subtitlesRelativePath}`) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};
