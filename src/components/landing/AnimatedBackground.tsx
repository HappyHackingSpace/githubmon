"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const generatedParticles = [...Array(20)].map(() => ({
            initialX: Math.random() * window.innerWidth,
            initialY: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
            animateY: Math.random() * -200,
            duration: Math.random() * 10 + 10,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
        }));
        setParticles(generatedParticles);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
            {/* Dynamic ambient gradients */}
            <motion.div
                animate={{
                    x: mousePosition.x - 500,
                    y: mousePosition.y - 500,
                }}
                transition={{ type: "spring", stiffness: 50, damping: 50, mass: 0.5 }}
                className="absolute w-[1000px] h-[1000px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] opacity-60"
            />

            <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[120px]" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />

            {/* Floating particles */}
            <div className="absolute inset-0 opacity-50 dark:opacity-30">
                {mounted && particles.map((particle: any, i: number) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-primary/40"
                        initial={{
                            x: particle.initialX,
                            y: particle.initialY,
                            scale: particle.scale,
                        }}
                        animate={{
                            y: [null, particle.animateY],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            width: particle.width + "px",
                            height: particle.height + "px",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
