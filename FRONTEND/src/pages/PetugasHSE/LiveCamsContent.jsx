import React, { useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

// CCTV feed list (single-active selection). name should match backend SITE_LOCATION strings.
const cameraFeeds = [
  { id: 1, name: 'Area 1 - Packing', status: 'live' },
  { id: 2, name: 'Area 2 - Warehouse', status: 'live' },
  { id: 3, name: 'Area 3 - Production', status: 'live' },
];

const LiveCamsContent = () => {
  const [activeCameras, setActiveCameras] = useState(() =>
    cameraFeeds.reduce((accumulator, feed) => {
      accumulator[feed.id] = false;
      return accumulator;
    }, {}),
  );

  // Backend API
  const BACKEND_ACTIVE_URL = 'http://127.0.0.1:9001/active-camera';

  // load current active camera from backend on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(BACKEND_ACTIVE_URL);
        if (!mounted) return;
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.cameraId) {
          setActiveCameras(() => {
            const next = {};
            cameraFeeds.forEach((f) => {
              next[f.id] = f.id === data.cameraId;
            });
            return next;
          });
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleCamera = async (cameraId) => {
    // If enabling, make this the only enabled camera. If disabling, disable all.
    const willEnable = !activeCameras[cameraId];
    const next = {};
    cameraFeeds.forEach((f) => {
      next[f.id] = willEnable ? f.id === cameraId : false;
    });
    setActiveCameras(next);

    // send to backend
    const cam = cameraFeeds.find((c) => c.id === cameraId);
    try {
      await fetch(BACKEND_ACTIVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraId: willEnable ? cam.id : null, name: willEnable ? cam.name : null }),
      });
    } catch (e) {
      console.error('Failed to set active camera', e);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col font-sans">
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {cameraFeeds.slice(0, 2).map((cam) => (
            <div 
              key={cam.id} 
              className={`relative rounded-sm shadow-md border aspect-video w-full flex flex-col items-center justify-center overflow-hidden group transition-all duration-200 ${
                activeCameras[cam.id]
                  ? 'bg-[#d8dfe8] border-[#c8d6ea]'
                  : 'bg-[#edf1f6] border-[#c8d6ea] grayscale'
              }`}
            >
              {/* Camera info overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <div className={`backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-2 ${activeCameras[cam.id] ? 'bg-black/60' : 'bg-black/40'}`}>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      activeCameras[cam.id] ? 'bg-[#e24b4b] animate-pulse' : 'bg-[#6b90c3]'
                    }`}
                  />
                  <span className="text-white text-xs font-bold tracking-wider uppercase">
                    {activeCameras[cam.id] ? 'Live' : 'Disabled'}
                  </span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md">
                  <span className="text-white text-xs font-medium tracking-wide">{cam.name}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleCamera(cam.id)}
                className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#00265d] shadow-sm transition-colors hover:bg-white"
              >
                {activeCameras[cam.id] ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                {activeCameras[cam.id] ? 'Disable' : 'Enable'}
              </button>

              {/* Placeholder icon (until stream is loaded) */}
              {activeCameras[cam.id] ? (
                <Camera className="w-16 h-16 text-[#96b0d5] opacity-50 group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <CameraOff className="w-16 h-16 text-[#6b90c3] opacity-70" />
              )}
              <p className="mt-4 text-sm font-medium text-[#6b90c3] opacity-70">
                {activeCameras[cam.id] ? 'Waiting for video signal...' : 'Camera feed is disabled.'}
              </p>
              
              {/* Add <video> tag or CCTV stream iframe here */}
              {/* <video src="..." autoPlay muted className="absolute inset-0 w-full h-full object-cover" /> */}
            </div>
          ))}
        </div>

        {cameraFeeds.length > 2 && (
          <div className="flex justify-center w-full">
            <div className="relative bg-[#d8dfe8] rounded-sm shadow-md border border-[#c8d6ea] aspect-video w-full lg:w-1/2 flex flex-col items-center justify-center overflow-hidden group">
              
              {/* Camera info overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e24b4b] animate-pulse"></span>
                  <span className="text-white text-xs font-bold tracking-wider uppercase">Live</span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md">
                  <span className="text-white text-xs font-medium tracking-wide">{cameraFeeds[2].name}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleCamera(cameraFeeds[2].id)}
                className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#00265d] shadow-sm transition-colors hover:bg-white"
              >
                {activeCameras[cameraFeeds[2].id] ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                {activeCameras[cameraFeeds[2].id] ? 'Disable' : 'Enable'}
              </button>

              {/* Placeholder icon */}
              {activeCameras[cameraFeeds[2].id] ? (
                <Camera className="w-16 h-16 text-[#96b0d5] opacity-50 group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <CameraOff className="w-16 h-16 text-[#6b90c3] opacity-70" />
              )}
              <p className="mt-4 text-sm font-medium text-[#6b90c3] opacity-70">
                {activeCameras[cameraFeeds[2].id] ? 'Waiting for video signal...' : 'Camera feed is disabled.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCamsContent;