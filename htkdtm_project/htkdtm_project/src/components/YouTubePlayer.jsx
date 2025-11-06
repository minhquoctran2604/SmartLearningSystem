import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * YouTube Player Component with Progress Tracking
 * Uses YouTube IFrame API to track video progress
 */
const YouTubePlayer = ({
  videoUrl,
  trackingId,
  context = "lesson",
  initialProgress = 0,
  onProgressUpdate,
  onComplete,
}) => {
  const playerDivRef = useRef(null);
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const progressInterval = useRef(null);
  const lastTrackedPercent = useRef(initialProgress);
  const isTrackingRef = useRef(false);

  // Update lastTrackedPercent when initialProgress changes
  useEffect(() => {
    lastTrackedPercent.current = initialProgress;
    console.log(
      `Updated lastTrackedPercent to ${initialProgress}% for ${context} ${trackingId}`
    );
  }, [initialProgress, trackingId, context]);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url) return null;

    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Initialize YouTube IFrame API
  useEffect(() => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      console.error('Invalid YouTube URL:', videoUrl);
      return;
    }

    // Load YouTube IFrame API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Define callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        createPlayer(videoId);
      };
    } else if (window.YT && window.YT.Player) {
      // API already loaded
      createPlayer(videoId);
    }

    // Cleanup
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoUrl]);

  // Create YouTube player instance
  const createPlayer = (videoId) => {
    const newPlayer = new window.YT.Player(playerDivRef.current, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        controls: 1,
        origin: "http://localhost:5173"
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });

    setPlayer(newPlayer);
    playerRef.current = newPlayer;
  };

  // Player ready event
  const onPlayerReady = (event) => {
    console.log(
      `YouTube player ready for ${context} ${trackingId}, initial progress: ${initialProgress}%`
    );
    playerRef.current = event.target;
    setIsReady(true);
  };

  // Player state change event
  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!isTrackingRef.current) {
        console.log('Video playing, starting progress tracking...');
        isTrackingRef.current = true;
        startProgressTracking();
      }
    } else if (event.data === window.YT.PlayerState.PAUSED ||
               event.data === window.YT.PlayerState.ENDED) {
      console.log('Video paused/ended, stopping progress tracking...');
      isTrackingRef.current = false;
      stopProgressTracking();

      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        sendProgressUpdate();
      }

      if (event.data === window.YT.PlayerState.ENDED) {
        handleVideoComplete();
      }
    }
  };

  // Send progress update to backend
  const sendProgressUpdate = useCallback(() => {
    if (!playerRef.current || !playerRef.current.getCurrentTime || !playerRef.current.getDuration) {
      return;
    }

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();

      if (duration > 0) {
        const currentPercent = Math.floor((currentTime / duration) * 100);

        if (currentPercent >= lastTrackedPercent.current || currentPercent >= 100 || lastTrackedPercent.current === 0) {
          const progressData = {
            video_watched_percent: Math.min(currentPercent, 100),
            time_spent: Math.floor(currentTime),
            video_completed: currentPercent >= 95
          };

          console.log(
            `✅ Sending progress update for ${context} ${trackingId}:`,
            progressData
          );

          if (onProgressUpdate) {
            onProgressUpdate(progressData);
          }

          lastTrackedPercent.current = currentPercent;

          if (currentPercent >= 95 && onComplete) {
            onComplete();
          }
        }
      }
    } catch (error) {
      console.error('Error sending progress update:', error);
    }
  }, [trackingId, context, onProgressUpdate, onComplete]);

  // Start tracking progress
  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    sendProgressUpdate();

    const intervalId = setInterval(() => {
      sendProgressUpdate();
    }, 10000); // Every 10 seconds

    progressInterval.current = intervalId;
  }, [sendProgressUpdate]);

  // Stop tracking progress
  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Handle video completion
  const handleVideoComplete = () => {
    const progressData = {
      video_watched_percent: 100,
      time_spent: playerRef.current && playerRef.current.getDuration ? Math.floor(playerRef.current.getDuration()) : 0,
      video_completed: true
    };

    console.log(`Video completed for ${context} ${trackingId}:`, progressData);

    if (onProgressUpdate) {
      onProgressUpdate(progressData);
    }

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="youtube-player-container w-full aspect-video bg-black rounded-xl overflow-hidden">
      <div ref={playerDivRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Đang tải video...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;