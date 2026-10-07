"""Assistant media jobs, run by .github/workflows/media.yml (see docs/assistant.md).

media/job.json lists the work:
  "probe": true                      duration and pauses of every recorded line -> media/out/probe.json
  "trim": [{"voice", "end", "as"}]   cut a line at `end` seconds (with a short fade) -> public/assistant/voice/<as>.mp3
  "lipsync": [{"base", "voice", "out", "pads"?}]
                                     Wav2Lip: the base clip's mouth follows the line -> <out>.mp4 / .webm (silent;
                                     the page plays the voice itself). A base shorter than the line is extended
                                     forward-and-back so it never jumps.
Each step reports as a GitHub annotation so the run page shows the outcome.
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "media" / "out"
TMP = Path("/tmp/media")
CI = bool(os.environ.get("GITHUB_ACTIONS"))


def note(title, text, level="notice"):
    print(f"::{level} title={title}::{text}" if CI else f"[{title}] {text}", flush=True)


def run(cmd, **kw):
    print("+", " ".join(map(str, cmd)), flush=True)
    return subprocess.run(cmd, check=True, **kw)


def voice(key):
    """The recorded line, downloaded once from the voice CDN."""
    urls = json.loads((ROOT / "src/data/voice.json").read_text())
    path = TMP / "voice" / f"{key}.mp3"
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(urls[key], path)
    return path


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def pauses(path):
    """Silences of 0.18 s or more: where sentences end."""
    r = subprocess.run(["ffmpeg", "-i", str(path), "-af", "silencedetect=noise=-38dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return [[round(s, 2), round(e, 2)] for s, e in zip(starts, ends)]


def probe():
    keys = json.loads((ROOT / "src/data/voice.json").read_text()).keys()
    report = {}
    for key in keys:
        try:
            p = voice(key)
            report[key] = {"duration": round(duration(p), 2), "pauses": pauses(p)}
        except Exception as e:  # a line that is not on the CDN (e.g. a local cut) is skipped
            report[key] = {"error": str(e)}
    (OUT / "probe.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    note("Voice probe", " | ".join(f"{k} {v.get('duration', v.get('error'))}s pauses {v.get('pauses', '')}" for k, v in report.items()))


def trim(job):
    src = voice(job["voice"])
    end = float(job["end"])
    dst = ROOT / "public/assistant/voice" / f"{job['as']}.mp3"
    dst.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-t", f"{end}", "-af", f"afade=t=out:st={max(0, end - 0.12)}:d=0.12", "-c:a", "libmp3lame", "-q:a", "2", str(dst)])
    note("Voice trim", f"{job['voice']} cut at {end}s -> {dst.relative_to(ROOT)} ({duration(dst):.2f}s)")


# Weights for Wav2Lip: the original links are gone, so try the known mirrors in turn.
WEIGHTS = {
    "wav2lip_gan.pth": [
        "https://huggingface.co/numz/wav2lip_studio/resolve/main/Wav2lip/wav2lip_gan.pth",
        "https://huggingface.co/camenduru/Wav2Lip/resolve/main/checkpoints/wav2lip_gan.pth",
        "https://huggingface.co/Nekochu/Wav2Lip/resolve/main/wav2lip_gan.pth",
        "https://huggingface.co/rippertnt/wav2lip/resolve/main/wav2lip_gan.pth",
    ],
    "s3fd.pth": [
        "https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth",
        "https://huggingface.co/camenduru/Wav2Lip/resolve/main/face_detection/detection/sfd/s3fd.pth",
        "https://huggingface.co/numz/wav2lip_studio/resolve/main/Wav2lip/s3fd.pth",
    ],
}


def fetch_weight(name, dst):
    for url in WEIGHTS[name]:
        try:
            print("trying", url, flush=True)
            urllib.request.urlretrieve(url, dst)
            if dst.stat().st_size > 1_000_000:
                note("Wav2Lip weights", f"{name} from {url}")
                return
        except Exception as e:
            print("  failed:", e, flush=True)
    raise SystemExit(f"no mirror served {name}")


def wav2lip_ready():
    repo = TMP / "Wav2Lip"
    if (repo / "checkpoints/wav2lip_gan.pth").exists():
        return repo
    run(["git", "clone", "-q", "--depth", "1", "https://github.com/Rudrabha/Wav2Lip", str(repo)])
    run([sys.executable, "-m", "pip", "install", "-q", "torch==2.1.2", "torchvision==0.16.2", "--index-url", "https://download.pytorch.org/whl/cpu"])
    run([sys.executable, "-m", "pip", "install", "-q", "numpy==1.23.5", "librosa==0.9.2", "numba==0.58.1", "opencv-python-headless==4.8.1.78", "scipy==1.10.1", "tqdm"])
    (repo / "checkpoints").mkdir(exist_ok=True)
    fetch_weight("wav2lip_gan.pth", repo / "checkpoints/wav2lip_gan.pth")
    fetch_weight("s3fd.pth", repo / "face_detection/detection/sfd/s3fd.pth")
    return repo


def extended(base, seconds):
    """The base clip stretched to `seconds` without a jump: it plays forward, bounces back a little
    and plays forward again, so it starts on its first frame and ends on its last (where the
    clips before and after it meet it)."""
    length = duration(base)
    if length >= seconds:
        return base
    frames = TMP / "frames"
    if frames.exists():
        run(["rm", "-rf", str(frames)])
    frames.mkdir(parents=True)
    run(["ffmpeg", "-v", "error", "-i", str(base), str(frames / "%05d.png")])
    files = sorted(frames.glob("*.png"))
    n = len(files)
    fps = 24
    need = int(seconds * fps) + 1
    order = list(range(n))
    while need - len(order) > 1:
        k = min((need - len(order)) // 2, n - 1)
        order += list(range(n - 2, n - 2 - k, -1)) + list(range(n - k, n))
    order += [n - 1] * (need - len(order))
    listing = TMP / "frames.txt"
    listing.write_text("".join(f"file '{files[i]}'\nduration {1 / fps}\n" for i in order))
    out = TMP / "base-long.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(listing), "-r", str(fps), "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "16", str(out)])
    note("Lip sync", f"{base.name} {length:.2f}s extended to {duration(out):.2f}s (frames 0..{n - 1}, bounce {need - n} frames)")
    return out


def lipsync(job):
    repo = wav2lip_ready()
    line = voice(job["voice"])
    wav = TMP / f"{job['voice']}.wav"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(line), "-ar", "16000", "-ac", "1", str(wav)])
    base = extended(ROOT / job["base"], duration(wav) + 0.2)
    synced = TMP / "synced.mp4"
    pads = [str(p) for p in job.get("pads", [0, 12, 0, 0])]
    run([sys.executable, "inference.py", "--checkpoint_path", "checkpoints/wav2lip_gan.pth", "--face", str(base), "--audio", str(wav),
         "--outfile", str(synced), "--pads", *pads, "--resize_factor", "1", "--face_det_batch_size", "8", "--wav2lip_batch_size", "64"], cwd=repo)
    out = ROOT / job["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-v", "error", "-i", str(synced), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "slow", "-movflags", "+faststart", f"{out}.mp4"])
    run(["ffmpeg", "-y", "-v", "error", "-i", str(synced), "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", f"{out}.webm"])
    # Contact sheet of the mouth region, for review without downloading the clip.
    sheet = OUT / f"{Path(job['out']).name}-sheet.jpg"
    run(["ffmpeg", "-y", "-v", "error", "-i", f"{out}.mp4", "-vf", "fps=4,crop=320:320:300:180,tile=8x3", "-frames:v", "1", str(sheet)])
    note("Lip sync", f"{job['voice']} on {job['base']} -> {out.relative_to(ROOT)}.mp4 ({duration(Path(f'{out}.mp4')):.2f}s)")


def main():
    job = json.loads(Path(sys.argv[1]).read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    if job.get("probe"):
        probe()
    for t in job.get("trim", []):
        trim(t)
    for l in job.get("lipsync", []):
        lipsync(l)


if __name__ == "__main__":
    main()
