# Frontend Routing Structure & Components

## Route Tree Overview

### Public Routes (No Authentication Required)
- `/login` - Login page
- `/unauthorized` - Unauthorized access page

### Protected Routes (Requires Authentication via `<PrivateRoute>`)
- `/` - Dashboard/Home
- `/home` - Alternative home route
- `/accounts/:accountEmail/threads` - Email threads for specific account
- `/emails` - All emails overview
- `/accounts/:account/emails/:threadId` - Individual email thread view
- `/chats` - Team chats interface
- `*` - 404 error page (catch-all)

## Detailed Routing Table

| Route | Component | Protected? | Key Features | Description |
|-------|-----------|------------|--------------|-------------|
| `/login` | `Login` | ❌ Public | • Email/password form<br/>• Token-based auth<br/>• Auto-redirect on success<br/>• Error handling | User authentication page with login form and validation |
| `/unauthorized` | `Unauthorized` | ❌ Public | • Access denied message<br/>• Navigation back to login<br/>• Clean error UI | Shown when user lacks proper permissions |
| `/` | `AllAccounts` | ✅ Protected | • Account listing<br/>• Account management<br/>• Quick actions<br/>• Responsive grid layout | Main dashboard showing all email accounts |
| `/home` | `AllAccounts` | ✅ Protected | • Same as root route<br/>• Alternative entry point<br/>• Post-login redirect target | Alternative home page (redirects to accounts) |
| `/accounts/:accountEmail/threads` | `AccountThreads` | ✅ Protected | • Thread listing by account<br/>• Search and filter<br/>• Thread preview<br/>• Pagination support<br/>• Account sync functionality<br/>• Tab-based view (Inbox/Sent/All) | Shows email threads for specific account with comprehensive management features |
| `/emails` | `Emails` | ✅ Protected | • Unified email view<br/>• Advanced filtering<br/>• Bulk actions<br/>• Read/unread status<br/>• Labels and categories<br/>• Pagination | Comprehensive email management interface |
| `/accounts/:account/emails/:threadId` | `EmailContainer` | ✅ Protected | • Full thread view<br/>• Message expansion/collapse<br/>• Attachment handling<br/>• Reply functionality<br/>• Thread navigation | Detailed view of individual email threads |
| `/chats` | `Chats` | ✅ Protected | • Team chat interface<br/>• Real-time messaging<br/>• File attachments<br/>• Participant management<br/>• Channel organization | Team collaboration and messaging |
| `*` (catch-all) | `Error404` | ❌ Public | • 404 error page<br/>• Navigation back home<br/>• Clean error messaging | Handles all unmatched routes |

## Context & State Management

### AuthProvider Context (`UserContext`)
**Location**: `src/context/AuthProvider.js`

**State Properties**:
- `isAuthenticated`: Boolean - User login status
- `user`: Object - Current user data
- `company`: Object - Company information
- `admin`: Object - Admin privileges
- `loading`: Boolean - Authentication loading state

**Methods**:
- `login(user)`: Authenticate user and set state
- `logout()`: Clear user session and state
- `Errors(error)`: Handle and display API errors

## Component Examples with Mocked Data

### Emails.jsx Features
```jsx
const mockEmails = [
  {
    id: 1,
    subject: "Project Status Update - Q4 2024",
    from: "john.doe@company.com",
    to: "team@company.com",
    date: "2024-01-15T10:30:00Z",
    snippet: "Here's the latest update on our Q4 project milestones...",
    isRead: false,
    isImportant: true,
    labels: ["Work", "Projects"]
  }
  // ... more email objects
];
```

**Key Features**:
- Email list with read/unread status
- Star/importance indicators
- Label-based categorization
- Date formatting and display
- Search and filter capabilities
- Pagination support
- Bulk action buttons

### Chats.jsx Features
```jsx
const mockChats = [
  {
    spaceId: 'chat-1',
    displayName: 'Project Alpha Team',
    lastActivity: '2024-01-15T14:30:00Z',
    participantCount: 5,
    unreadCount: 3,
    messages: [
      {
        id: 'msg-1',
        sender: 'John Doe',
        text: 'Hey team, just uploaded the latest design mockups...',
        createTime: '2024-01-15T14:30:00Z',
        attachments: [...]
      }
    ]
  }
];
```

**Key Features**:
- Multi-chat interface
- Message threads with timestamps
- File attachment support
- Participant count and status
- Unread message indicators
- Real-time message input
- Avatar generation from initials

## Authentication Flow

### PrivateRoute Component
**Location**: `src/components/PrivateRoute.jsx`

**Flow**:
1. Check authentication status from context
2. Show loading spinner while verifying
3. Redirect to `/login` if not authenticated
4. Render protected component if authenticated

```jsx
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(UserContext);
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};
```

## Layout Structure

### AuthLayout
**Location**: `src/layout/AuthLayout.jsx`
- Provides consistent layout for authenticated pages
- Includes navigation, sidebar, and content area
- Responsive design with mobile support

### App Structure
```
App.js
├── UserContextProvider (Context wrapper)
├── BrowserRouter
├── Routes
│   ├── Public Routes
│   │   ├── /login → Login
│   │   └── /unauthorized → Unauthorized
│   └── Protected Routes (wrapped in PrivateRoute)
│       ├── / → AllAccounts
│       ├── /home → AllAccounts
│       ├── /accounts/:accountEmail/threads → AccountThreads
│       ├── /emails → Emails
│       ├── /accounts/:account/emails/:threadId → EmailContainer
│       ├── /chats → Chats
│       └── * → Error404
└── Toaster (Notifications)
```

## Technical Implementation Notes

### Route Parameters
- `:accountEmail` - Email address of the account (URL encoded)
- `:account` - Account identifier
- `:threadId` - Unique thread identifier

### State Management
- Context API for global authentication state
- Local component state for UI interactions
- Token-based authentication with localStorage

### Error Handling
- Comprehensive error boundary
- Toast notifications for user feedback
- Graceful fallbacks for failed API calls

### Performance Considerations
- Lazy loading for heavy components
- Memoization for expensive calculations
- Pagination for large datasets
- Optimistic UI updates where appropriate

## Future Enhancements
- Role-based routing (Admin, User, etc.)
- Dynamic route generation based on permissions
- Route-level data prefetching
- Advanced caching strategies
- Real-time updates via WebSocket integration
