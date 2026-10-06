"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Camera,
  CameraOff,
  ChevronLeft,
  LoaderCircle,
  Mic,
  MicOff,
  ShieldCheck,
} from "lucide-react";
import { createAnalyzer } from "@/analyzers/registry";
import type { AnalyzerResult, ExerciseDefinition } from "@/analyzers/types";
import { MediaPipePoseEngine } from "@/pose/mediapipe-engine";
import { assessTracking } from "@/pose/reliability";
import type { PoseLandmark, TrackingReliability } from "@/pose/types";
import { WorkoutSession, type Workout } from "@/workouts/session";
import { exportWorkouts, saveWorkout } from "@/workouts/store";

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28], [27, 29], [29, 31], [28, 30], [30, 32],
] as const;

type CameraState =
  | "idle"
  | "requesting"
  | "initializing"
  | "running"
  | "denied"
  | "unavailable"
  | "error";

function drawLandmarks(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: PoseLandmark[] | null,
) {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, width, height);
  if (!landmarks) return;

  context.lineWidth = Math.max(2, width / 420);
  context.strokeStyle = "rgba(165, 255, 214, 0.82)";
  context.fillStyle = "#5fffb4";
  context.shadowColor = "rgba(95, 255, 180, 0.6)";
  context.shadowBlur = 8;

  for (const [from, to] of CONNECTIONS) {
    const start = landmarks[from];
    const end = landmarks[to];
    if ((start.visibility ?? 0) < 0.45 || (end.visibility ?? 0) < 0.45) continue;
    context.beginPath();
    context.moveTo((1 - start.x) * width, start.y * height);
    context.lineTo((1 - end.x) * width, end.y * height);
    context.stroke();
  }

  landmarks.forEach((landmark) => {
    if ((landmark.visibility ?? 0) < 0.45) return;
    context.beginPath();
    context.arc(
      (1 - landmark.x) * width,
      landmark.y * height,
      Math.max(3, width / 260),
      0,
      Math.PI * 2,
    );
    context.fill();
  });
}

export function CameraCoach({
  exercise,
  onBack,
}: {
  exercise: ExerciseDefinition;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<MediaPipePoseEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const runInferenceRef = useRef<() => void>(() => undefined);
  const lastInferenceRef = useRef(0);
  const reliabilityRef = useRef<TrackingReliability | null>(null);
  const lastSpokenRef = useRef({ message: "", at: 0 });
  const voiceEnabledRef = useRef(false);
  const sessionRef = useRef<WorkoutSession | null>(null);
  const [analyzer] = useState(() => createAnalyzer(exercise.id));
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [reliability, setReliability] = useState<TrackingReliability>({
    state: "no_pose",
    message: "Camera is off",
    detail: "Start the camera when your device is in position.",
  });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [processingMs, setProcessingMs] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzerResult | null>(null);
  const [pendingWorkout, setPendingWorkout] = useState<Workout | null>(null);
  const [saveState, setSaveState] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
    if (!voiceEnabled) window.speechSynthesis?.cancel();
  }, [voiceEnabled]);

  const stopCamera = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    engineRef.current?.dispose();
    engineRef.current = null;
    analyzer.reset();
    window.speechSynthesis?.cancel();
    if (videoRef.current) videoRef.current.srcObject = null;
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setCameraState("idle");
    setProcessingMs(null);
    setAnalysis(null);
    setReliability({
      state: "no_pose",
      message: "Camera is off",
      detail: "Start the camera when your device is in position.",
    });
  }, [analyzer]);

  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => {
    const warnAboutUnsavedWorkout = (event: BeforeUnloadEvent) => {
      if (pendingWorkout || sessionRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warnAboutUnsavedWorkout);
    return () =>
      window.removeEventListener("beforeunload", warnAboutUnsavedWorkout);
  }, [pendingWorkout]);

  function finishSession() {
    if (sessionRef.current) {
      setPendingWorkout(sessionRef.current.finish());
    }
    sessionRef.current = null;
    stopCamera();
  }

  async function persistWorkout() {
    if (!pendingWorkout || saving) return;
    setSaving(true);
    try {
      await saveWorkout(pendingWorkout);
      setPendingWorkout(null);
      setSaveState("Workout saved on this device. View it in Progress.");
    } catch {
      setSaveState(
        "Could not save. Keep this page open and retry, or export the unsaved summary.",
      );
    } finally {
      setSaving(false);
    }
  }

  const publishReliability = useCallback((next: TrackingReliability) => {
    if (
      reliabilityRef.current?.state !== next.state ||
      reliabilityRef.current?.message !== next.message
    ) {
      reliabilityRef.current = next;
      setReliability(next);
    }

    const now = Date.now();
    if (
      voiceEnabledRef.current &&
      next.message !== lastSpokenRef.current.message &&
      now - lastSpokenRef.current.at > 4500 &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(next.message);
      utterance.rate = 0.95;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = { message: next.message, at: now };
    }
  }, []);

  const runInference = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!video || !canvas || !engine) return;

    const now = performance.now();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && now - lastInferenceRef.current >= 66) {
      lastInferenceRef.current = now;
      try {
        const frame = engine.estimate(video, now);
        drawLandmarks(canvas, video, frame.landmarks);
        const tracking = assessTracking(frame.landmarks);
        if (tracking.state === "ready" && frame.landmarks) {
          const result = analyzer.update(frame.landmarks, frame.capturedAt);
          setAnalysis(result);
          sessionRef.current?.record(result);
          const primary = result.feedback[0];
          publishReliability({
            state: result.reliable ? "ready" : "limited",
            message: primary?.message ?? "Position clear",
            detail: result.reliable
              ? "Stage: " + result.stage + " · " + Math.round(result.confidence * 100) + "% landmark confidence"
              : "Adjust the camera before relying on posture feedback.",
          });
        } else {
          analyzer.pause?.(frame.capturedAt);
          setAnalysis(null);
          publishReliability(tracking);
        }
        setProcessingMs(Math.round(frame.processingMs));
      } catch {
        setCameraState("error");
        return;
      }
    }
    animationRef.current = requestAnimationFrame(() => runInferenceRef.current());
  }, [analyzer, publishReliability]);

  useEffect(() => {
    runInferenceRef.current = runInference;
  }, [runInference]);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      return;
    }

    setCameraState("requesting");
    setSaveState("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Video element unavailable.");
      video.srcObject = stream;
      await video.play();

      setCameraState("initializing");
      const engine = new MediaPipePoseEngine();
      engineRef.current = engine;
      await engine.initialize();
      setCameraState("running");
      sessionRef.current = new WorkoutSession(exercise.id, analyzer.version);
      publishReliability({
        state: "no_pose",
        message: "Step into frame",
        detail: "Keep your shoulders, hips, knees, and ankles visible.",
      });
      animationRef.current = requestAnimationFrame(() => runInferenceRef.current());
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      engineRef.current?.dispose();
      engineRef.current = null;
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setCameraState("denied");
      } else {
        setCameraState("error");
      }
    }
  }

  const busy = cameraState === "requesting" || cameraState === "initializing";
  const progressValue = exercise.tracking === "Repetitions"
    ? String(analysis?.repetitions ?? 0)
    : ((analysis?.holdMs ?? 0) / 1000).toFixed(1) + " s";
  const angleSummary = analysis
    ? Object.entries(analysis.angles).map(([name, value]) => name + " " + value + (name.includes("Ratio") ? "" : "°")).join(" · ")
    : "—";

  return (
    <section className="camera-workspace" aria-label={exercise.name + " camera setup"}>
      <header className="camera-toolbar">
        <button
          className="icon-text-button"
          type="button"
          onClick={() => {
            if (
              (pendingWorkout || sessionRef.current) &&
              !window.confirm("Leave and discard this unsaved workout?")
            ) {
              return;
            }
            sessionRef.current = null;
            setPendingWorkout(null);
            stopCamera();
            onBack();
          }}
        >
          <ChevronLeft size={18} aria-hidden="true" /> Exercises
        </button>
        <div><span className="beta-label">BETA</span><strong>{exercise.name}</strong></div>
        <button
          className="voice-button"
          type="button"
          aria-pressed={voiceEnabled}
          onClick={() => setVoiceEnabled((value) => !value)}
        >
          {voiceEnabled ? <Mic size={17} /> : <MicOff size={17} />}
          {voiceEnabled ? "Voice on" : "Voice off"}
        </button>
      </header>

      <div className="camera-layout">
        <div className="camera-viewport">
          <video ref={videoRef} muted playsInline aria-label="Live mirrored camera preview" />
          <canvas ref={canvasRef} aria-hidden="true" />
          <div className="frame-guide" aria-hidden="true"><span /><span /><span /><span /></div>
          {cameraState !== "running" && (
            <div className="camera-gate">
              {busy ? <LoaderCircle className="spin" aria-hidden="true" /> : <Camera aria-hidden="true" />}
              <h2>
                {cameraState === "idle" && "Camera ready when you are"}
                {cameraState === "requesting" && "Waiting for camera permission"}
                {cameraState === "initializing" && "Loading private pose analysis"}
                {cameraState === "denied" && "Camera permission was denied"}
                {cameraState === "unavailable" && "Camera access is unavailable"}
                {cameraState === "error" && "Camera setup could not start"}
              </h2>
              <p>
                {cameraState === "denied"
                  ? "Allow camera access in your browser settings, then try again."
                  : cameraState === "error"
                    ? "Close other camera apps and check that this browser supports WebAssembly."
                    : "Video frames stay in this browser and are not uploaded."}
              </p>
              {!busy && !pendingWorkout && (
                <button className="button button-primary" type="button" onClick={startCamera}>
                  <Camera size={17} /> {cameraState === "idle" ? "Enable camera" : "Try again"}
                </button>
              )}
            </div>
          )}
          {cameraState === "running" && (
            <div className="camera-live-badge"><span /> LIVE · ON DEVICE</div>
          )}
        </div>

        <aside className="camera-feedback" aria-live="polite" aria-atomic="true">
          {pendingWorkout && (
            <div className="session-summary">
              <h3>Session finished</h3>
              <p>
                {Math.round(pendingWorkout.durationMs / 1000)} seconds ·{" "}
                {pendingWorkout.repetitions} repetitions.{" "}
                {pendingWorkout.reliableSamples === 0
                  ? "No reliable movement was assessed."
                  : "Beta movement summary ready."}
              </p>
              <button
                className="button button-primary"
                type="button"
                disabled={saving}
                onClick={persistWorkout}
              >
                {saving ? "Saving…" : "Save workout"}
              </button>
              <button
                className="button button-ghost"
                type="button"
                onClick={() => exportWorkouts([pendingWorkout])}
              >
                Export unsaved summary
              </button>
              <button
                className="button button-ghost"
                type="button"
                disabled={saving}
                onClick={() => {
                  if (window.confirm("Discard this unsaved summary?")) {
                    setPendingWorkout(null);
                  }
                }}
              >
                Discard summary
              </button>
            </div>
          )}
          {saveState && <p role="status">{saveState}</p>}
          <div className={"reliability-orb reliability-" + reliability.state}>
            {reliability.state === "ready" ? <ShieldCheck /> : <CameraOff />}
          </div>
          <p className="eyebrow">CAMERA FEEDBACK</p>
          <h2>{reliability.message}</h2>
          <p>{reliability.detail}</p>
          <div className="camera-stats">
            <span>Pose model<strong>{cameraState === "running" ? "Active" : "Standby"}</strong></span>
            <span>{exercise.tracking}<strong>{progressValue}</strong></span>
            <span>Movement stage<strong>{analysis?.stage ?? "—"}</strong></span>
            <span>Form signal<strong>{analysis?.formScore === null || analysis?.formScore === undefined ? "—" : analysis.formScore + "/100"}</strong></span>
            <span>Joint angles<strong className="angle-summary">{angleSummary}</strong></span>
            <span>Frame processing<strong>{processingMs === null ? "—" : String(processingMs) + " ms"}</strong></span>
          </div>
          <details className="analyzer-details">
            <summary>What this Beta checks</summary>
            <p><strong>Needs:</strong> {exercise.requiredLandmarks}</p>
            <p>{exercise.limitations}</p>
          </details>
          {cameraState === "running" && (
            <button className="button button-ghost stop-camera" type="button" onClick={finishSession}>
              <CameraOff size={17} /> Finish session
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
