import {
  Home, Zap, UserCheck, MessageSquare, Clock, Target, 
  Lightbulb, Wrench, Star, Sparkles, LogOut
} from 'lucide-react'

export const menuItems = {
 
  dashboard: {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },


  actionRequired: {
    label: 'Action Required',
    icon: Zap,
    href: '/action-required',
    children: [
      { id: 'assigned', label: 'Assigned', icon: UserCheck, href: '/action-required?tab=assigned' },
      { id: 'mentions', label: 'Mentions', icon: MessageSquare, href: '/action-required?tab=mentions' },
      { id: 'stale', label: 'Stale PRs', icon: Clock, href: '/action-required?tab=stale' }
    ]
  },


  quickWins: {
    label: 'Quick Wins',
    icon: Target,
    href: '/quick-wins',
    children: [
      { id: 'good-issues', label: 'Good First Issues', icon: Lightbulb, href: '/quick-wins?tab=good-issues' },
      { id: 'easy-fixes', label: 'Easy Fixes', icon: Wrench, href: '/quick-wins?tab=easy-fixes' }
    ]
  },


  favorites: { label: 'Favorites', icon: Star, disabled: true },
  recent: { label: 'Recent', icon: Clock, disabled: true },
  discovery: { label: 'Discovery', icon: Sparkles, disabled: true },


  logout: { label: 'Logout', icon: LogOut, action: 'logout' }
}