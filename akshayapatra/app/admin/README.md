# Admin Panel

A comprehensive admin dashboard built with Next.js 15, following the design specifications from your Figma mockups.

## Features

- **🎨 Modern UI Design** - Orange-themed gradient design matching your Figma specifications
- **📱 Responsive Layout** - Mobile-first design with collapsible sidebar
- **🌙 Dark Mode Support** - Toggle between light and dark themes
- **📊 Interactive Charts** - Custom-built charts without external dependencies
- **🔍 Advanced Search & Filtering** - Real-time search and filtering capabilities
- **📋 Data Tables** - Sortable, paginated tables with export functionality
- **✨ Smooth Animations** - Framer Motion powered animations
- **🎯 Role-based Access** - Staff management with role-based permissions

## Structure

```
/app/admin/
├── layout.tsx                 # Main admin layout with sidebar
├── page.tsx                   # Dashboard overview
├── users/page.tsx            # User management
├── income/page.tsx           # Income tracking
├── referrals/page.tsx        # Referral management
├── support/page.tsx          # Support requests
├── staff/page.tsx            # Staff management
├── settings/page.tsx         # Admin settings
└── README.md                 # This file

/app/components/admin/
├── AdminSidebar.tsx          # Navigation sidebar
├── AdminHeader.tsx           # Top header with search & user info
├── StatCard.tsx              # Reusable stats cards
├── SimpleChart.tsx           # Custom chart components
└── DataTable.tsx             # Reusable data table component
```

## Pages Overview

### 1. Dashboard Overview (`/admin`)
- Total users, new users, active users statistics
- Income overview cards
- Quick support search
- Monthly growth charts
- Top promoters and commission breakdown

### 2. User Management (`/admin/users`)
- User statistics (total, new, active, inactive)
- Searchable user table with filters
- User details and status management
- Export functionality

### 3. Income Tracking (`/admin/income`)
- Total and monthly income statistics
- Transaction history
- Income breakdown by source
- Direct vs indirect income charts

### 4. Referral Management (`/admin/referrals`)
- Referral statistics and trends
- Top referring clients
- Recent referrals table
- Success/pending referral metrics
- Direct vs referral comparison charts

### 5. Support Dashboard (`/admin/support`)
- Support request statistics
- Multi-channel support tracking (WhatsApp, calls, live chat)
- Support tickets table with status tracking
- Response time analytics

### 6. Staff Management (`/admin/staff`)
- Role-based staff organization
- Staff member cards with actions
- Task management by role (Draw Manage, Advice, Checking)
- Role assignment and modification

### 7. Settings (`/admin/settings`)
- Profile management
- Security settings with 2FA
- Notification preferences
- System configuration
- Appearance settings
- Integrations

## Components

### StatCard
Reusable statistics card component with:
- Title, value, and subtitle display
- Change indicators (increase/decrease)
- Custom icons
- Trend visualization
- Gradient background support

### SimpleChart
Custom chart component supporting:
- Bar charts
- Doughnut/pie charts
- Line charts (simplified)
- Animations and hover effects
- Dark mode support

### DataTable
Feature-rich table component with:
- Search functionality
- Column sorting
- Pagination
- Status badges
- Export options
- Responsive design

### AdminSidebar
Navigation sidebar featuring:
- Collapsible on mobile
- Active state highlighting
- User profile section
- Smooth animations

### AdminHeader
Top navigation with:
- Search functionality
- Theme toggle
- Notifications
- User profile
- Export options

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **State Management**: React Hooks

## Best Practices Implemented

1. **Component Reusability** - Modular components in `/app/components/admin/`
2. **Type Safety** - Full TypeScript implementation
3. **Performance** - Optimized with React best practices
4. **Accessibility** - ARIA labels and keyboard navigation
5. **Responsive Design** - Mobile-first approach
6. **Code Organization** - Clear folder structure and naming conventions
7. **Dark Mode** - Consistent theme support across all components

## Getting Started

1. Navigate to `/admin` to access the dashboard
2. Use the sidebar to navigate between different sections
3. All data is currently mocked - integrate with your API endpoints
4. Customize colors and styling in the component files as needed

## Future Enhancements

- Real-time data updates
- Advanced filtering options
- Bulk operations
- PDF report generation
- Advanced analytics
- Role-based route protection
- Multi-language support

The admin panel is fully functional and ready for integration with your backend APIs. All components are built with extensibility in mind, making it easy to add new features or modify existing ones.