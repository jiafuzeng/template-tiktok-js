// Remotion 全局配置（仅对 CLI/Studio 生效，不影响 Node API 直接调用）：
// - 文档：https://remotion.dev/docs/config
// - 同名 CLI 标志也可用：https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

// 将导出图片格式设为 jpeg，渲染视频帧时默认使用 JPEG 编码
Config.setVideoImageFormat("jpeg");
// 覆盖输出：若输出文件已存在，允许覆盖
Config.setOverwriteOutput(true);
