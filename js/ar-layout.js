/**
 * AR Spatial Layout System for AR Education Toy
 * Handles marker-relative positioning of 3D content
 */

// Spatial zones definition
const AR_ZONES = {
    ABOVE: {
        name: 'above',
        baseY: 1.2,
        description: 'Question text zone above marker'
    },
    ORBIT: {
        name: 'orbit',
        baseY: 0.3,
        radius: 0.8,
        description: 'Circular answer buttons around marker'
    },
    GROUND: {
        name: 'ground', 
        baseY: 0.01,
        description: 'Decorative elements on ground level'
    },
    PARTICLES: {
        name: 'particles',
        minY: 0.8,
        maxY: 1.8,
        description: 'Celebration particle zone'
    }
};

// Layout configuration
const AR_LAYOUT = {
    // Marker distance scaling
    scaling: {
        minDistance: 0.5,
        maxDistance: 3.0,
        baseScale: 1.0,
        scaleRange: 0.3
    },
    
    // Animation settings
    animation: {
        orbitSpeed: 8000, // ms for full rotation
        floatSpeed: 2000, // ms for float cycle
        bounceHeight: 0.1
    },
    
    // Responsive breakpoints
    responsive: {
        mobile: { maxWidth: 480, scale: 0.8 },
        tablet: { maxWidth: 768, scale: 0.9 },
        desktop: { minWidth: 769, scale: 1.0 }
    }
};

/**
 * Calculate position for content based on type and index
 * @param {string} type - Zone type: 'above', 'orbit', 'ground', 'particles'
 * @param {number} index - Element index (0-based)
 * @param {number} total - Total number of elements
 * @param {Object} options - Additional options
 * @returns {Object} {x, y, z} position coordinates
 */
function positionContent(type, index = 0, total = 1, options = {}) {
    const zone = AR_ZONES[type.toUpperCase()];
    if (!zone) {
        console.warn(`Unknown zone type: ${type}`);
        return { x: 0, y: 0, z: 0 };
    }

    let position = { x: 0, y: 0, z: 0 };
    const markerDistance = options.markerDistance || 1.0;
    const scale = calculateDistanceScale(markerDistance);

    switch (zone.name) {
        case 'above':
            position = {
                x: 0,
                y: zone.baseY * scale,
                z: 0
            };
            break;

        case 'orbit':
            const angle = (index / total) * 2 * Math.PI;
            const radius = zone.radius * scale;
            position = {
                x: Math.cos(angle) * radius,
                y: zone.baseY * scale,
                z: Math.sin(angle) * radius
            };
            break;

        case 'ground':
            // Distribute evenly on ground around marker
            const groundAngle = (index / Math.max(total, 1)) * 2 * Math.PI;
            const groundRadius = 0.5 * scale;
            position = {
                x: Math.cos(groundAngle) * groundRadius,
                y: zone.baseY,
                z: Math.sin(groundAngle) * groundRadius
            };
            break;

        case 'particles':
            // Random positions within particle zone
            const randomAngle = Math.random() * 2 * Math.PI;
            const randomRadius = Math.random() * 0.6 * scale;
            const randomY = zone.minY + Math.random() * (zone.maxY - zone.minY);
            position = {
                x: Math.cos(randomAngle) * randomRadius,
                y: randomY * scale,
                z: Math.sin(randomAngle) * randomRadius
            };
            break;

        default:
            console.warn(`Unhandled zone: ${zone.name}`);
    }

    // Apply additional offsets if provided
    if (options.offset) {
        position.x += options.offset.x || 0;
        position.y += options.offset.y || 0;
        position.z += options.offset.z || 0;
    }

    return position;
}

/**
 * Calculate scale factor based on marker distance
 * @param {number} distance - Distance to marker
 * @returns {number} Scale factor
 */
function calculateDistanceScale(distance) {
    const { minDistance, maxDistance, baseScale, scaleRange } = AR_LAYOUT.scaling;
    
    // Clamp distance to valid range
    const clampedDistance = Math.max(minDistance, Math.min(maxDistance, distance));
    
    // Linear interpolation
    const normalizedDistance = (clampedDistance - minDistance) / (maxDistance - minDistance);
    const scale = baseScale + (normalizedDistance * scaleRange);
    
    return scale;
}

/**
 * Get responsive scale based on screen size
 * @returns {number} Responsive scale factor
 */
function getResponsiveScale() {
    const width = window.innerWidth;
    const { mobile, tablet, desktop } = AR_LAYOUT.responsive;
    
    if (width <= mobile.maxWidth) return mobile.scale;
    if (width <= tablet.maxWidth) return tablet.scale;
    return desktop.scale;
}

/**
 * Generate orbit animation keyframes for A-Frame
 * @param {number} radius - Orbit radius
 * @param {number} duration - Animation duration in ms
 * @returns {string} A-Frame animation string
 */
function generateOrbitAnimation(radius, duration = AR_LAYOUT.animation.orbitSpeed) {
    const positions = [];
    for (let i = 0; i <= 36; i++) {
        const angle = (i / 36) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        positions.push(`${x.toFixed(3)} 0.3 ${z.toFixed(3)}`);
    }
    
    return {
        property: 'position',
        to: positions.join('; '),
        dur: duration,
        loop: true,
        easing: 'linear'
    };
}

/**
 * Generate float animation for decorative elements
 * @param {number} height - Float height
 * @param {number} duration - Animation duration in ms
 * @returns {Object} A-Frame animation configuration
 */
function generateFloatAnimation(height = AR_LAYOUT.animation.bounceHeight, duration = AR_LAYOUT.animation.floatSpeed) {
    return {
        property: 'position',
        dir: 'alternate',
        dur: duration,
        loop: true,
        easing: 'easeInOutSine',
        from: '0 0 0',
        to: `0 ${height} 0`
    };
}

/**
 * Update all AR content positions based on current marker state
 * @param {Object} markerState - Current marker detection state
 */
function updateARLayout(markerState) {
    const scale = getResponsiveScale();
    const distanceScale = calculateDistanceScale(markerState.distance || 1.0);
    const totalScale = scale * distanceScale;
    
    // Update question text position
    const questionEl = document.querySelector('#questionText');
    if (questionEl) {
        const pos = positionContent('above', 0, 1, { markerDistance: markerState.distance });
        questionEl.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
        questionEl.setAttribute('scale', `${totalScale} ${totalScale} ${totalScale}`);
    }
    
    // Update answer positions
    const answerEls = document.querySelectorAll('.answer-model');
    answerEls.forEach((el, index) => {
        const pos = positionContent('orbit', index, answerEls.length, { markerDistance: markerState.distance });
        el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
        el.setAttribute('scale', `${totalScale} ${totalScale} ${totalScale}`);
    });
    
    // Update decorative elements
    const decorEls = document.querySelectorAll('.ground-element');
    decorEls.forEach((el, index) => {
        const pos = positionContent('ground', index, decorEls.length, { markerDistance: markerState.distance });
        el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
        el.setAttribute('scale', `${totalScale} ${totalScale} ${totalScale}`);
    });
}

/**
 * Initialize AR layout system
 */
function initARLayout() {
    console.log('AR Layout System initialized');
    
    // Listen for marker events
    const marker = document.querySelector('a-marker');
    if (marker) {
        marker.addEventListener('markerFound', () => {
            console.log('Marker found - updating layout');
            updateARLayout({ distance: 1.0, visible: true });
        });
        
        marker.addEventListener('markerLost', () => {
            console.log('Marker lost');
            updateARLayout({ distance: 1.0, visible: false });
        });
    }
    
    // Listen for window resize for responsive scaling
    window.addEventListener('resize', () => {
        updateARLayout({ distance: 1.0, visible: true });
    });
}

// Export functions for global use
window.ARLayout = {
    positionContent,
    calculateDistanceScale,
    getResponsiveScale,
    generateOrbitAnimation,
    generateFloatAnimation,
    updateARLayout,
    initARLayout,
    ZONES: AR_ZONES,
    CONFIG: AR_LAYOUT
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initARLayout);
} else {
    initARLayout();
}