import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const Card = ({ children }) => (
    <div
        style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '18px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
            padding: '20px',
            backdropFilter: 'blur(10px)',
        }}
    >
        {children}
    </div>
);

const fetchHealth = async () => {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
};

function CameraApp() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [apiStatus, setApiStatus] = useState('checking');
    const [camStatus, setCamStatus] = useState('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const data = await fetchHealth();
                if (cancelled) return;
                setApiStatus(data.ok ? 'up' : 'down');
            } catch (err) {
                if (cancelled) return;
                setApiStatus('down');
            }
        };

        load();
        const id = setInterval(load, 5000);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    const headline = useMemo(() => {
        const apiOk = apiStatus === 'up';
        const camOk = camStatus === 'on';
        if (apiOk && camOk) return 'React + Laravel + Camera = Success';
        if (!apiOk) return 'Laravel API not reachable yet';
        if (camStatus === 'error') return 'Camera blocked or unavailable';
        return 'Turn on your camera to complete the check';
    }, [apiStatus, camStatus]);

    const startCamera = async () => {
        try {
            setCamStatus('starting');
            setMessage('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCamStatus('on');
            setMessage('');
        } catch (err) {
            setCamStatus('error');
            setMessage(err?.message || 'Unable to access camera.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCamStatus('idle');
        setMessage('Camera stopped.');
    };

    useEffect(() => () => stopCamera(), []);

    return (
        <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ margin: 0, opacity: 0.75 }}>Camera preview</p>
                        <h1 style={{ margin: '4px 0 0', fontSize: '1.8rem' }}>{headline}</h1>
                        <p style={{ margin: '6px 0 0', opacity: 0.7 }}>
                            API: {apiStatus} • Camera: {camStatus}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={startCamera}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #22c55e',
                                background: '#22c55e',
                                color: '#0b1021',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Start Camera
                        </button>
                        <button
                            onClick={stopCamera}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                background: 'transparent',
                                color: '#e2e8f0',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Stop
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '12px',
                    }}
                >
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <video
                                ref={videoRef}
                                style={{
                                    width: '100%',
                                    borderRadius: '14px',
                                    background: '#0b1021',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                }}
                                playsInline
                                muted
                            />
                            <p style={{ margin: 0, opacity: 0.75 }}>
                                If you do not see your camera, click “Start Camera” and allow browser access. Stop it any time with “Stop”.
                            </p>
                        </div>
                    </Card>
                </div>

                {message ? (
                    <div
                        style={{
                            background: '#0f172a',
                            color: '#e2e8f0',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            padding: '12px 14px',
                            borderRadius: '12px',
                        }}
                    >
                        {message}
                    </div>
                ) : null}
            </div>
        </Card>
    );
}

const container = document.getElementById('react-root');
if (container) {
    const root = createRoot(container);
    root.render(<CameraApp />);
}
