# Loading System Documentation

A comprehensive and flexible loading component system for React applications that provides beautiful, consistent loading states across your entire application.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Props & Options](#props--options)
4. [Usage Examples](#usage-examples)
5. [Theming & Customization](#theming--customization)
6. [Best Practices](#best-practices)

## Overview

This loading system provides multiple loading components designed for different use cases:

- **Loading**: Core loading component with multiple animation variants
- **ButtonLoader**: Specialized loader for buttons  
- **PageLoader**: Full page loading overlay
- **OverlayLoader**: Customizable overlay loader
- **CardLoader**: Loading placeholder for card containers
- **InlineLoader**: Small inline loading indicator
- **TableLoader**: Skeleton loader for tables
- **SkeletonLoader**: Generic skeleton loading animation
- **ChatLoader**: Specialized skeleton for chat interfaces
- **useLoadingStates**: React hook for managing multiple loading states

## Components

### Loading (Core Component)

The main loading component with multiple animation variants.

```jsx
import Loading from './LoadingSystem';

<Loading 
  variant="spinner" 
  size="md" 
  color="blue" 
  message="Loading..." 
  theme="light"
/>
```

**Variants:**
- `spinner` - Classic spinning circle
- `dots` - Bouncing dots animation
- `pulse` - Pulsing circle animation  
- `bars` - Animated bars
- `ring` - Ring with rotating section
- `text` - Text-only loading indicator

**Sizes:**
- `xs` - Extra small (16px)
- `sm` - Small (20px) 
- `md` - Medium (24px) - default
- `lg` - Large (32px)
- `xl` - Extra large (40px)

**Colors:**
- `blue` - Blue theme (default)
- `green` - Green theme
- `red` - Red theme  
- `gray` - Gray theme
- `white` - White theme

**Themes:**
- `light` - Light background (default)
- `dark` - Dark background
- `transparent` - Transparent background

### ButtonLoader

Compact loader designed specifically for buttons.

```jsx
import { ButtonLoader } from './LoadingSystem';

<button disabled={isLoading}>
  {isLoading && <ButtonLoader />}
  Save Changes
</button>
```

### PageLoader

Full-page loading overlay that covers the entire viewport.

```jsx
import { PageLoader } from './LoadingSystem';

<PageLoader 
  message="Loading application..." 
  theme="light" 
  variant="spinner"
/>
```

### OverlayLoader

Customizable overlay that can be shown conditionally.

```jsx
import { OverlayLoader } from './LoadingSystem';

<OverlayLoader 
  show={isProcessing} 
  message="Processing your request..." 
  variant="dots"
  theme="light"
  backdrop="blur"
/>
```

**Backdrop Options:**
- `blur` - Blurred backdrop
- `solid` - Solid color backdrop
- `transparent` - Transparent backdrop

### CardLoader

Loading placeholder for card containers and content areas.

```jsx
import { CardLoader } from './LoadingSystem';

<CardLoader 
  message="Loading content..." 
  height="h-48" 
  variant="spinner"
/>
```

### InlineLoader

Small inline loading indicator for use within text or small spaces.

```jsx
import { InlineLoader } from './LoadingSystem';

<div>
  Saving your changes... <InlineLoader variant="dots" />
</div>
```

### SkeletonLoader

Generic skeleton loading animation for text content.

```jsx
import { SkeletonLoader } from './LoadingSystem';

<SkeletonLoader 
  lines={5} 
  height="h-4" 
  className="mb-4"
  animate={true}
/>
```

### TableLoader

Specialized skeleton loader for table layouts.

```jsx
import { TableLoader } from './LoadingSystem';

<TableLoader 
  rows={5} 
  columns={4}
  showHeader={true}
/>
```

### ChatLoader

Skeleton loader designed specifically for chat message interfaces.

```jsx
import { ChatLoader } from './LoadingSystem';

<ChatLoader />
```

### useLoadingStates Hook

React hook for managing multiple loading states efficiently.

```jsx
import { useLoadingStates } from './LoadingSystem';

const MyComponent = () => {
  const { setLoading, isLoading, loadingStates } = useLoadingStates();

  const handleSave = async () => {
    setLoading('save', true);
    try {
      await saveData();
    } finally {
      setLoading('save', false);
    }
  };

  return (
    <button disabled={isLoading('save')} onClick={handleSave}>
      {isLoading('save') && <ButtonLoader />}
      Save Changes
    </button>
  );
};
```

## Props & Options

### Loading Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'spinner'` | Animation variant |
| `size` | `string` | `'md'` | Size of the loader |
| `color` | `string` | `'blue'` | Color theme |
| `theme` | `string` | `'light'` | Background theme |
| `message` | `string` | `null` | Loading message text |
| `className` | `string` | `''` | Additional CSS classes |

### OverlayLoader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | `true` | Whether to show the overlay |
| `message` | `string` | `'Loading...'` | Loading message |
| `variant` | `string` | `'spinner'` | Animation variant |
| `theme` | `string` | `'light'` | Color theme |
| `backdrop` | `string` | `'blur'` | Backdrop style |
| `closeable` | `boolean` | `false` | Show close button |
| `onClose` | `function` | `null` | Close callback |

### SkeletonLoader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | `number` | `3` | Number of skeleton lines |
| `height` | `string` | `'h-4'` | Height of each line |
| `className` | `string` | `''` | Additional CSS classes |
| `animate` | `boolean` | `true` | Enable animation |

### TableLoader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `5` | Number of skeleton rows |
| `columns` | `number` | `4` | Number of skeleton columns |
| `showHeader` | `boolean` | `true` | Show header row |

## Usage Examples

### Basic Loading States

```jsx
// Simple spinner
<Loading />

// Custom variant with message
<Loading variant="dots" message="Please wait..." />

// Large red spinner
<Loading variant="spinner" size="lg" color="red" />
```

### Form Loading States

```jsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await submitForm();
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting && <ButtonLoader />}
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </form>
);
```

### Page Loading

```jsx
const [isPageLoading, setIsPageLoading] = useState(true);

useEffect(() => {
  loadPageData().finally(() => setIsPageLoading(false));
}, []);

if (isPageLoading) {
  return <PageLoader message="Loading application..." />;
}

return <div>{/* Page content */}</div>;
```

### Content Loading Placeholders

```jsx
const [isDataLoading, setIsDataLoading] = useState(true);
const [data, setData] = useState(null);

if (isDataLoading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CardLoader height="h-64" />
      <CardLoader height="h-64" />
      <CardLoader height="h-64" />
    </div>
  );
}

return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {data.map(item => <Card key={item.id} data={item} />)}
  </div>
);
```

### Multiple Loading States

```jsx
const { setLoading, isLoading } = useLoadingStates();

const handleSave = async () => {
  setLoading('save', true);
  try {
    await saveData();
  } finally {
    setLoading('save', false);
  }
};

const handleDelete = async () => {
  setLoading('delete', true);
  try {
    await deleteData();
  } finally {
    setLoading('delete', false);
  }
};

return (
  <div className="flex space-x-2">
    <button disabled={isLoading('save')} onClick={handleSave}>
      {isLoading('save') && <ButtonLoader />}
      Save
    </button>
    
    <button disabled={isLoading('delete')} onClick={handleDelete}>
      {isLoading('delete') && <ButtonLoader />}
      Delete
    </button>
  </div>
);
```

### Chat Interface Loading

```jsx
const [messages, setMessages] = useState([]);
const [isLoadingMessages, setIsLoadingMessages] = useState(true);

if (isLoadingMessages) {
  return (
    <div className="flex flex-col space-y-4">
      <ChatLoader />
      <ChatLoader />
      <ChatLoader />
    </div>
  );
}

return (
  <div className="flex flex-col space-y-4">
    {messages.map(message => <ChatMessage key={message.id} {...message} />)}
  </div>
);
```

## Theming & Customization

### Custom Colors

You can extend the color options by modifying the component's color mappings:

```jsx
const customColors = {
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600'
};

<Loading variant="spinner" color="purple" />
```

### Custom Themes

Create custom themes by extending the theme mappings:

```jsx
const customThemes = {
  custom: 'bg-gradient-to-r from-purple-400 to-pink-400'
};

<Loading variant="spinner" theme="custom" />
```

### CSS Customization

All components accept a `className` prop for additional styling:

```jsx
<Loading 
  variant="spinner" 
  className="my-custom-styles border-2 border-dashed" 
/>
```

## Best Practices

### 1. Choose Appropriate Variants

- **Spinner**: Best for general loading states
- **Dots**: Good for inline loading or when space is limited  
- **Pulse**: Subtle loading indication
- **Bars**: Good for data processing visualization
- **Ring**: Modern alternative to spinner
- **Text**: Minimal loading indication

### 2. Use Skeleton Loaders for Content

Instead of generic spinners, use skeleton loaders that match your content structure:

```jsx
// Instead of this
{isLoading ? <Loading /> : <UserProfile data={userData} />}

// Do this  
{isLoading ? <SkeletonLoader lines={3} /> : <UserProfile data={userData} />}
```

### 3. Provide Meaningful Messages

Always provide context about what's loading:

```jsx
// Good
<Loading message="Saving your changes..." />
<PageLoader message="Loading user dashboard..." />

// Avoid generic messages
<Loading message="Please wait..." />
```

### 4. Handle Loading States Consistently

Use the `useLoadingStates` hook to manage multiple loading states consistently:

```jsx
const { setLoading, isLoading } = useLoadingStates();

// Consistent pattern across all async operations
const performAction = async (actionType) => {
  setLoading(actionType, true);
  try {
    await apiCall();
  } finally {
    setLoading(actionType, false);
  }
};
```

### 5. Consider Accessibility

- Ensure loading states are announced by screen readers
- Provide alternative text for loading animations
- Use appropriate ARIA attributes

```jsx
<Loading 
  message="Loading user data"
  role="status"
  aria-live="polite"
/>
```

### 6. Optimize Performance

- Use skeleton loaders for better perceived performance
- Avoid showing loading states for very quick operations (< 500ms)
- Consider showing cached/stale data while loading fresh content

### 7. Mobile Considerations

- Use appropriate sizes for mobile devices
- Consider touch-friendly loading indicators
- Test loading states on various screen sizes

```jsx
// Responsive loading sizes
<Loading 
  size="sm md:md lg:lg" 
  className="mx-auto"
/>
```

## Integration Tips

### With React Router

```jsx
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <PageLoader message="Authenticating..." />;
  }

  return children;
};
```

### With Data Fetching Libraries

```jsx
// With React Query
const { data, isLoading, error } = useQuery('userData', fetchUser);

if (isLoading) {
  return <SkeletonLoader lines={5} />;
}

// With SWR  
const { data, error } = useSWR('/api/user', fetcher);

if (!data) {
  return <CardLoader message="Loading profile..." />;
}
```

### With State Management

```jsx
// Redux example
const isLoading = useSelector(state => state.ui.isLoading);
const dispatch = useDispatch();

const handleAction = () => {
  dispatch(setLoading(true));
  // ... perform action
  dispatch(setLoading(false));
};

return (
  <OverlayLoader 
    show={isLoading} 
    message="Processing..."
  />
);
```

This loading system provides a comprehensive solution for all your loading state needs while maintaining consistency and providing excellent user experience across your application.
