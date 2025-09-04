import { execSync } from "node:child_process";
import {
  existsSync,
  rmSync,
  writeFileSync,
  lstatSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import path from "path";
import {
  WHISPERX_DEVICE,
  WHISPERX_MODEL,
  WHISPERX_COMPUTE_TYPE,
} from "./whisperx-config.mjs";

// 使用 WhisperX（Python）生成字幕 JSON，输出到 public/ 下

const extractToTempAudioFile = (fileToTranscribe, tempOutFile) => {
  execSync(
    `npx remotion ffmpeg -i "${fileToTranscribe}" -ar 16000 "${tempOutFile}" -y`,
    { stdio: ["ignore", "inherit"] },
  );
};

const subFile = async (filePath, fileName, folder) => {
  const outPath = path.join(
    process.cwd(),
    "public",
    folder,
    fileName.replace(".wav", ".json"),
  );

  const py = path.join(
    process.cwd(),
    "python/whisperx_to_captions.py",
  );

  const cmd = [
    "python3",
    py,
    `--input "${filePath}"`,
    `--output "${outPath.replace("webcam", "subs")}"`,
    `--device ${WHISPERX_DEVICE}`,
    `--model ${WHISPERX_MODEL}`,
    `--compute_type ${WHISPERX_COMPUTE_TYPE}`,
  ].join(" ");

  execSync(cmd, { stdio: ["ignore", "inherit", "inherit"] });
};

const processVideo = async (fullPath, entry, directory) => {
  if (
    !fullPath.endsWith(".mp4") &&
    !fullPath.endsWith(".webm") &&
    !fullPath.endsWith(".mkv") &&
    !fullPath.endsWith(".mov")
  ) {
    return;
  }

  // 始终重新生成：删除旧的 JSON（如果存在）
  const existingJson = fullPath
    .replace(/.mp4$/, ".json")
    .replace(/.mkv$/, ".json")
    .replace(/.mov$/, ".json")
    .replace(/.webm$/, ".json")
    .replace("webcam", "subs");
  try {
    if (existsSync(existingJson)) {
      rmSync(existingJson, { force: true });
    }
  } catch {}

  let shouldRemoveTempDirectory = false;
  if (!existsSync(path.join(process.cwd(), "temp"))) {
    mkdirSync(`temp`);
    shouldRemoveTempDirectory = true;
  }
  console.log("Extracting audio from file", entry);

  const tempWavFileName = entry.split(".")[0] + ".wav";
  const tempOutFilePath = path.join(process.cwd(), `temp/${tempWavFileName}`);

  extractToTempAudioFile(fullPath, tempOutFilePath);
  await subFile(
    tempOutFilePath,
    tempWavFileName,
    path.relative("public", directory),
  );
  if (shouldRemoveTempDirectory) {
    rmSync(path.join(process.cwd(), "temp"), { recursive: true });
  }
};

const processDirectory = async (directory) => {
  const entries = readdirSync(directory).filter((f) => f !== ".DS_Store");

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stat = lstatSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath); // Recurse into subdirectories
    } else {
      await processVideo(fullPath, entry, directory);
    }
  }
};

// Read arguments for filename if given else process all files in the directory
const hasArgs = process.argv.length > 2;

if (!hasArgs) {
  await processDirectory(path.join(process.cwd(), "public"));
  process.exit(0);
}

for (const arg of process.argv.slice(2)) {
  const fullPath = path.join(process.cwd(), arg);
  const stat = lstatSync(fullPath);

  if (stat.isDirectory()) {
    await processDirectory(fullPath);
    continue;
  }

  console.log(`Processing file ${fullPath}`);
  const directory = path.dirname(fullPath);
  const fileName = path.basename(fullPath);
  await processVideo(fullPath, fileName, directory);
}


