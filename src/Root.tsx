import { Composition, staticFile } from "remotion";
// 定义 Remotion 的 Composition：
// - 指定画布尺寸（1080x1920 竖屏）
// - 绑定组件 CaptionedVideo 作为渲染主体
// - 通过 calculateMetadata 动态读取视频时长生成 durationInFrames
// - defaultProps 提供默认视频路径（public/sample-video.mp4）
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionedVideo"
      component={CaptionedVideo}
      calculateMetadata={calculateCaptionedVideoMetadata}
      schema={captionedVideoSchema}
      width={1080}
      height={1920}
      defaultProps={{
        src: staticFile("sample-video.mp4"),
      }}
    />
  );
};
