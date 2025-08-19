# Loading Component Integration Guide

This guide shows how to effectively use your existing `Loading.jsx` component throughout your chat application.

## Your Existing Loading Component Features

Your `Loading.jsx` component already includes:
- ✅ 6 animation variants (spinner, dots, pulse, bars, ring, text)
- ✅ 5 size options (xs, sm, md, lg, xl) 
- ✅ 5 colors (blue, green, red, gray, white)
- ✅ 3 themes (light, dark, transparent)
- ✅ Multiple display modes (default, inline, overlay, fullPage)
- ✅ Specialized components (ButtonLoader, PageLoader, etc.)
- ✅ Loading states hook (useLoadingStates)

## Integration Examples for Your Chat App

### 1. Chat List Loading

```jsx
// In your chat list component
import Loading, { SkeletonLoader } from '../components/Loading';

const ChatList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState([]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {/* Show multiple chat item skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} lines={2} height="h-3" className="p-3 border rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {chats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
    </div>
  );
};
```

### 2. Message Loading States

```jsx
// In your chat messages component
import Loading, { ChatLoader } from '../components/Loading';

const ChatMessages = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  if (isLoadingMessages) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        <ChatLoader />
        <ChatLoader />
        <ChatLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {messages.map(message => <ChatMessage key={message.id} message={message} />)}
    </div>
  );
};
```

### 3. Sync Operation Loading

```jsx
// For chat sync operations
import { OverlayLoader, useLoadingStates } from '../components/Loading';

const ChatSync = () => {
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  
  const handleSync = async () => {
    setShowSyncOverlay(true);
    try {
      await syncChats();
    } finally {
      setShowSyncOverlay(false);
    }
  };

  return (
    <>
      <button onClick={handleSync} className="bg-blue-500 text-white px-4 py-2 rounded">
        Sync Chats
      </button>
      
      <OverlayLoader 
        show={showSyncOverlay}
        message="Syncing chats and processing attachments..."
        variant="dots"
        theme="light"
      />
    </>
  );
};
```

### 4. Button Loading States

```jsx
// For form submissions and actions
import { ButtonLoader, useLoadingStates } from '../components/Loading';

const MessageForm = () => {
  const { setLoading, isLoading } = useLoadingStates();

  const handleSend = async () => {
    setLoading('send', true);
    try {
      await sendMessage();
    } finally {
      setLoading('send', false);
    }
  };

  const handleSave = async () => {
    setLoading('save', true);
    try {
      await saveMessage();
    } finally {
      setLoading('save', false);
    }
  };

  return (
    <div className="flex space-x-2">
      <button 
        onClick={handleSend}
        disabled={isLoading('send')}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
      >
        {isLoading('send') && <ButtonLoader />}
        <span>Send</span>
      </button>
      
      <button 
        onClick={handleSave}
        disabled={isLoading('save')}
        className="bg-green-500 text-white px-4 py-2 rounded flex items-center space-x-2"
      >
        {isLoading('save') && <ButtonLoader />}
        <span>Save Draft</span>
      </button>
    </div>
  );
};
```

### 5. Media Processing Loading

```jsx
// For media/attachment processing
import Loading, { InlineLoader } from '../components/Loading';

const MediaAttachment = ({ attachment }) => {
  const [isProcessing, setIsProcessing] = useState(attachment.processing);

  if (isProcessing) {
    return (
      <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <InlineLoader variant="pulse" size="sm" />
          <span className="text-sm text-gray-600">Processing {attachment.type}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="media-attachment">
      {/* Rendered media content */}
    </div>
  );
};
```

### 6. Page-Level Loading

```jsx
// For full page loading states
import { PageLoader } from '../components/Loading';

const App = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    initializeApp().finally(() => setIsAppLoading(false));
  }, []);

  if (isAppLoading) {
    return <PageLoader message="Loading Email Scraper..." theme="light" variant="spinner" />;
  }

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
};
```

### 7. Data Fetching Loading

```jsx
// For API calls and data fetching
import Loading, { CardLoader } from '../components/Loading';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return <CardLoader message="Loading profile..." height="h-48" variant="pulse" />;
  }

  return (
    <div className="user-profile">
      {/* User profile content */}
    </div>
  );
};
```

### 8. Table/List Loading

```jsx
// For tables and lists
import { TableLoader } from '../components/Loading';

const MessageTable = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <TableLoader rows={6} columns={4} />
      </div>
    );
  }

  return (
    <table className="w-full">
      {/* Table content */}
    </table>
  );
};
```

## Common Usage Patterns

### Pattern 1: Simple Loading State
```jsx
{isLoading ? (
  <Loading variant="spinner" message="Loading..." />
) : (
  <YourContent />
)}
```

### Pattern 2: Skeleton Loading
```jsx
{isLoading ? (
  <SkeletonLoader lines={4} height="h-4" />
) : (
  <YourContent />
)}
```

### Pattern 3: Button Loading
```jsx
<button disabled={isLoading}>
  {isLoading && <ButtonLoader />}
  Action Button
</button>
```

### Pattern 4: Multiple Loading States
```jsx
const { setLoading, isLoading } = useLoadingStates();

// Use for different operations
setLoading('sync', true);
setLoading('save', true);
setLoading('delete', true);

// Check specific loading states
if (isLoading('sync')) { /* ... */ }
```

## Best Practices for Your App

### 1. Use Appropriate Variants
- **spinner**: General purpose loading
- **dots**: Inline or space-constrained areas
- **pulse**: Subtle loading indication
- **bars**: Data processing visualization
- **ring**: Modern alternative to spinner
- **text**: Minimal text-based loading

### 2. Theme Consistency
```jsx
// Match your app's theme
<Loading theme="light" /> // For light backgrounds
<Loading theme="dark" />  // For dark backgrounds
<Loading theme="transparent" /> // For flexible backgrounds
```

### 3. Size Selection
```jsx
<Loading size="xs" /> // Very small spaces
<Loading size="sm" /> // Buttons, inline elements
<Loading size="md" /> // Default, cards, forms
<Loading size="lg" /> // Major sections, overlays
<Loading size="xl" /> // Full page, important loading
```

### 4. Meaningful Messages
```jsx
// Good - specific and informative
<Loading message="Syncing chat messages..." />
<Loading message="Processing attachments..." />
<Loading message="Saving changes..." />

// Avoid - generic and unhelpful  
<Loading message="Loading..." />
<Loading message="Please wait..." />
```

### 5. Performance Tips
```jsx
// Don't show loading for very quick operations
const [showLoading, setShowLoading] = useState(false);

const quickOperation = async () => {
  const timer = setTimeout(() => setShowLoading(true), 500); // Only show after 500ms
  try {
    await operation();
  } finally {
    clearTimeout(timer);
    setShowLoading(false);
  }
};
```

## Integration Checklist

- [ ] Replace any basic spinners with your Loading component
- [ ] Use specialized loaders (ButtonLoader, PageLoader, etc.) where appropriate
- [ ] Implement loading states for all async operations
- [ ] Use skeleton loaders for content placeholders
- [ ] Add meaningful loading messages
- [ ] Ensure consistent theming across your app
- [ ] Test loading states on mobile devices
- [ ] Verify accessibility with screen readers

Your existing Loading component is excellent and covers all the use cases you'll need for a professional chat application!
