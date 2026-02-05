/**
 * Performance Monitor Service
 * Real-time performance tracking with FPS and memory monitoring
 *
 * @scope Graphics Pipeline
 * @source src/services/performance-monitor.service.ts
 */

import { Injectable, signal, computed } from '@angular/core';

interface PerformanceMetrics {
    fps: number;
    averageFps: number;
    frameTime: number;
    memoryUsage: number | null;
    drawCalls: number;
    triangles: number;
    textures: number;
    geometries: number;
    timestamp: number;
}

interface PerformanceHistory {
    fps: number[];
    memory: (number | null)[];
    frameTime: number[];
    maxSize: number;
}

@Injectable({
    providedIn: 'root'
})
export class PerformanceMonitorService {
    // Performance signals
    currentMetrics = signal<PerformanceMetrics>(this.createEmptyMetrics());
    isMonitoring = signal<boolean>(false);

    // History for trend analysis
    private history: PerformanceHistory = {
        fps: [],
        memory: [],
        frameTime: [],
        maxSize: 60 // Keep last 60 frames (1 second at 60fps)
    };

    // Computed values
    averageFps = computed(() => {
        const metrics = this.currentMetrics();
        return Math.round(metrics.averageFps);
    });

    currentFps = computed(() => {
        const metrics = this.currentMetrics();
        return Math.round(metrics.fps);
    });

    // Monitoring state
    private animationFrameId: number | null = null;
    private lastTime = 0;
    private fpsSum = 0;
    private fpsCount = 0;

    // Three.js renderer reference for stats
    private renderer: { info: { render: { calls: number; triangles: number; }; memory: { textures: number; geometries: number; }; } } | null = null;

    /**
     * Start performance monitoring
     */
    start(renderer?: { info: { render: { calls: number; triangles: number; }; memory: { textures: number; geometries: number; }; } }): void {
        if (this.isMonitoring()) return;

        if (renderer) {
            this.renderer = renderer;
        }

        this.isMonitoring.set(true);
        this.lastTime = performance.now();
        this.fpsSum = 0;
        this.fpsCount = 0;
        this.history.fps = [];
        this.history.memory = [];
        this.history.frameTime = [];

        this.monitorLoop();

        if (process.env.NODE_ENV === 'development') {
            console.log('[PerformanceMonitor] Started monitoring');
        }
    }

    /**
     * Stop performance monitoring
     */
    stop(): void {
        this.isMonitoring.set(false);

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('[PerformanceMonitor] Stopped monitoring');
        }
    }

    /**
     * Get performance report
     */
    getReport(): {
        current: PerformanceMetrics;
        average: {
            fps: number;
            memory: number | null;
            frameTime: number;
        };
        trends: {
            fpsTrend: 'improving' | 'stable' | 'degrading';
            memoryTrend: 'increasing' | 'stable' | 'decreasing';
        };
        recommendations: string[];
        } {
        const current = this.currentMetrics();
        const averageFps = this.calculateAverage(this.history.fps);
        const averageMemory = this.calculateAverage(this.history.memory.filter(m => m !== null) as number[]);
        const averageFrameTime = this.calculateAverage(this.history.frameTime);

        const fpsTrend = this.calculateFpsTrend(this.history.fps);
        const memoryTrend = this.calculateMemoryTrend(this.history.memory.filter(m => m !== null) as number[]);

        const recommendations = this.generateRecommendations(current, averageFps, averageMemory);

        return {
            current,
            average: {
                fps: averageFps,
                memory: averageMemory,
                frameTime: averageFrameTime
            },
            trends: {
                fpsTrend,
                memoryTrend
            },
            recommendations
        };
    }

    /**
     * Get current memory usage (if available)
     */
    getMemoryUsage(): number | null {
        if (performance && 'memory' in performance && (performance as any).memory) {
            const memory = (performance as any).memory;
            return memory.usedJSHeapSize;
        }
        return null;
    }

    /**
     * Set Three.js renderer for detailed stats
     */
    setRenderer(renderer: { info: { render: { calls: number; triangles: number; }; memory: { textures: number; geometries: number; }; } }): void {
        this.renderer = renderer;
    }

    /**
     * Reset metrics history
     */
    reset(): void {
        this.history.fps = [];
        this.history.memory = [];
        this.history.frameTime = [];
        this.fpsSum = 0;
        this.fpsCount = 0;
        this.currentMetrics.set(this.createEmptyMetrics());
    }

    // Private monitoring methods

    private monitorLoop(): void {
        if (!this.isMonitoring()) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Calculate FPS
        const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
        const frameTime = deltaTime;

        // Update running average
        this.fpsSum += fps;
        this.fpsCount++;
        const averageFps = this.fpsSum / this.fpsCount;

        // Get memory usage
        const memoryUsage = this.getMemoryUsage();

        // Get Three.js renderer stats
        let drawCalls = 0;
        let triangles = 0;
        let textures = 0;
        let geometries = 0;

        if (this.renderer) {
            drawCalls = this.renderer.info.render.calls;
            triangles = this.renderer.info.render.triangles;
            textures = this.renderer.info.memory.textures;
            geometries = this.renderer.info.memory.geometries;
        }

        // Create metrics object
        const metrics: PerformanceMetrics = {
            fps,
            averageFps,
            frameTime,
            memoryUsage,
            drawCalls,
            triangles,
            textures,
            geometries,
            timestamp: currentTime
        };

        // Update current metrics
        this.currentMetrics.set(metrics);

        // Update history
        this.addToHistory(fps, memoryUsage, frameTime);

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.monitorLoop());
    }

    private addToHistory(fps: number, memory: number | null, frameTime: number): void {
        this.history.fps.push(fps);
        this.history.memory.push(memory);
        this.history.frameTime.push(frameTime);

        // Keep history within max size
        if (this.history.fps.length > this.history.maxSize) {
            this.history.fps.shift();
            this.history.memory.shift();
            this.history.frameTime.shift();
        }
    }

    private createEmptyMetrics(): PerformanceMetrics {
        return {
            fps: 0,
            averageFps: 0,
            frameTime: 0,
            memoryUsage: null,
            drawCalls: 0,
            triangles: 0,
            textures: 0,
            geometries: 0,
            timestamp: 0
        };
    }

    private calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    private calculateFpsTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
        if (values.length < 10) return 'stable';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (change > 10) return 'improving';
        if (change < -10) return 'degrading';
        return 'stable';
    }

    private calculateMemoryTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
        if (values.length < 10) return 'stable';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
    }

    private generateRecommendations(
        current: PerformanceMetrics,
        avgFps: number,
        avgMemory: number | null
    ): string[] {
        const recommendations: string[] = [];

        // FPS recommendations
        if (avgFps < 30) {
            recommendations.push('Low FPS detected. Consider reducing quality settings or disabling expensive post-processing effects.');
        } else if (avgFps < 45) {
            recommendations.push('FPS below target. Consider optimizing material complexity or reducing shadow quality.');
        }

        // Memory recommendations
        if (avgMemory && avgMemory > 512 * 1024 * 1024) { // 512MB
            recommendations.push('High memory usage detected. Consider clearing texture cache or reducing texture quality.');
        }

        // Draw call recommendations
        if (current.drawCalls > 500) {
            recommendations.push('High draw call count. Consider using instanced meshes or merging geometries.');
        }

        // Triangle count recommendations
        if (current.triangles > 1000000) { // 1 million triangles
            recommendations.push('High triangle count. Consider using LOD (Level of Detail) meshes.');
        }

        // Texture recommendations
        if (current.textures > 100) {
            recommendations.push('High texture count. Consider texture atlasing or reducing texture memory budget.');
        }

        return recommendations;
    }
}
