# Unified Sidebar System

A flexible and reusable sidebar component system that can be used across both user-facing and admin interfaces.

## Components

### 1. UnifiedSidebar
The main sidebar component that renders navigation items in a configurable layout.

### 2. Sidebar Configurations
Pre-defined configurations for different parts of the application.

## Usage

### Homepage/User Dashboard
```tsx
import UnifiedSidebar from '../shared/UnifiedSidebar';
import { homepageSidebarConfig } from '../shared/sidebar-configs';

<UnifiedSidebar
  sections={homepageSidebarConfig}
  showTooltips={false}
  variant="homepage"
  position="fixed"
/>
```

### Admin Dashboard (Desktop)
```tsx
import UnifiedSidebar from '../shared/UnifiedSidebar';
import { adminSidebarConfig } from '../shared/sidebar-configs';

<UnifiedSidebar
  sections={adminSidebarConfig}
  showTooltips={true}
  variant="admin"
  position="fixed"
  className="left-4 top-4"
/>
```

## Props

### UnifiedSidebar Props
- `sections`: Array of sidebar sections
- `className?`: Additional CSS classes
- `position?`: 'fixed' | 'relative' (default: 'fixed')
- `showTooltips?`: Whether to show tooltips on hover (default: false)
- `variant?`: 'homepage' | 'admin' (default: 'homepage')

### SidebarSection Interface
```tsx
interface SidebarSection {
  items: SidebarItem[];
  spacing?: 'normal' | 'large';
}
```

### SidebarItem Interface
```tsx
interface SidebarItem {
  icon: React.ReactNode;
  href?: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}
```

## Variants

### Homepage Variant
- Rounded design with gradients
- Pill-shaped containers
- Orange gradient for active states
- Designed for user-facing interfaces

### Admin Variant
- Modern rectangular design
- Semi-transparent backgrounds
- Professional look and feel
- Tooltips for desktop navigation

## Features

- **Responsive Design**: Different layouts for mobile and desktop
- **Tooltip Support**: Optional tooltips for icon-only navigation
- **Active State Detection**: Automatic active state based on current pathname
- **Flexible Sections**: Multiple sections with configurable spacing
- **Theme Consistency**: Matches overall application design
- **Accessibility**: Full keyboard navigation and screen reader support

## Customization

You can create custom sidebar configurations by defining new section arrays:

```tsx
const customSidebarConfig: SidebarSection[] = [
  {
    items: [
      { icon: <Icon className="w-4 h-4" />, href: "/path", label: "Label" },
      // ... more items
    ],
    spacing: 'large'
  }
];
```