import { continueRender, delayRender, staticFile } from "remotion";
// 在渲染前异步加载自定义字体，保证测量与绘制一致：
// - delayRender/continueRender：阻塞渲染直到字体 ready
// - staticFile：从 public/ 解析字体文件

export const TheBoldFont = `TheBoldFont`;

let loaded = false;

export const loadFont = async (): Promise<void> => {
  if (loaded) {
    return Promise.resolve();
  }

  const waitForFont = delayRender();

  loaded = true;

  const font = new FontFace(
    TheBoldFont,
    `url('${staticFile("theboldfont.ttf")}') format('truetype')`,
  );

  await font.load();
  document.fonts.add(font);

  continueRender(waitForFont);
};
