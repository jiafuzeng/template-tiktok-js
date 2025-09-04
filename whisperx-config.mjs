// WhisperX 配置（Python 实现）
// - 使用 Python 环境执行 whisperx_to_captions.py
// - 可根据硬件选择 device 与 compute_type

export const WHISPERX_DEVICE = process.env.WHISPERX_DEVICE ?? "cuda"; // 或 "cuda"
export const WHISPERX_MODEL = process.env.WHISPERX_MODEL ?? "large-v3";
// 根据设备选择默认计算精度：
// - CPU：int8 更省内存且兼容；
// - CUDA：float16 更高效。
const defaultComputeType = WHISPERX_DEVICE === "cpu" ? "int8" : "float16";
export const WHISPERX_COMPUTE_TYPE =
  process.env.WHISPERX_COMPUTE_TYPE ?? defaultComputeType; // 可覆盖为 int8/float32/float16


