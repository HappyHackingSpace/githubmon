'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'


import { useSidebarState, useAuthStore, useStoreHydration } from '@/stores'
import {

    Activity,
    Star,
    Code,
    GitPullRequest,
    AlertCircle,
    Calendar,
    UserPlus,
    BarChart3,
    Eye
} from 'lucide-react'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

interface TrendingItem {
    name: string
    description: string
    stars: number
    language: string
    url: string
    type: 'repo' | 'user' | 'topic'
}

export function SidebarSearch() {
    const pathname = usePathname()
    const [activeSection, setActiveSection] = useState('overview')
    const { isOpen, setOpen } = useSidebarState()

    
    const { logout } = useAuthStore()

    const navigationItems = [
        { href: '#overview', label: 'Overview', icon: Eye, section: 'analytics' },
        { href: '#behavior', label: 'Behavior', icon: Activity, section: 'analytics' },
        { href: '#star', label: 'Star', icon: Star, section: 'analytics' },
        { href: '#code', label: 'Code', icon: Code, section: 'analytics' },
        { href: '#code-review', label: 'Code Review', icon: GitPullRequest, section: 'analytics' },
        { href: '#issue', label: 'Issue', icon: AlertCircle, section: 'analytics' },
        { href: '#monthly-stats', label: 'Monthly Stats', icon: Calendar, section: 'analytics' },
        { href: '#contribution-activities', label: 'Contribution Activities', icon: UserPlus, section: 'analytics' }
    ]

    useEffect(() => {
        const handleActiveSection = (event: CustomEvent) => {
            setActiveSection(event.detail.section);
        };

        window.addEventListener('activeSectionChange', handleActiveSection as EventListener);
        return () => window.removeEventListener('activeSectionChange', handleActiveSection as EventListener);
    }, []);

  

    const mainItems = navigationItems.filter(item => item.section === 'main')
    const analyticsItems = navigationItems.filter(item => item.section === 'analytics')

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside className={`
                fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-sidebar border-r border-sidebar-border z-40 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:fixed lg:z-auto
                flex flex-col
            `}>



                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Main Navigation */}
                    <nav className="p-4 space-y-1">
                        {mainItems.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                                        ${isActive
                                            ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                                        }
                                    `}
                                >
                                    <Icon size={18} className="text-foreground" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Analytics Section */}
                    <div className="px-4 pb-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Analytics
                            </h3>
                        </div>

                        <nav className="space-y-1">
                            {analyticsItems.map((item) => {
                                const isActive = activeSection === item.href.replace('#', '')
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => scrollToSection(item.href.replace('#', ''))}
                                        className={`
                                            w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm text-left
                                            ${isActive
                                                ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                                            }
                                        `}
                                    >
                                        <Icon size={16} className="text-muted-foreground" />
                                        <span>{item.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>


            </aside>
        </>
    )
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden fixed top-4 left-4 z-50 bg-background p-2 rounded-lg shadow-lg border border-border hover:bg-accent transition-colors"
        >
            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    )
}