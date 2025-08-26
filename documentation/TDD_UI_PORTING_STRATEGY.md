# TDD UI Porting Strategy: bndy-backstage → bndy-portal

## Overview

This document outlines the strategic approach for porting the rich, user-centered UI components from bndy-backstage to bndy-portal using Test-Driven Development methodology while maintaining visual precision.

## Current Analysis Summary

The bndy-backstage application contains sophisticated UI components that we need to port:

### **Key Components to Port:**
1. **Collapsible Sections** - Rich expand/collapse UI with animations
2. **Navigation System** - Responsive sidebar + mobile navigation  
3. **Header Components** - Context-aware headers with state indicators
4. **Footer Integration** - ThinFooter from bndy-ui
5. **My Profile Page** - Basic Info, Musical Skills, Profile Image sections
6. **Dashboard Components** - My Dashboard, My Calendar, My Artists
7. **Layout Architecture** - MainLayout with responsive behavior

### **Visual Sophistication:**
- Framer Motion animations throughout
- Dark/light theme integration with CSS variables
- Feature-based color categorization system
- Mobile-first responsive design
- Touch-friendly interactions
- Context-aware headers (Dashboard vs Backstage modes)

## TDD Implementation Strategy

### **Phase 1: Foundation Components (Week 1-2)**
Build the fundamental building blocks with TDD methodology.

#### **1.1 Theme System & CSS Variables**
**Priority**: Critical foundation
**TDD Approach**: 
- Test theme context switching
- Test CSS variable application
- Test dark/light mode persistence

**Files to Create:**
- `src/context/ThemeContext.tsx`
- `src/styles/theme-variables.css`
- `src/hooks/useTheme.tsx`

#### **1.2 CollapsibleSection Component**
**Priority**: Core UI pattern used everywhere
**TDD Approach**:
- Test expand/collapse behavior
- Test animation states
- Test accessibility (ARIA attributes)
- Test keyboard navigation

**Files to Create:**
- `src/components/ui/CollapsibleSection.tsx`
- `src/components/ui/__tests__/CollapsibleSection.test.tsx`

#### **1.3 Base Layout Components** 
**Priority**: Foundation for all pages
**TDD Approach**:
- Test responsive behavior
- Test sidebar toggle functionality
- Test mobile overlay system
- Test authentication integration

**Files to Create:**
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/__tests__/MainLayout.test.tsx`
- `src/components/layout/__tests__/Sidebar.test.tsx`

### **Phase 2: Header & Navigation (Week 2-3)**
Build the navigation and header system with full responsive behavior.

#### **2.1 Application Header**
**TDD Approach**:
- Test pre-auth vs post-auth states
- Test context indicators (Dashboard vs Backstage)
- Test mobile hamburger menu
- Test theme toggle integration

**Files to Create:**
- `src/components/layout/AppHeader.tsx`
- `src/components/layout/__tests__/AppHeader.test.tsx`

#### **2.2 Navigation System**
**TDD Approach**:
- Test active state indicators
- Test responsive sidebar behavior
- Test mobile navigation overlay
- Test navigation state management

**Files to Create:**
- `src/components/navigation/NavigationItems.tsx`
- `src/components/navigation/MobileNavigation.tsx`
- `src/components/navigation/__tests__/NavigationItems.test.tsx`

### **Phase 3: Profile System (Week 3-5)**
Port the rich profile components with expand/collapse functionality.

#### **3.1 Basic Profile Components**
**TDD Approach**:
- Test profile image upload and preview
- Test form validation and state management
- Test location lookup integration
- Test responsive behavior

**Files to Create:**
- `src/components/profile/ProfileImageSection.tsx`
- `src/components/profile/BasicInfoSection.tsx`
- `src/components/profile/MusicalSkillsSection.tsx`
- `src/components/profile/__tests__/ProfileImageSection.test.tsx`

#### **3.2 Complete Profile Page**
**TDD Approach**:
- Test section orchestration
- Test data persistence
- Test loading states
- Test error handling

**Files to Create:**
- `src/app/profile/page.tsx`
- `src/app/profile/__tests__/page.test.tsx`

### **Phase 4: Dashboard System (Week 5-7)**
Build the dashboard with calendar and artist management.

#### **4.1 Dashboard Components**
**TDD Approach**:
- Test collapsible dashboard sections
- Test empty states vs populated states
- Test responsive grid layouts
- Test card interactions

**Files to Create:**
- `src/components/dashboard/UserDashboard.tsx`
- `src/components/dashboard/ArtistSection.tsx`
- `src/components/dashboard/NextSevenDays.tsx`
- `src/components/dashboard/__tests__/UserDashboard.test.tsx`

#### **4.2 Calendar Integration**
**TDD Approach**:
- Test calendar mode switching
- Test event display and creation
- Test availability setting
- Test modal interactions

**Files to Create:**
- `src/app/calendar/page.tsx`
- `src/components/calendar/CalendarContainer.tsx`
- `src/app/calendar/__tests__/page.test.tsx`

### **Phase 5: Advanced Features (Week 7-8)**
Complete the system with advanced functionality.

#### **5.1 Artist Management**
- My Artists page with card layout
- Artist creation and editing
- Backstage context switching

#### **5.2 Security & Settings**
- Complete security tab implementation
- Password change functionality  
- Account settings management

## Implementation Order & Dependencies

### **Week 1: Foundation**
```bash
1. Theme system setup with TDD
2. CollapsibleSection component (19 tests)
3. Basic layout structure
```

### **Week 2: Navigation**  
```bash
1. AppHeader with context indicators
2. Sidebar with responsive behavior
3. Mobile navigation overlay
```

### **Week 3-4: Profile System**
```bash
1. Profile image upload component
2. Basic information section
3. Musical skills multi-select
4. Complete profile page integration
```

### **Week 5-6: Dashboard**
```bash
1. Dashboard layout with sections
2. Artist cards and management
3. Calendar integration
4. My Artists functionality
```

### **Week 7-8: Polish & Advanced**
```bash
1. Security and settings pages
2. Animation polish with Framer Motion
3. Performance optimizations
4. Accessibility improvements
```

## TDD Testing Strategy

### **Component Testing Patterns**

#### **Visual Component Tests**
```typescript
describe('CollapsibleSection', () => {
  it('should expand when clicked', () => {
    // Test animation state changes
  });
  
  it('should maintain visual consistency across themes', () => {
    // Test dark/light theme rendering
  });
  
  it('should be touch-friendly on mobile', () => {
    // Test touch target sizes
  });
});
```

#### **Responsive Behavior Tests**
```typescript
describe('Sidebar', () => {
  it('should transform to overlay on mobile', () => {
    // Test responsive breakpoint behavior
  });
  
  it('should maintain state across screen size changes', () => {
    // Test responsive state persistence
  });
});
```

#### **Animation & Interaction Tests**
```typescript
describe('AppHeader', () => {
  it('should animate context pills on mobile', () => {
    // Test CSS animation triggers
  });
  
  it('should handle hamburger menu toggle', () => {
    // Test mobile menu state management
  });
});
```

## Visual Precision Maintenance

### **Design Token System**
- Port exact color values from bndy-backstage
- Maintain spacing and typography scales
- Preserve animation timings and easings

### **CSS Variable Mapping**
```css
/* Feature-based color categories */
--profile-bg: theme('colors.blue.50');
--profile-hover: theme('colors.blue.100');
--music-bg: theme('colors.purple.50');
--music-hover: theme('colors.purple.100');
```

### **Component Props Consistency**
- Match exact prop interfaces from bndy-backstage
- Preserve component composition patterns
- Maintain responsive breakpoint behavior

## Success Metrics

### **Test Coverage Goals**
- **95%+ test coverage** for all UI components
- **100% visual regression prevention** through comprehensive tests
- **Complete responsive behavior coverage** (mobile, tablet, desktop)

### **Visual Fidelity**
- **Pixel-perfect component recreation** compared to bndy-backstage
- **Consistent animation timing** and visual feedback
- **Preserved user experience patterns** and interaction flows

### **Performance Targets**
- **Fast component render times** with optimized re-renders
- **Smooth animations** without jank on mobile devices
- **Efficient bundle sizes** with tree-shaking optimizations

## Getting Started

### **Immediate Next Steps**

1. **Start with Theme System**: Establish the CSS variable foundation
   ```bash
   npm run test -- --watch src/context/__tests__/ThemeContext.test.tsx
   ```

2. **Build CollapsibleSection**: Core UI pattern used everywhere
   ```bash
   npm run test -- --watch src/components/ui/__tests__/CollapsibleSection.test.tsx
   ```

3. **Create MainLayout**: Foundation for all authenticated pages
   ```bash
   npm run test -- --watch src/components/layout/__tests__/MainLayout.test.tsx
   ```

This strategy ensures we build a solid, tested foundation while maintaining the rich user experience that makes bndy-backstage compelling, but with the reliability and maintainability that comes from TDD methodology.