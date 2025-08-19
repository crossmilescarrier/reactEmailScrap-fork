# AccountApi Updates - Query Parameters & Debounce Implementation

## Overview
This document outlines the updates made to the AccountApi helpers to support search functionality with query parameters and includes a debounce utility for optimizing search inputs.

## Changes Made

### 1. Updated `getAllAccounts(search)` Method

**Before:**
```javascript
static async getAllAccounts() {
  try {
    const response = await Api.get('/accounts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
```

**After:**
```javascript
static async getAllAccounts(search = null) {
  try {
    const params = {};
    if (search) {
      params.search = search;
    }
    
    const response = await Api.get('/accounts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
```

**Usage:**
```javascript
// Without search
const accounts = await AccountApi.getAllAccounts();

// With search
const filteredAccounts = await AccountApi.getAllAccounts('john@example.com');
```

### 2. Updated `getAccountThreads(email, label, page, limit, q)` Method

**Before:**
```javascript
static async getAccountThreads(accountId, labelType = 'INBOX', page = 1, limit = 20) {
  try {
    const response = await Api.get(`/account/${accountId}/threads`, {
      params: { labelType, page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
```

**After:**
```javascript
static async getAccountThreads(email, label = 'INBOX', page = 1, limit = 20, q = null) {
  try {
    const params = {
      labelType: label,
      page,
      limit
    };
    
    if (q) {
      params.q = q;
    }
    
    const response = await Api.get(`/account/${email}/threads`, {
      params
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
```

**Usage:**
```javascript
// Without search
const threads = await AccountApi.getAccountThreads('user@example.com', 'INBOX', 1, 20);

// With search
const searchResults = await AccountApi.getAccountThreads(
  'user@example.com', 
  'INBOX', 
  1, 
  20, 
  'project update'
);
```

## 3. Debounce Utility

### Location: `src/utils/debounce.js`

This utility provides two methods for implementing debounce functionality:

#### Function-based Debounce
```javascript
import { debounce } from '../utils/debounce';

const debouncedSearch = debounce((query) => {
  // Perform search API call
  fetchResults(query);
}, 300);

// Use in event handlers
const handleInputChange = (e) => {
  debouncedSearch(e.target.value);
};
```

#### React Hook for Debounce
```javascript
import { useDebounce } from '../utils/debounce';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search when debounced value changes
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

## 4. Implementation Examples

### AllAccounts Component with Search
The `AllAccounts.js` component has been updated to demonstrate the search functionality:

```javascript
import { useDebounce } from '../../utils/debounce';

const AllAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const fetchAccounts = async (search = null) => {
    const response = await AccountApi.getAllAccounts(search);
    setAccounts(response.accounts || []);
  };
  
  useEffect(() => {
    if (debouncedSearchTerm !== '') {
      fetchAccounts(debouncedSearchTerm);
    } else {
      fetchAccounts();
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input 
      type="text" 
      placeholder="Search accounts..." 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
```

### AccountThreads Component with Search
The `AccountThreads.jsx` component has been updated to support thread search:

```javascript
import { useDebounce } from '../../utils/debounce';

const AccountThreads = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const fetchThreads = async (labelType, page, query) => {
    const response = await AccountApi.getAccountThreads(
      accountEmail, 
      labelType, 
      page, 
      pagination.limit, 
      query
    );
    setThreads(response.data.threads);
  };
  
  useEffect(() => {
    fetchThreads(activeTab, 1, debouncedSearchQuery || null);
  }, [debouncedSearchQuery]);
  
  return (
    <input
      type="text"
      placeholder="Search threads..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
};
```

## 5. API Contract Changes

### GET /accounts
- **New Query Parameter**: `search` (optional)
- **Example**: `GET /accounts?search=john@example.com`

### GET /account/:email/threads
- **New Query Parameter**: `q` (optional)
- **Example**: `GET /account/user@example.com/threads?labelType=INBOX&page=1&limit=20&q=project%20update`

## 6. Benefits

1. **Performance Optimization**: Debounce prevents excessive API calls during user typing
2. **Better User Experience**: Real-time search without overwhelming the server
3. **Flexible Search**: Both account and thread search capabilities
4. **Backward Compatibility**: All changes are backward compatible with existing code
5. **Reusable Utility**: The debounce utility can be used throughout the application

## 7. Best Practices

1. **Default Debounce Delay**: Use 300ms for most search inputs
2. **Error Handling**: Always handle search errors gracefully
3. **Loading States**: Show loading indicators during search operations
4. **Empty States**: Handle empty search results appropriately
5. **Reset Search**: Provide clear/reset functionality for search inputs

## 8. File Structure

```
src/
├── api/
│   ├── AccountApi.js              # Updated with search parameters
│   └── README_ACCOUNTAPI_UPDATES.md
├── utils/
│   └── debounce.js               # New debounce utility
├── pages/
│   └── account/
│       ├── AllAccounts.js        # Updated with search
│       └── AccountThreads.jsx    # Updated with search
```

## 9. Testing

To test the implementation:

1. **Account Search**: Type in the search box on the AllAccounts page
2. **Thread Search**: Use the search input on AccountThreads page
3. **Debounce Verification**: Check network tab to confirm API calls are debounced
4. **Performance**: Verify no excessive API calls during rapid typing

## 10. Future Enhancements

- Add advanced search filters (date range, sender, etc.)
- Implement search highlighting in results
- Add search history/suggestions
- Implement full-text search capabilities
- Add search analytics and metrics
