import React, { useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

// CCTV feed list (single-active selection). name should match backend SITE_LOCATION strings.
const cameraFeeds = [
  { id: 1, name: 'Area 1 - Packing', status: 'live' },
  { id: 2, name: 'Area 2 - Warehouse', status: 'live' },
  { id: 3, name: 'Area 3 - Production', status: 'live' },
];

const LiveCamsContent = ({ area = 'All' }) => {
  const [activeCameras, setActiveCameras] = useState(() =>
    cameraFeeds.reduce((accumulator, feed) => {
      accumulator[feed.id] = false;
      return accumulator;
    }, {}),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Backend API
  const BACKEND_BASE_URL = 'http://127.0.0.1:9001';
  const BACKEND_ACTIVE_URL = 'http://127.0.0.1:9001/active-camera';
  const VIDEO_FEED_URL = `${BACKEND_BASE_URL}/api/video-feed/1`;

  // Map simple area label to camera name used in cameraFeeds
  const areaToCameraName = (a) => {
    if (!a || a === 'All') return null;
    if (a.toLowerCase().includes('pack')) return 'Area 1 - Packing';
    if (a.toLowerCase().includes('ware')) return 'Area 2 - Warehouse';
    if (a.toLowerCase().includes('prod')) return 'Area 3 - Production';
    return null;
  };

  const selectedAreaName = areaToCameraName(area);

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
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleCamera = async (cameraId) => {
    // If enabling, make this the only enabled camera. If disabling, disable all.
    setIsTransitioning(true);
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
    } catch (error) {
      console.error('Failed to set active camera', error);
    } finally {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const liveClass = 'bg-[#d8e8ff] border-[#c8d6ea]';
  const disabledClass = 'bg-[#f3f5f7] border-[#c8d6ea] grayscale';

  const renderCard = (cam, size = 'small') => (
    <div
      key={cam.id}
      className={`relative rounded-sm shadow-md border ${size === 'large' ? 'aspect-video w-full lg:h-[520px]' : 'aspect-video w-full'} flex flex-col items-center justify-center overflow-hidden group transition-all duration-300 ${
        activeCameras[cam.id] ? liveClass : disabledClass
      } ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
    >
      {/* Camera info overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className={`backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-2 ${activeCameras[cam.id] ? 'bg-black/60' : 'bg-black/40'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${activeCameras[cam.id] ? 'bg-[#e24b4b] animate-pulse' : 'bg-[#6b90c3]'}`} />
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

      {activeCameras[cam.id] ? (
        <img
          key={cam.id}
          src={VIDEO_FEED_URL}
          alt={`Live feed ${cam.name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <CameraOff className="w-16 h-16 text-[#6b90c3] opacity-70" />
          <p className="mt-4 text-sm font-medium text-[#6b90c3] opacity-70">Camera feed is disabled.</p>
        </>
      )}

      {activeCameras[cam.id] ? (
        <div className="absolute bottom-4 left-4 right-4 rounded-md bg-black/55 px-3 py-2 text-left text-xs text-white backdrop-blur-sm">
          <div className="font-semibold">{cam.name}</div>
          <div className="opacity-80">Live MJPEG stream aktif</div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={`h-full min-h-0 flex flex-col font-sans transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex flex-col gap-6 w-full">
        {/* If a specific area is selected, show one large card for that area */}
        {selectedAreaName ? (
          (() => {
            const cam = cameraFeeds.find((c) => c.name === selectedAreaName);
            if (!cam) return <div className="text-sm text-[#6b90c3]">Area tidak ditemukan.</div>;
            return <div className="w-full transition-all duration-300">{renderCard(cam, 'large')}</div>;
          })()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full transition-all duration-300">
            {cameraFeeds.slice(0, 2).map((cam) => renderCard(cam, 'small'))}
          </div>
        )}

        {/* If no area filter selected, show the third camera as the large centered card */}
        {!selectedAreaName && (
          <div className="flex justify-center w-full transition-all duration-300">
            <div className="w-full lg:w-1/2">{renderCard(cameraFeeds[2], 'small')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCamsContent;