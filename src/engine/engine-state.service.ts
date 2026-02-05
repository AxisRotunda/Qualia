
import { Injectable, signal, computed } from '@angular/core';
import { WeatherType } from '../services/particle.service';
import { Entity } from './schema';
import { NullShield } from './utils/string.utils';

export interface DebugState {
    paused: boolean;
    bodyCount: number;
    activeBodyCount: number;
    sleepingBodyCount: number;
    visibleMeshCount: number;
    totalMeshCount: number;
    transformCount: number;
    singleUpdate: null;
}

export interface LoadingTelemetry {
    entityCount: number;
    elapsedTime: number;
    totalAssets: number;
    completedAssets: number;
}

export interface TargetInfo {
    entityId: number;
    name: string;
    distance: number;
    type: string;
}

@Injectable({
    providedIn: 'root'
})
export class EngineStateService {
    private _playerEntity = signal<Entity | null>(null);
    private _playerSpeed = signal(0); // Industry: Locomotion telemetry
    private _isCrouching = signal(false); // [NEW] Stance state
    private _fps = signal(0);
    private _physicsTime = signal(0);
    private _renderTime = signal(0);
    private _loading = signal(true);
    private _loadingProgress = signal(0);
    private _loadingStage = signal('INITIALIZING');
    private _loadingDetail = signal('');
    private _loadingTelemetry = signal<LoadingTelemetry>({
        entityCount: 0,
        elapsedTime: 0,
        totalAssets: 0,
        completedAssets: 0
    });

    // Tactical State
    private _isAiming = signal(false);
    private _acquiredTarget = signal<TargetInfo | null>(null);
    private _hitMarkerActive = signal(false);

    // Crash / Diagnostic State
    private _isCriticalFailure = signal(false);
    private _loadError = signal<string | null>(null);

    private _isPaused = signal(false);
    private _timeScale = signal(1.0);
    private _mainMenuVisible = signal(true);
    private _hudVisible = signal(true);
    private _gravityY = signal(-9.81);
    private _wireframe = signal(false);
    private _texturesEnabled = signal(false);
    private _postProcessingEnabled = signal(true);
    private _showPhysicsDebug = signal(false);
    private _sunIntensity = signal(1.5);
    private _ambientIntensity = signal(0.4);
    private _sunColor = signal('#ffffff');
    private _bloomStrength = signal(0.45);
    private _bloomThreshold = signal(1.05);
    private _grainIntensity = signal(0.0);
    private _vignetteIntensity = signal(0.95);
    private _aberrationIntensity = signal(0.0);
    private _timeOfDay = signal(12);
    private _dayNightActive = signal(false);
    private _dayNightSpeed = signal(0.1);
    private _weather = signal<WeatherType>('clear');
    private _atmosphere = signal('clear');
    private _baseAtmosphere = signal('clear'); // Tracks original biome atmosphere
    private _isUnderwater = signal(false);
    private _waterLevel = signal<number | null>(null);
    private _waveTimeScale = signal(1.0);
    private _transformMode = signal<'translate' | 'rotate' | 'scale'>('translate');
    private _mode = signal<'edit' | 'explore' | 'walk'>('edit');
    private _viewMode = signal<'fp' | 'tp'>('fp');
    private _currentSceneId = signal<string | null>(null);
    private _isPlacementActive = signal(false);
    private _canUndo = signal(false);
    private _canRedo = signal(false);
    private _showDebugOverlay = signal(false);
    private _debugInfo = signal<DebugState>({
        paused: false,
        bodyCount: 0,
        activeBodyCount: 0,
        sleepingBodyCount: 0,
        visibleMeshCount: 0,
        totalMeshCount: 0,
        transformCount: 0,
        singleUpdate: null
    });

    readonly playerEntity = this._playerEntity.asReadonly();
    readonly playerSpeed = this._playerSpeed.asReadonly();
    readonly isCrouching = this._isCrouching.asReadonly();
    readonly fps = this._fps.asReadonly();
    readonly physicsTime = this._physicsTime.asReadonly();
    readonly renderTime = this._renderTime.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly loadingProgress = this._loadingProgress.asReadonly();
    readonly loadingStage = this._loadingStage.asReadonly();
    readonly loadingDetail = this._loadingDetail.asReadonly();
    readonly loadingTelemetry = this._loadingTelemetry.asReadonly();

    // Tactical signals
    readonly isAiming = this._isAiming.asReadonly();
    readonly acquiredTarget = this._acquiredTarget.asReadonly();
    readonly hitMarkerActive = this._hitMarkerActive.asReadonly();

    readonly isCriticalFailure = this._isCriticalFailure.asReadonly();
    readonly loadError = this._loadError.asReadonly();

    readonly isPaused = this._isPaused.asReadonly();
    readonly timeScale = this._timeScale.asReadonly();
    readonly mainMenuVisible = this._mainMenuVisible.asReadonly();
    readonly hudVisible = this._hudVisible.asReadonly();
    readonly gravityY = this._gravityY.asReadonly();
    readonly wireframe = this._wireframe.asReadonly();
    readonly texturesEnabled = this._texturesEnabled.asReadonly();
    readonly postProcessingEnabled = this._postProcessingEnabled.asReadonly();
    readonly showPhysicsDebug = this._showPhysicsDebug.asReadonly();
    readonly sunIntensity = this._sunIntensity.asReadonly();
    readonly ambientIntensity = this._ambientIntensity.asReadonly();
    readonly sunColor = this._sunColor.asReadonly();
    readonly bloomStrength = this._bloomStrength.asReadonly();
    readonly bloomThreshold = this._bloomThreshold.asReadonly();
    readonly grainIntensity = this._grainIntensity.asReadonly();
    readonly vignetteIntensity = this._vignetteIntensity.asReadonly();
    readonly aberrationIntensity = this._aberrationIntensity.asReadonly();
    readonly timeOfDay = this._timeOfDay.asReadonly();
    readonly dayNightActive = this._dayNightActive.asReadonly();
    readonly dayNightSpeed = this._dayNightSpeed.asReadonly();
    readonly weather = this._weather.asReadonly();
    readonly atmosphere = this._atmosphere.asReadonly();
    readonly baseAtmosphere = this._baseAtmosphere.asReadonly();
    readonly isUnderwater = this._isUnderwater.asReadonly();
    readonly waterLevel = this._waterLevel.asReadonly();
    readonly waveTimeScale = this._waveTimeScale.asReadonly();
    readonly transformMode = this._transformMode.asReadonly();
    readonly mode = this._mode.asReadonly();
    readonly viewMode = this._viewMode.asReadonly();
    readonly currentSceneId = this._currentSceneId.asReadonly();
    readonly isPlacementActive = this._isPlacementActive.asReadonly();
    readonly canUndo = this._canUndo.asReadonly();
    readonly canRedo = this._canRedo.asReadonly();
    readonly showDebugOverlay = this._showDebugOverlay.asReadonly();
    readonly debugInfo = this._debugInfo.asReadonly();

    setPlayerEntity(v: Entity | null) { this._playerEntity.set(v); }
    setPlayerSpeed(v: number) { this._playerSpeed.set(v); }
    setCrouching(v: boolean) { this._isCrouching.set(v); }
    setFps(v: number) { this._fps.set(v); }
    setPhysicsTime(v: number) { this._physicsTime.set(v); }
    setRenderTime(v: number) { this._renderTime.set(v); }
    setLoading(v: boolean) { this._loading.set(v); }
    setLoadingProgress(v: number) {
        this._loadingProgress.set(Math.min(100, Math.max(0, v)));
    }

    setLoadingStage(v: string | null | undefined) {
        this._loadingStage.set(NullShield.trim(v).toUpperCase() || 'IDLE');
    }

    setLoadingDetail(v: string) {
        this._loadingDetail.set(v);
    }

    setLoadError(v: string | null) {
        this._loadError.set(v);
        this._isCriticalFailure.set(v !== null);
    }

    updateLoadingTelemetry(fn: (prev: LoadingTelemetry) => LoadingTelemetry) {
        this._loadingTelemetry.update(fn);
    }

    setAiming(v: boolean) { this._isAiming.set(v); }
    setAcquiredTarget(v: TargetInfo | null) { this._acquiredTarget.set(v); }

    triggerHitMarker() {
        this._hitMarkerActive.set(true);
        setTimeout(() => this._hitMarkerActive.set(false), 150);
    }

    setPaused(v: boolean) { this._isPaused.set(v); }
    togglePaused() { this._isPaused.update(v => !v); }
    setTimeScale(v: number) { this._timeScale.set(v); }
    setMainMenuVisible(v: boolean) { this._mainMenuVisible.set(v); }
    setGravity(v: number) { this._gravityY.set(v); }
    setHudVisible(v: boolean) { this._hudVisible.set(v); }
    toggleHudVisible() { this._hudVisible.update(v => !v); }
    setWireframe(v: boolean) { this._wireframe.set(v); }
    toggleWireframe() { this._wireframe.update(v => !v); }
    setTexturesEnabled(v: boolean) { this._texturesEnabled.set(v); }
    toggleTexturesEnabled() { this._texturesEnabled.update(v => !v); }
    setPostProcessingEnabled(v: boolean) { this._postProcessingEnabled.set(v); }
    togglePostProcessing() { this._postProcessingEnabled.update(v => !v); }
    setPhysicsDebug(v: boolean) { this._showPhysicsDebug.set(v); }
    togglePhysicsDebug() { this._showPhysicsDebug.update(v => !v); }
    setSunIntensity(v: number) { this._sunIntensity.set(v); }
    setAmbientIntensity(v: number) { this._ambientIntensity.set(v); }
    setSunColor(v: string | null | undefined) {
        this._sunColor.set(NullShield.trim(v) || '#ffffff');
    }
    setBloomStrength(v: number) { this._bloomStrength.set(v); }
    setBloomThreshold(v: number) { this._bloomThreshold.set(v); }
    setGrainIntensity(v: number) { this._grainIntensity.set(v); }
    setVignetteIntensity(v: number) { this._vignetteIntensity.set(v); }
    setAberrationIntensity(v: number) { this._aberrationIntensity.set(v); }
    setTimeOfDay(v: number) { this._timeOfDay.set(v); }
    setDayNightActive(v: boolean) { this._dayNightActive.set(v); }
    setDayNightSpeed(v: number) { this._dayNightSpeed.set(v); }
    setWeather(v: WeatherType) { this._weather.set(v); }
    setAtmosphere(v: string | null | undefined) {
        const safeId = NullShield.trim(v) || 'clear';
        this._atmosphere.set(safeId);
        // Only update base if not temporary state like underwater
        if (safeId !== 'underwater') this._baseAtmosphere.set(safeId);
    }
    setUnderwater(v: boolean) { this._isUnderwater.set(v); }
    setWaterLevel(v: number | null) { this._waterLevel.set(v); }
    setWaveTimeScale(v: number) { this._waveTimeScale.set(v); }
    setTransformMode(v: 'translate' | 'rotate' | 'scale') { this._transformMode.set(v); }
    setMode(v: 'edit' | 'explore' | 'walk') { this._mode.set(v); }
    setViewMode(v: 'fp' | 'tp') { this._viewMode.set(v); }
    setCurrentSceneId(v: string | null) { this._currentSceneId.set(v); }
    setPlacementActive(v: boolean) { this._isPlacementActive.set(v); }
    setCanUndo(v: boolean) { this._canUndo.set(v); }
    setCanRedo(v: boolean) { this._canRedo.set(v); }
    setDebugOverlay(v: boolean) { this._showDebugOverlay.set(v); }
    updateDebugInfo(fn: (prev: DebugState) => DebugState) { this._debugInfo.update(fn); }
}
