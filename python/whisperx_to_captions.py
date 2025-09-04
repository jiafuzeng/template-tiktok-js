#!/usr/bin/env python3
"""
使用 WhisperX 将音频转写为逐词时间轴 JSON（与 @remotion/captions 的 Caption[] 兼容）。

依赖：
  pip install whisperx torch --extra-index-url https://download.pytorch.org/whl/cu121

注意：
  - device 可选 cpu/cuda；如使用 GPU，请确保 CUDA 对应版本可用
  - 可选说话人分离（需 pyannote.audio 与 token），此处默认关闭
"""

import argparse
import json
import os
import sys


def _import_whisperx():
    try:
        import whisperx  # type: ignore
        return whisperx
    except Exception as e:
        print(
            "[whisperx_to_captions] 请先安装依赖： pip install whisperx torch",
            file=sys.stderr,
        )
        raise e


def _to_captions(words):
    """
    将 WhisperX 对齐后的 words 列表转换为 Caption[]（模板期望）：
      { text, startMs, endMs, timestampMs|null, confidence|null }
    行为调整：
      - 使用“前置空格”作为分词间隔（除第一词外），以匹配 createTikTokStyleCaptions 的分页语义。
    """
    captions = []
    for idx, w in enumerate(words or []):
        if w.get("start") is None or w.get("end") is None:
            continue
        raw = (w.get("word") or "").strip()
        # 非首词添加前置空格；首词不加
        text = (" " + raw) if (idx > 0 and raw) else raw
        start_ms = int(float(w["start"]) * 1000.0)
        end_ms = int(float(w["end"]) * 1000.0)
        timestamp_ms = int((start_ms + end_ms) / 2)
        conf = w.get("score")
        try:
            conf_val = float(conf) if conf is not None else None
        except Exception:
            conf_val = None
        captions.append({
            "text": text,
            "startMs": start_ms,
            "endMs": end_ms,
            "timestampMs": timestamp_ms,
            "confidence": conf_val,
        })
    return captions


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="输入音频文件路径（wav/其它）")
    parser.add_argument("--output", required=True, help="输出 JSON 文件路径")
    parser.add_argument("--device", default="cpu", help="cpu 或 cuda")
    parser.add_argument("--model", default="large-v3", help="WhisperX 模型名")
    parser.add_argument(
        "--compute_type", default="float16", help="cuda 推荐 float16，cpu 可用 int8 或 float32"
    )
    args = parser.parse_args()

    whisperx = _import_whisperx()

    device = args.device
    compute_type = args.compute_type
    model_name = args.model

    audio_path = args.input
    out_path = args.output

    if not os.path.exists(audio_path):
        print(f"[whisperx_to_captions] 输入文件不存在: {audio_path}", file=sys.stderr)
        sys.exit(1)

    # 1) 加载与转写
    audio = whisperx.load_audio(audio_path)
    # 兼容性处理：若 float16 在当前设备不可用则回退到 float32/int8
    try:
        model = whisperx.load_model(model_name, device, compute_type=compute_type)
    except Exception as e:
        if "float16" in str(e).lower() and device == "cpu":
            print("[whisperx_to_captions] float16 不适用于 CPU，回退到 int8", file=sys.stderr)
            model = whisperx.load_model(model_name, device, compute_type="int8")
        else:
            raise
    result = model.transcribe(audio)

    # 2) 对齐至逐词级别
    lang = result.get("language")
    align_model, metadata = whisperx.load_align_model(language_code=lang, device=device)
    aligned = whisperx.align(result["segments"], align_model, metadata, audio, device)

    # 3) 扁平化所有词为 Caption[]
    all_words = []
    for seg in aligned.get("segments", []):
        all_words.extend(seg.get("words", []) or [])

    captions = _to_captions(all_words)

    # 4) 写文件
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(captions, f, ensure_ascii=False, indent=2)

    print(f"[whisperx_to_captions] 已写出: {out_path}")


if __name__ == "__main__":
    main()


