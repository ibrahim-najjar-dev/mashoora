# Diwan - Consultation Services App

## Project Overview

Diwan is a React Native consultation services mobile application built with Expo that connects users with consultants for professional services. The app features phone-based authentication, AI assistance, service discovery, booking management, and real-time communication capabilities.

## Technology Stack

### Core Technologies

- **React Native** (0.79.5) with Expo SDK 53
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **Clerk** for authentication and user management
- **Convex** as the backend database and real-time system
- **NativeWind** (Tailwind CSS) for styling
- **React Native Reanimated** for animations

### Key Libraries

- **UI Components**: React Native Reusables, Lucide React Native icons
- **Video/Communication**: Stream Video SDK, WebRTC
- **Internationalization**: i18next, react-i18next
- **Animations**: React Native Reanimated, React Native Redash
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: Convex React Client
- **Form Handling**: React Native Phone Entry

## Project Structure

```
diwan/
├── app/                           # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout with providers
│   └── (app)/
│       ├── _layout.tsx           # App-level authentication guard
│       ├── (authenticated)/      # Protected routes
│       │   ├── _layout.tsx       # Role-based routing
│       │   ├── (user)/          # User role routes
│       │   │   ├── (tabs)/      # Main user navigation
│       │   │   │   ├── index.tsx          # Home (AI Assistant)
│       │   │   │   ├── explore.tsx        # Service Discovery
│       │   │   │   ├── bookings.tsx       # Booking Management
│       │   │   │   └── chat.tsx           # Chat/Communication
│       │   │   └── (modal)/     # Modal screens
│       │   └── (consultant)/    # Consultant role routes
│       └── (public)/            # Public routes (sign-in/up)
├── components/                  # Reusable UI components
├── constants/                   # App constants and configurations
├── context/                     # React contexts
├── convex/                      # Backend schema and functions
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions and providers
├── types/                       # TypeScript type definitions
└── i18n/                       # Internationalization setup
```

## Core Features

### 1. Authentication System

- **Provider**: Clerk with phone number authentication
- **Flow**: OTP-based sign-in/sign-up
- **Role Management**: User, Consultant, Admin roles
- **Protection**: Route-level authentication guards

### 2. User Journey

#### Home Page (`/index`)

- **AI Assistant**: Text area for user queries
- **Search Bar**: Quick consultation search
- **Quick Access**: Frequently used services
- **Recent Activity**: Recently opened consultations
- **Favorites**: Bookmarked consultants/services

#### Explore Page (`/explore`)

- **Service Cards**: Consultant services with detailed information
  - Consultant name and profile image
  - Service pricing
  - Languages spoken
  - Session duration
  - Category/specialization
  - Rating and reviews
  - Real-time availability
- **Filtering System**: Advanced filters for service discovery
- **Search Functionality**: Text-based service search

#### Bookings Page (`/bookings`)

- **Three Tabs**:
  - **Upcoming**: Future scheduled consultations
  - **History**: Past completed sessions
  - **Canceled**: Canceled appointments
- **Booking Cards**: Detailed booking information with status
- **Quick Actions**: Join calls, reschedule, cancel

#### Chat Page (`/chat`)

- **Placeholder**: Future video meeting integration
- **Communication**: Text and video consultation features

### 3. Consultant Dashboard

- **Protected Routes**: Role-based access control
- **Service Management**: Create and manage consultation services
- **Statistics**: Earnings, ratings, client metrics
- **Availability**: Set working hours and availability

## Database Schema (Convex)

### Users Table

```typescript
users: {
  phonenumber: string
  clerkUserId: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  createdAt: number
  updatedAt: number
  role: "user" | "consultant" | "admin"
}
```

### Consultant Profiles Table

```typescript
consultantProfiles: {
  userId: Id<"users">
  clerkUserId: string
  bio?: string
  createdAt: number
  updatedAt: number
}
```

### Services Table

```typescript
services: {
  consultantId: Id<"users">
  name: string
  description?: string
  price: number
  duration: number  // in minutes
  createdAt: number
  updatedAt: number
}
```

## UI/UX Features

### Design System

- **Dark/Light Theme**: Automatic theme switching
- **Typography**: Geist font family (Regular, Medium, SemiBold, Bold)
- **Icons**: Lucide React Native with Solar icon variants
- **Color Scheme**: Consistent color palette with theme support

### Animations

- **Header Animations**: Dynamic header with blur effects
- **Tab Transitions**: Smooth tab switching with indicators
- **Scroll Animations**: Parallax and scroll-driven animations
- **Search Transitions**: Animated search bar interactions

### Accessibility

- **RTL Support**: Right-to-left language support
- **Internationalization**: Multi-language support (Arabic, English)
- **Haptic Feedback**: Touch feedback for interactions
- **Safe Areas**: Proper safe area handling

## Current Implementation Status

### ✅ Completed Features

1. **Authentication Flow**: Complete Clerk integration
2. **Navigation Structure**: Full file-based routing setup
3. **UI Components**: Comprehensive component library
4. **Database Schema**: Basic tables and relationships
5. **User Interface**: All main screens with placeholder content
6. **Animations**: Core animation system
7. **Theming**: Dark/light mode support
8. **Internationalization**: i18n setup

### 🚧 In Progress

1. **Service Cards**: Basic implementation exists, needs data integration
2. **Booking System**: UI components ready, backend integration needed
3. **Filter System**: Filter UI exists, needs backend integration

### ❌ Pending Implementation

1. **Backend Integration**: Connect UI to Convex database
2. **Service Discovery**: Real service data and filtering
3. **Booking Management**: Complete booking workflow
4. **AI Assistant**: Integration with AI service
5. **Video Calls**: Stream Video SDK integration
6. **Real-time Features**: Live availability, notifications
7. **Consultant Features**: Service management, statistics
8. **Payment System**: Service pricing and payments

## Next Steps for Development

### Phase 1: Backend Foundation

1. **Expand Database Schema**

   - Add booking tables
   - Add service categories and tags
   - Add availability management
   - Add rating and review system

2. **Create Convex Functions**

   - Service CRUD operations
   - Booking management functions
   - User profile management
   - Search and filtering queries

3. **Data Integration**
   - Connect service cards to real data
   - Implement service filtering
   - Add real-time availability updates

### Phase 2: Core Features

1. **Booking System**

   - Complete booking workflow
   - Calendar integration
   - Availability checking
   - Booking confirmation and management

2. **Search and Discovery**

   - Implement advanced filtering
   - Add search functionality
   - Category-based browsing
   - Recommendation system

3. **AI Assistant**
   - Integrate AI service for queries
   - Natural language processing
   - Context-aware suggestions

### Phase 3: Communication

1. **Video Integration**

   - Stream Video SDK setup
   - Call management
   - Screen sharing capabilities
   - Recording features

2. **Chat System**
   - Real-time messaging
   - File sharing
   - Message history

### Phase 4: Advanced Features

1. **Payment Integration**

   - Payment processing
   - Subscription management
   - Invoice generation

2. **Analytics and Reports**

   - User analytics
   - Consultant performance metrics
   - Revenue tracking

3. **Notifications**
   - Push notifications
   - Email notifications
   - In-app notifications

## Development Guidelines

### Code Standards

- Use TypeScript for all new code
- Follow React Native best practices
- Implement proper error handling
- Add loading states for all async operations
- Use React Query/Convex for data fetching

### Testing Strategy

- Unit tests for utility functions
- Integration tests for key user flows
- E2E tests for critical paths
- Performance testing for animations

### Performance Considerations

- Optimize FlatList rendering for large datasets
- Implement proper image caching
- Use React.memo for expensive components
- Optimize animations for 60fps

## Environment Setup

### Required Environment Variables

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_CONVEX_URL=your_convex_url
```

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Run on specific platform
npm run android
npm run ios
npm run web

# Lint code
npm run lint
```

## Deployment Strategy

### Development

- Use Expo Development Builds
- Hot reloading for rapid development
- Device testing on multiple platforms

### Staging

- EAS Build for internal testing
- TestFlight for iOS testing
- Internal distribution for Android

### Production

- App Store and Google Play deployment
- OTA updates for quick fixes
- Analytics and crash reporting

## Security Considerations

### Authentication

- Secure token storage with Clerk
- Phone number verification
- Role-based access control

### Data Protection

- Encrypt sensitive data
- Secure API communications
- Privacy compliance (GDPR, CCPA)

### Video Security

- End-to-end encryption for calls
- Secure recording storage
- Access control for recordings

## Conclusion

Diwan is a well-architected consultation services app with a solid foundation. The current implementation focuses on UI/UX and navigation structure. The next phase should prioritize backend integration and core booking functionality to create a fully functional MVP.

The modular architecture and comprehensive component library provide a strong foundation for rapid feature development and easy maintenance.
