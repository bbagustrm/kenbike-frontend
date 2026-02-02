import React, {useState, useRef, useEffect, useCallback} from 'react';
import { cn } from '@/lib/utils';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    onValueCommit?: (value: [number, number]) => void;
    className?: string;
}

export function PriceRangeSlider({
    min,
    max,
    step = 1,
    value,
    onValueChange,
    onValueCommit,
    className,
}: PriceRangeSliderProps) {
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const minPercent = ((value[0] - min) / (max - min)) * 100;
    const maxPercent = ((value[1] - min) / (max - min)) * 100;

    const getValueFromPosition = useCallback((clientX: number): number => {
        if (!trackRef.current) return min;

        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawValue = min + percent * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    }, [min, max, step]);

    const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    const handleTouchStart = (type: 'min' | 'max') => (e: React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    useEffect(() => {
        const handleMove = (clientX: number) => {
            if (!isDragging) return;

            const newValue = getValueFromPosition(clientX);

            if (isDragging === 'min') {
                const newMin = Math.min(newValue, value[1] - step);
                onValueChange([newMin, value[1]]);
            } else {
                const newMax = Math.max(newValue, value[0] + step);
                onValueChange([value[0], newMax]);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX);
            }
        };

        const handleEnd = () => {
            if (isDragging && onValueCommit) {
                onValueCommit(value);
            }
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleEnd);
            };
        }
    }, [isDragging, value, onValueChange, onValueCommit, min, max, step, getValueFromPosition]);

    const handleTrackClick = (e: React.MouseEvent) => {
        if (isDragging) return;

        const newValue = getValueFromPosition(e.clientX);
        const distToMin = Math.abs(newValue - value[0]);
        const distToMax = Math.abs(newValue - value[1]);

        if (distToMin < distToMax) {
            const newMin = Math.min(newValue, value[1] - step);
            onValueChange([newMin, value[1]]);
            if (onValueCommit) onValueCommit([newMin, value[1]]);
        } else {
            const newMax = Math.max(newValue, value[0] + step);
            onValueChange([value[0], newMax]);
            if (onValueCommit) onValueCommit([value[0], newMax]);
        }
    };

    return (
        <div className={cn('relative w-full', className)}>
            {/* Track */}
            <div
                ref={trackRef}
                className="relative h-2 bg-accent rounded-full cursor-pointer"
                onClick={handleTrackClick}
            >
                {/* Active Range */}
                <div
                    className="absolute h-full bg-primary rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`,
                    }}
                />

                {/* Min Thumb */}
                <div
                    className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-background border-2 border-primary rounded-full cursor-grab shadow-md transition-transform hover:scale-110',
                        isDragging === 'min' && 'cursor-grabbing scale-110'
                    )}
                    style={{ left: `${minPercent}%` }}
                    onMouseDown={handleMouseDown('min')}
                    onTouchStart={handleTouchStart('min')}
                />

                {/* Max Thumb */}
                <div
                    className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-background border-2 border-primary rounded-full cursor-grab shadow-md transition-transform hover:scale-110',
                        isDragging === 'max' && 'cursor-grabbing scale-110'
                    )}
                    style={{ left: `${maxPercent}%` }}
                    onMouseDown={handleMouseDown('max')}
                    onTouchStart={handleTouchStart('max')}
                />
            </div>
        </div>
    );
}