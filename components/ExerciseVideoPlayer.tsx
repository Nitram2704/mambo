import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

interface ExerciseVideoPlayerProps {
    videoUrl?: string;
    thumbnailUrl?: string;
    title?: string;
    autoplay?: boolean;
    showControls?: boolean;
    className?: string;
}

export function ExerciseVideoPlayer({
    videoUrl,
    thumbnailUrl,
    title,
    autoplay = false,
    showControls = true,
    className = ""
}: ExerciseVideoPlayerProps) {
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [isLoading, setIsLoading] = useState(true);
    const [showControlsOverlay, setShowControlsOverlay] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Auto-hide controls after 3 seconds
    useEffect(() => {
        if (showControls && isPlaying) {
            const timer = setTimeout(() => {
                setShowControlsOverlay(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showControls, isPlaying, showControlsOverlay]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        setStatus(status);
        setIsLoading(!status.isLoaded || (status.isLoaded && status.isBuffering));

        // Check if video finished playing
        if (status.isLoaded && !status.isPlaying && status.positionMillis > 0 &&
            status.durationMillis && status.positionMillis >= status.durationMillis - 1000) {
            setIsPlaying(false);
            setShowControlsOverlay(true);
        }
    };

    const togglePlayPause = async () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
        } else {
            await videoRef.current.playAsync();
            setIsPlaying(true);
        }
        setShowControlsOverlay(true);
    };

    const togglePlaybackRate = async () => {
        if (!videoRef.current) return;

        const newRate = playbackRate === 1.0 ? 0.5 : 1.0;
        setPlaybackRate(newRate);
        await videoRef.current.setRateAsync(newRate, true);
    };

    const toggleFullscreen = () => {
        // For now, just show an alert. Fullscreen implementation would require more complex logic
        Alert.alert(
            "Pantalla Completa",
            "La funcionalidad de pantalla completa estará disponible próximamente.",
            [{ text: "OK" }]
        );
    };

    const seekBackward = async () => {
        if (!videoRef.current || !status?.isLoaded) return;
        const newPosition = Math.max(0, status.positionMillis - 10000); // 10 seconds back
        await videoRef.current.setPositionAsync(newPosition);
    };

    const seekForward = async () => {
        if (!videoRef.current || !status?.isLoaded) return;
        const duration = status.durationMillis || 0;
        const newPosition = Math.min(duration, status.positionMillis + 10000); // 10 seconds forward
        await videoRef.current.setPositionAsync(newPosition);
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // If no video URL, show placeholder
    if (!videoUrl) {
        return (
            <View className={`bg-gray-800 rounded-xl items-center justify-center ${className}`}
                style={{ height: VIDEO_HEIGHT }}>
                <Ionicons name="videocam-off" size={48} color="#6b7280" />
                <Animated.Text
                    entering={FadeIn}
                    className="text-gray-400 text-center mt-2 px-4">
                    Video no disponible
                </Animated.Text>
            </View>
        );
    }

    // For YouTube URLs, we'll show a placeholder for now
    // In a production app, you'd integrate react-native-youtube-iframe
    const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    if (isYouTubeUrl) {
        return (
            <View className={`bg-gray-800 rounded-xl items-center justify-center ${className}`}
                style={{ height: VIDEO_HEIGHT }}>
                <TouchableOpacity
                    onPress={() => Alert.alert("YouTube Video", "Abrir en navegador externo?")}
                    className="items-center">
                    <Ionicons name="logo-youtube" size={48} color="#ff0000" />
                    <Animated.Text
                        entering={FadeIn}
                        className="text-white text-center mt-2 px-4 font-medium">
                        Ver tutorial en YouTube
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeIn.delay(200)}
                        className="text-gray-400 text-center mt-1 px-4 text-sm">
                        {title || "Tutorial instructivo"}
                    </Animated.Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className={`relative ${className}`}>
            <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={{
                    width: SCREEN_WIDTH - 32, // Account for padding
                    height: VIDEO_HEIGHT,
                    borderRadius: 12,
                }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={autoplay}
                useNativeControls={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
                onError={(error) => {
                    console.error('Video error:', error);
                    setIsLoading(false);
                    Alert.alert('Error', 'No se pudo cargar el video');
                }}
            />

            {/* Tap to show controls (background) */}
            <TouchableOpacity
                onPress={() => setShowControlsOverlay(!showControlsOverlay)}
                className="absolute inset-0"
                activeOpacity={1}
            />

            {/* Loading overlay */}
            {isLoading && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center pointer-events-none">
                    <ActivityIndicator size="large" color="#60a5fa" />
                </Animated.View>
            )}

            {/* Controls overlay */}
            {showControls && showControlsOverlay && !isLoading && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="absolute inset-0 bg-black/30 rounded-xl pointer-events-box-none">
                    {/* Top controls */}
                    <View className="flex-row justify-between items-center p-4">
                        <TouchableOpacity
                            onPress={togglePlaybackRate}
                            className="bg-black/50 rounded-full p-2">
                            <Animated.Text
                                entering={FadeIn}
                                className="text-white text-sm font-bold">
                                {playbackRate === 1.0 ? '1x' : '0.5x'}
                            </Animated.Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleFullscreen}
                            className="bg-black/50 rounded-full p-2">
                            <Ionicons name="expand" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Center play/pause button */}
                    <View className="flex-1 items-center justify-center">
                        <TouchableOpacity
                            onPress={togglePlayPause}
                            className="bg-black/50 rounded-full p-4">
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={32}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom controls */}
                    <View className="p-4">
                        {/* Progress bar would go here */}
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={seekBackward}
                                className="bg-black/50 rounded-full p-2">
                                <Ionicons name="play-back" size={20} color="white" />
                            </TouchableOpacity>

                            <View className="flex-1 mx-4">
                                {status?.isLoaded && (
                                    <Animated.Text
                                        entering={FadeIn}
                                        className="text-white text-center text-sm">
                                        {formatTime(status.positionMillis)} / {formatTime(status.durationMillis || 0)}
                                    </Animated.Text>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={seekForward}
                                className="bg-black/50 rounded-full p-2">
                                <Ionicons name="play-forward" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}