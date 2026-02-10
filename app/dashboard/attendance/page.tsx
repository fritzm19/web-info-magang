'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, AlertCircle, CheckCircle2, RefreshCw, Save, FlipHorizontal, Power, Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const isProcessingRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // UX Settings
  const [isMirrored, setIsMirrored] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // App States
  const [mode, setMode] = useState<'LOADING' | 'REGISTER' | 'CHECK_IN'>('LOADING');
  const [status, setStatus] = useState("Initializing System...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false); // 🔒 NEW LOCK STATE
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tempDescriptor, setTempDescriptor] = useState<Float32Array | null>(null);
  const [matcher, setMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const lastCheckInRef = useRef(0);

  // 1. Initialize
  useEffect(() => {
    const init = async () => {
      try {
        navigator.geolocation.getCurrentPosition(() => {}, () => setStatus("⚠️ Allow Location Access"));

        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);

        const res = await fetch('/api/user/face-descriptor');
        const data = await res.json();

        if (data.hasFace) {
           const descriptor = new Float32Array(data.descriptor);
           const labeled = new faceapi.LabeledFaceDescriptors(data.name || 'You', [descriptor]);
           setMatcher(new faceapi.FaceMatcher(labeled, 0.6));
           setMode('CHECK_IN');
           setStatus("Ready. Smile to Check In!");
        } else {
           setMode('REGISTER');
           setStatus("Registration Mode.");
        }
      } catch (err) {
        setStatus("System Error: Refresh page.");
      }
    };
    init();
  }, []);

  // 2. Camera Manager
  useEffect(() => {
    if (isCameraActive && !capturedImage && modelsLoaded) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [isCameraActive, capturedImage, modelsLoaded]);

  const startVideo = async () => {
    try {
      stopVideo(); 
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      
      streamRef.current = stream; 
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      if (mode === 'CHECK_IN') setStatus("Ready. Smile to Check In!");
      else if (mode === 'REGISTER') setStatus("Registration Mode.");

    } catch (e) {
      setStatus("Camera Error: Click Start to retry.");
      setIsCameraActive(false);
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsFaceDetected(false);
    if (!capturedImage) setStatus(""); 
  };

  // 3. ACTIONS
  const takeSnapshot = async () => {
      // 🔒 Safety Checks
      if (!videoRef.current || isSnapshotting) return;
      if (videoRef.current.paused || videoRef.current.ended) return;

      setIsSnapshotting(true); // 🔒 Lock the button
      setStatus("Processing image...");

      try {
        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

        // 🔒 Double Check: Did the camera turn off while we were waiting?
        if (!videoRef.current || videoRef.current.videoWidth === 0) {
            throw new Error("Camera disconnected during capture");
        }

        if (detection) {
            setTempDescriptor(detection.descriptor);
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                if (isMirrored) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
                ctx.drawImage(videoRef.current, 0, 0);
            }
            
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            setStatus("Face captured. Save to finish.");
            // REMOVED: setIsCameraActive(false); <--- This was causing the crash!
        } else {
            setStatus("No face detected. Try again.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Error taking photo. Try again.");
      } finally {
        setIsSnapshotting(false); // 🔓 Unlock
      }
  };

  const saveRegistration = async () => {
      if (!tempDescriptor) return;
      await fetch('/api/user/face-descriptor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(tempDescriptor) })
      });
      window.location.reload();
  };

  const resetSnapshot = () => {
      setCapturedImage(null);
      setTempDescriptor(null);
      setIsCameraActive(true); 
  };
  
  const handleCheckIn = async (match: faceapi.FaceMatch, isSmiling: boolean) => {
    if (Date.now() - lastCheckInRef.current < 10000 || isSubmittingRef.current) return;
    if (match.label === 'unknown' || !isSmiling) return; 

    isSubmittingRef.current = true;
    setStatus("Verifying Location...");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch('/api/attendance/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        });
        const json = await res.json();
        if (json.success) {
           setStatus("✅ Checked In!");
           lastCheckInRef.current = Date.now();
        } else {
           setStatus(`❌ ${json.error}`);
        }
      } catch(e) { setStatus("Network Error"); }
      finally { isSubmittingRef.current = false; }
    }, () => { setStatus("GPS Error"); isSubmittingRef.current = false; });
  };

  // 4. AI Loop
  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (!video || !modelsLoaded) return;

    const interval = setInterval(async () => {
      if (video.paused || video.ended || isProcessingRef.current || mode === 'REGISTER') return;
      isProcessingRef.current = true;

      try {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();
        
        if (mode === 'CHECK_IN' && matcher && detections.length > 0) {
             const d = detections[0];
             const match = matcher.findBestMatch(d.descriptor);
             const isSmiling = d.expressions.happy > 0.7;
             
             if (match.label !== 'unknown') {
                setIsFaceDetected(true);
                if (isSmiling) handleCheckIn(match, isSmiling);
             } else {
                setIsFaceDetected(false);
             }
        } else {
            setIsFaceDetected(false);
        }
      } catch (err) { console.log(err); } 
      finally { isProcessingRef.current = false; }
    }, 500);
    return () => clearInterval(interval);
  };

  const handleReset = async () => {
    if (!confirm("Reset Face ID?")) return;
    await fetch('/api/user/face-descriptor', { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      {/* HEADER CONTROLS */}
      <div className="mb-4 flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h1 className="font-bold text-gray-800 flex items-center gap-2">
              <Camera className="text-[#1193b5]" /> Scan Presensi
            </h1>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors border ${
                    isCameraActive 
                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                    : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                }`}
            >
                <Power size={18} />
                {isCameraActive ? "Stop Cam" : "Start Cam"}
            </button>

            <button 
                onClick={() => setIsMirrored(!isMirrored)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isMirrored 
                        ? 'bg-[#1193b5] text-white border-[#1193b5] shadow-sm' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                title="Toggle Mirror"
            >
                <FlipHorizontal size={18} />
                <span className="hidden md:inline">{isMirrored ? "Mirrored" : "Normal"}</span>
            </button>
        </div>
      </div>

      {/* CAMERA VIEWPORT */}
      <div className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-lg transition-all md:aspect-[16/9] aspect-[3/4] 
        ${isFaceDetected && isCameraActive ? 'ring-4 ring-green-500' : ''}
      `}>
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          {!isCameraActive ? (
            <div className="text-center text-gray-500 animate-in fade-in duration-300">
                <Power size={48} className="mx-auto mb-2 opacity-50" />
                <p>Camera is Off</p>
                <button onClick={() => setIsCameraActive(true)} className="mt-4 text-[#1193b5] hover:text-blue-400 font-bold underline">Turn On</button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video 
                ref={videoRef} 
                autoPlay muted playsInline 
                onPlay={handleVideoPlay}
                className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
            />
          )}

          {/* STATUS PILL */}
          {(status && isCameraActive) || status.includes("Captured") ? (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-auto">
                <div className={`px-6 py-3 rounded-full backdrop-blur-md font-medium flex items-center gap-2 shadow-lg transition-all
                    ${status.includes('✅') ? 'bg-green-500/90 text-white' : 
                      status.includes('❌') ? 'bg-red-500/90 text-white' : 
                      'bg-black/60 text-white'
                    }
                `}>
                    {(status.includes("Verifying") || isSnapshotting) && <Loader2 className="animate-spin" size={18} />}
                    {status.includes('✅') && <CheckCircle2 size={18}/>}
                    {status.includes('❌') && <AlertCircle size={18}/>}
                    {status}
                </div>
             </div>
          ) : null}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-6 flex flex-col items-center gap-4">
         {mode === 'REGISTER' && !capturedImage && isCameraActive && (
             <button 
                onClick={takeSnapshot} 
                disabled={isSnapshotting}
                className={`px-12 py-4 rounded-full font-bold text-lg shadow-xl transition flex items-center gap-2
                    ${isSnapshotting 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                        : 'bg-[#1193b5] text-white hover:scale-105 hover:bg-blue-600'
                    }`}
             >
                {isSnapshotting ? (
                    <>Processing...</>
                ) : (
                    <><Camera size={24} /> Ambil Foto</>
                )}
             </button>
         )}
         {mode === 'REGISTER' && capturedImage && (
             <div className="flex gap-4">
                <button onClick={resetSnapshot} className="px-6 py-3 bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition">Ulangi</button>
                <button onClick={saveRegistration} className="px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition">Simpan</button>
             </div>
         )}
         <button onClick={handleReset} className="text-xs text-red-300 hover:text-red-500 underline">[DEV] Reset</button>
      </div>
    </div>
  );
}