'use client'

import Image from 'next/image'

export function AnimatedLogo() {
    return (
        <div className="relative w-32 h-20">
            <Image
                src="/gitmonclosewhite.png"
                alt="GitMon Logo"
                fill
                className="object-contain"
            />
        </div>
    )
}