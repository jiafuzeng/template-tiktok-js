# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Captioning (WhisperX)

Replace the `sample-video.mp4` with your video file.

Caption all the videos in your `public` by running the following command:

```console
npm run create-subtitles:whisperx
```

Only caption a specific video:

```console
node sub-whisperx.mjs <path-to-video-file>
```

Only caption a specific folder:

```console
node sub-whisperx.mjs <path-to-folder>
```

## Configure WhisperX

You can configure device/model/compute type via environment variables or by editing `whisperx-config.mjs`.
Defaults: `WHISPERX_DEVICE=cpu`, `WHISPERX_MODEL=large-v3`, `WHISPERX_COMPUTE_TYPE=int8` on CPU (`float16` on CUDA).

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://remotion.dev/discord).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
