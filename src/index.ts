// Remotion 入口文件：
// - 通过 registerRoot() 注册整个应用的根组件
// - CLI 渲染与 Studio 预览都会从这里开始
// This is your entry file! Refer to it when you render:
// npx remotion render <entry-file> HelloWorld out/video.mp4

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
