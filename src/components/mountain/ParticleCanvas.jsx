import React, { useRef, useEffect, useCallback } from 'react';

/**
 * High-performance canvas-based particle system
 * Supports multiple particle types: snow, fireworks, petals, stars, rain, fireflies
 */
const ParticleCanvas = ({ theme = 'default', intensity = 1 }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(0);

    // Particle configurations per theme
    const particleConfigs = {
        newYear2026: {
            types: ['firework', 'sparkle', 'confetti'],
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FFFFFF'],
            spawnRate: 0.03,
            maxParticles: 150,
        },
        winterWonder: {
            types: ['snow'],
            colors: ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#7DD3FC'],
            spawnRate: 0.15,
            maxParticles: 200,
        },
        springBloom: {
            types: ['petal', 'butterfly'],
            colors: ['#FBCFE8', '#F9A8D4', '#F472B6', '#FFFFFF', '#FEF3C7'],
            spawnRate: 0.08,
            maxParticles: 100,
        },
        midnightFocus: {
            types: ['shootingStar', 'twinkle'],
            colors: ['#FFFFFF', '#A5B4FC', '#818CF8', '#6366F1'],
            spawnRate: 0.02,
            maxParticles: 80,
        },
        goldenHour: {
            types: ['sunray', 'dust'],
            colors: ['#FCD34D', '#FBBF24', '#F59E0B', '#FFFFFF'],
            spawnRate: 0.05,
            maxParticles: 60,
        },
        rainyDay: {
            types: ['rain', 'ripple'],
            colors: ['#93C5FD', '#60A5FA', '#3B82F6', '#BFDBFE'],
            spawnRate: 0.2,
            maxParticles: 250,
        },
        default: {
            types: ['twinkle'],
            colors: ['#FFFFFF'],
            spawnRate: 0.02,
            maxParticles: 50,
        }
    };

    // Create a new particle based on type
    const createParticle = useCallback((canvas, type, colors) => {
        const color = colors[Math.floor(Math.random() * colors.length)];

        switch (type) {
            case 'snow':
                return {
                    type: 'snow',
                    x: Math.random() * canvas.width,
                    y: -10,
                    size: Math.random() * 4 + 2,
                    speedY: Math.random() * 1.5 + 0.5,
                    speedX: Math.random() * 0.5 - 0.25,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: Math.random() * 0.02 + 0.01,
                    opacity: Math.random() * 0.5 + 0.5,
                    color,
                };

            case 'firework':
                return {
                    type: 'firework',
                    x: Math.random() * canvas.width,
                    y: canvas.height,
                    targetY: Math.random() * canvas.height * 0.4 + 50,
                    speedY: -8 - Math.random() * 4,
                    size: 3,
                    color,
                    exploded: false,
                    explosionParticles: [],
                    trail: [],
                };

            case 'sparkle':
                return {
                    type: 'sparkle',
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.6,
                    size: Math.random() * 3 + 1,
                    opacity: 0,
                    maxOpacity: Math.random() * 0.8 + 0.2,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.05 + 0.02,
                    color,
                };

            case 'confetti':
                return {
                    type: 'confetti',
                    x: Math.random() * canvas.width,
                    y: -20,
                    size: Math.random() * 8 + 4,
                    speedY: Math.random() * 2 + 1,
                    speedX: Math.random() * 2 - 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 10 - 5,
                    opacity: 1,
                    color,
                    shape: Math.random() > 0.5 ? 'rect' : 'circle',
                };

            case 'petal':
                return {
                    type: 'petal',
                    x: Math.random() * canvas.width,
                    y: -20,
                    size: Math.random() * 10 + 5,
                    speedY: Math.random() * 1 + 0.5,
                    speedX: Math.random() * 1 - 0.3,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 2 - 1,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: Math.random() * 0.03 + 0.01,
                    opacity: Math.random() * 0.4 + 0.6,
                    color,
                };

            case 'butterfly':
                return {
                    type: 'butterfly',
                    x: -20,
                    y: Math.random() * canvas.height * 0.7,
                    size: Math.random() * 8 + 6,
                    speedX: Math.random() * 1 + 0.5,
                    speedY: 0,
                    wingPhase: 0,
                    wingSpeed: 0.2,
                    pathOffset: Math.random() * Math.PI * 2,
                    opacity: 0.8,
                    color,
                };

            case 'shootingStar':
                const startX = Math.random() * canvas.width * 0.5;
                return {
                    type: 'shootingStar',
                    x: startX,
                    y: Math.random() * canvas.height * 0.3,
                    speedX: 8 + Math.random() * 4,
                    speedY: 4 + Math.random() * 2,
                    length: 50 + Math.random() * 50,
                    opacity: 1,
                    trail: [],
                    color,
                };

            case 'twinkle':
                return {
                    type: 'twinkle',
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.5,
                    size: Math.random() * 2 + 1,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.03 + 0.01,
                    opacity: 0,
                    color,
                };

            case 'sunray':
                return {
                    type: 'sunray',
                    x: canvas.width * 0.8 + Math.random() * 100,
                    y: -50,
                    width: Math.random() * 3 + 1,
                    length: canvas.height * 1.5,
                    angle: Math.PI / 4 + Math.random() * 0.2 - 0.1,
                    opacity: 0,
                    maxOpacity: Math.random() * 0.15 + 0.05,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.01 + 0.005,
                    color,
                };

            case 'dust':
                return {
                    type: 'dust',
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: Math.random() * 0.3 - 0.15,
                    speedY: Math.random() * 0.2 - 0.1,
                    opacity: 0,
                    maxOpacity: Math.random() * 0.6 + 0.2,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.01,
                    color,
                };

            case 'rain':
                return {
                    type: 'rain',
                    x: Math.random() * canvas.width,
                    y: -20,
                    length: Math.random() * 15 + 10,
                    speedY: Math.random() * 8 + 12,
                    speedX: 2,
                    opacity: Math.random() * 0.4 + 0.3,
                    color,
                };

            case 'ripple':
                return {
                    type: 'ripple',
                    x: Math.random() * canvas.width,
                    y: canvas.height - Math.random() * 100,
                    radius: 0,
                    maxRadius: Math.random() * 20 + 10,
                    speed: Math.random() * 0.5 + 0.3,
                    opacity: 0.5,
                    color,
                };

            default:
                return null;
        }
    }, []);

    // Update particle position and state
    const updateParticle = useCallback((particle, canvas, deltaTime) => {
        const dt = deltaTime / 16.67; // Normalize to 60fps

        switch (particle.type) {
            case 'snow':
                particle.wobble += particle.wobbleSpeed * dt;
                particle.x += (particle.speedX + Math.sin(particle.wobble) * 0.5) * dt;
                particle.y += particle.speedY * dt;
                return particle.y < canvas.height + 20;

            case 'firework':
                if (!particle.exploded) {
                    particle.trail.push({ x: particle.x, y: particle.y, opacity: 1 });
                    if (particle.trail.length > 10) particle.trail.shift();
                    particle.y += particle.speedY * dt;
                    particle.speedY += 0.1 * dt; // Gravity

                    if (particle.y <= particle.targetY || particle.speedY >= 0) {
                        particle.exploded = true;
                        // Create explosion particles
                        for (let i = 0; i < 30; i++) {
                            const angle = (Math.PI * 2 * i) / 30;
                            const speed = Math.random() * 3 + 2;
                            particle.explosionParticles.push({
                                x: particle.x,
                                y: particle.y,
                                speedX: Math.cos(angle) * speed,
                                speedY: Math.sin(angle) * speed,
                                opacity: 1,
                                size: Math.random() * 2 + 1,
                            });
                        }
                    }
                } else {
                    // Update explosion particles
                    particle.explosionParticles = particle.explosionParticles.filter(ep => {
                        ep.x += ep.speedX * dt;
                        ep.y += ep.speedY * dt;
                        ep.speedY += 0.05 * dt; // Gravity
                        ep.opacity -= 0.015 * dt;
                        return ep.opacity > 0;
                    });
                    // Update trail fade
                    particle.trail = particle.trail.filter(t => {
                        t.opacity -= 0.1 * dt;
                        return t.opacity > 0;
                    });
                    return particle.explosionParticles.length > 0 || particle.trail.length > 0;
                }
                return true;

            case 'sparkle':
                particle.phase += particle.speed * dt;
                particle.opacity = (Math.sin(particle.phase) + 1) / 2 * particle.maxOpacity;
                return true; // Sparkles stay forever

            case 'confetti':
                particle.x += particle.speedX * dt;
                particle.y += particle.speedY * dt;
                particle.rotation += particle.rotationSpeed * dt;
                particle.speedY += 0.02 * dt; // Gentle gravity
                particle.opacity -= 0.003 * dt;
                return particle.y < canvas.height + 20 && particle.opacity > 0;

            case 'petal':
                particle.wobble += particle.wobbleSpeed * dt;
                particle.x += (particle.speedX + Math.sin(particle.wobble) * 0.8) * dt;
                particle.y += particle.speedY * dt;
                particle.rotation += particle.rotationSpeed * dt;
                return particle.y < canvas.height + 20;

            case 'butterfly':
                particle.wingPhase += particle.wingSpeed * dt;
                particle.x += particle.speedX * dt;
                particle.y += Math.sin(particle.pathOffset + particle.x * 0.02) * 0.5 * dt;
                return particle.x < canvas.width + 30;

            case 'shootingStar':
                particle.trail.push({ x: particle.x, y: particle.y, opacity: 1 });
                if (particle.trail.length > 20) particle.trail.shift();
                particle.x += particle.speedX * dt;
                particle.y += particle.speedY * dt;
                particle.opacity -= 0.02 * dt;
                particle.trail.forEach(t => t.opacity -= 0.05 * dt);
                particle.trail = particle.trail.filter(t => t.opacity > 0);
                return particle.opacity > 0;

            case 'twinkle':
                particle.phase += particle.speed * dt;
                particle.opacity = (Math.sin(particle.phase) + 1) / 2;
                return true;

            case 'sunray':
                particle.phase += particle.speed * dt;
                particle.opacity = (Math.sin(particle.phase) + 1) / 2 * particle.maxOpacity;
                return true;

            case 'dust':
                particle.phase += particle.speed * dt;
                particle.x += particle.speedX * dt;
                particle.y += particle.speedY * dt;
                particle.opacity = (Math.sin(particle.phase) + 1) / 2 * particle.maxOpacity;
                // Wrap around
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                return true;

            case 'rain':
                particle.x += particle.speedX * dt;
                particle.y += particle.speedY * dt;
                return particle.y < canvas.height;

            case 'ripple':
                particle.radius += particle.speed * dt;
                particle.opacity -= 0.01 * dt;
                return particle.radius < particle.maxRadius && particle.opacity > 0;

            default:
                return false;
        }
    }, []);

    // Draw particle on canvas
    const drawParticle = useCallback((ctx, particle) => {
        ctx.save();

        switch (particle.type) {
            case 'snow':
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();
                // Add soft glow
                ctx.shadowBlur = particle.size * 2;
                ctx.shadowColor = particle.color;
                ctx.fill();
                break;

            case 'firework':
                // Draw trail
                particle.trail.forEach((t, i) => {
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = t.opacity * 0.5;
                    ctx.fill();
                });

                if (!particle.exploded) {
                    // Draw rocket
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = 1;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = particle.color;
                    ctx.fill();
                } else {
                    // Draw explosion particles
                    particle.explosionParticles.forEach(ep => {
                        ctx.beginPath();
                        ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
                        ctx.fillStyle = particle.color;
                        ctx.globalAlpha = ep.opacity;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = particle.color;
                        ctx.fill();
                    });
                }
                break;

            case 'sparkle':
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                // Draw star shape
                const spikes = 4;
                const outerRadius = particle.size;
                const innerRadius = particle.size * 0.4;
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI * i) / spikes - Math.PI / 2;
                    const x = particle.x + Math.cos(angle) * radius;
                    const y = particle.y + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.shadowBlur = 10;
                ctx.shadowColor = particle.color;
                ctx.fill();
                break;

            case 'confetti':
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                if (particle.shape === 'rect') {
                    ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'petal':
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, particle.size, particle.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                // Inner detail
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.ellipse(0, 0, particle.size * 0.5, particle.size / 4, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'butterfly':
                ctx.translate(particle.x, particle.y);
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                const wingAngle = Math.sin(particle.wingPhase) * 0.5;
                // Left wing
                ctx.save();
                ctx.rotate(-wingAngle);
                ctx.beginPath();
                ctx.ellipse(-particle.size / 2, 0, particle.size, particle.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                // Right wing
                ctx.save();
                ctx.rotate(wingAngle);
                ctx.beginPath();
                ctx.ellipse(particle.size / 2, 0, particle.size, particle.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                // Body
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.ellipse(0, 0, 2, particle.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'shootingStar':
                // Draw trail
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                particle.trail.forEach((t, i) => {
                    ctx.lineTo(t.x, t.y);
                });
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = particle.opacity * 0.5;
                ctx.stroke();
                // Draw head
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = particle.opacity;
                ctx.shadowBlur = 15;
                ctx.shadowColor = particle.color;
                ctx.fill();
                break;

            case 'twinkle':
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.shadowBlur = particle.size * 3;
                ctx.shadowColor = particle.color;
                ctx.fill();
                break;

            case 'sunray':
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.angle);
                ctx.globalAlpha = particle.opacity;
                const gradient = ctx.createLinearGradient(0, 0, 0, particle.length);
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(-particle.width / 2, 0, particle.width, particle.length);
                break;

            case 'dust':
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.shadowBlur = particle.size * 2;
                ctx.shadowColor = particle.color;
                ctx.fill();
                break;

            case 'rain':
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particle.x + particle.speedX * 0.3, particle.y + particle.length);
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = 1;
                ctx.globalAlpha = particle.opacity;
                ctx.stroke();
                break;

            case 'ripple':
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = 1;
                ctx.globalAlpha = particle.opacity;
                ctx.stroke();
                break;
        }

        ctx.restore();
    }, []);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = particleConfigs[theme] || particleConfigs.default;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTimeRef.current;
            lastTimeRef.current = currentTime;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            // Spawn new particles
            if (Math.random() < config.spawnRate * intensity && particlesRef.current.length < config.maxParticles * intensity) {
                const type = config.types[Math.floor(Math.random() * config.types.length)];
                const newParticle = createParticle(
                    { width: canvas.offsetWidth, height: canvas.offsetHeight },
                    type,
                    config.colors
                );
                if (newParticle) {
                    particlesRef.current.push(newParticle);
                }
            }

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                const alive = updateParticle(particle, { width: canvas.offsetWidth, height: canvas.offsetHeight }, deltaTime);
                if (alive) {
                    drawParticle(ctx, particle);
                }
                return alive;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Initialize some particles
        for (let i = 0; i < config.maxParticles * 0.3 * intensity; i++) {
            const type = config.types[Math.floor(Math.random() * config.types.length)];
            const particle = createParticle(
                { width: canvas.offsetWidth, height: canvas.offsetHeight },
                type,
                config.colors
            );
            if (particle) {
                // Randomize initial position for static-ish particles
                if (['twinkle', 'sparkle', 'dust', 'sunray'].includes(particle.type)) {
                    particle.y = Math.random() * canvas.offsetHeight;
                    particle.phase = Math.random() * Math.PI * 2;
                }
                particlesRef.current.push(particle);
            }
        }

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            particlesRef.current = [];
        };
    }, [theme, intensity, createParticle, updateParticle, drawParticle]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 5 }}
        />
    );
};

export default ParticleCanvas;
