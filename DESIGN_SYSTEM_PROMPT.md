# 🎨 DeepLock Design System - Complete Style Guide

> A comprehensive design system for building modern, glassmorphic dark-themed applications with React, Tailwind CSS, and Lucide icons.

---

## 📋 Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Glassmorphism Effects](#glassmorphism-effects)
4. [Component Library](#component-library)
5. [Layout & Spacing](#layout--spacing)
6. [Animations](#animations)
7. [Icons](#icons)
8. [Accessibility](#accessibility)
9. [Usage Examples](#usage-examples)

---

## 🎨 Color Palette

### Dark Theme Colors (Primary)
```javascript
dark: {
  50: '#f8f9fa',   // Lightest
  100: '#f1f3f4',
  200: '#e8eaed',
  300: '#dadce0',
  400: '#bdc1c6',
  500: '#9aa0a6',
  600: '#80868b',
  700: '#5f6368',
  800: '#3c4043',  // Primary background
  900: '#202124',  // Deeper background
  950: '#0d0e0f'   // Darkest
}
```

### Light Theme Colors (Secondary)
```javascript
light: {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121'
}
```

### Accent Colors
```javascript
accent: {
  blue: '#1976d2',    // Primary actions, links
  purple: '#7c3aed',  // Secondary actions, highlights
  green: '#16a34a',   // Success states
  orange: '#ea580c',  // Warnings
  red: '#dc2626'      // Errors, delete actions
}
```

### Color Usage Guidelines
- **Backgrounds**: Use `dark-900` for main bg, `dark-800` for cards, `white/5` for glass effects
- **Borders**: Use `white/10` for subtle borders, `accent-blue/30` for focused elements
- **Text**: Use `white` for primary text, `gray-400` for secondary, `gray-500` for placeholders
- **Overlays**: Use `black/50` with `backdrop-blur-sm` for modals

---

## ✍️ Typography

### Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes & Weights
```javascript
// Headings
text-3xl font-bold      // Page titles (30px)
text-2xl font-semibold  // Section headings (24px)
text-xl font-semibold   // Card titles (20px)
text-lg font-medium     // Subheadings (18px)

// Body
text-base               // Default body text (16px)
text-sm                 // Secondary text (14px)
text-xs                 // Labels, captions (12px)

// Weights
font-normal   // 400
font-medium   // 500
font-semibold // 600
font-bold     // 700
```

### Text Colors
```javascript
text-white          // Primary headings and important text
text-gray-100       // Body text on dark backgrounds
text-gray-400       // Secondary text, descriptions
text-gray-500       // Placeholder text
text-accent-blue    // Links, interactive elements
```

---

## 🌟 Glassmorphism Effects

### Primary Glass Card
```jsx
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl"
style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
```

### Glass Card with Gradient
```jsx
className="bg-gradient-to-br from-dark-900/90 to-dark-800/80 backdrop-blur-xl border border-accent-blue/30 rounded-xl"
style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
```

### Hover Glass Effect
```jsx
className="hover:bg-white/10 transition-all duration-200"
```

### Glass Button
```jsx
className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md"
```

---

## 🧩 Component Library

### 1. Toast Notifications

**Types**: Success, Error, Warning, Info

**Component Code**:
```jsx
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const bgColors = {
    success: 'bg-green-500/20 border-green-500/50',
    error: 'bg-red-500/20 border-red-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
    info: 'bg-blue-500/20 border-blue-500/50'
  };

  return (
    <div className={`${bgColors[toast.type]} backdrop-blur-md border rounded-xl px-4 py-3 shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-up`}>
      {icons[toast.type]}
      <p className="text-white text-sm flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
```

**Usage**:
```jsx
const toast = useToast();
toast.success('Operation completed!');
toast.error('Something went wrong');
toast.warning('Please check your input');
toast.info('New updates available');
```

---

### 2. Confirm Dialog

**Component Code**:
```jsx
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-scale-up">
        <div className="flex items-start space-x-4 mb-4">
          <div className="p-3 bg-yellow-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400">{message}</p>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-accent-red hover:bg-red-600 text-white rounded-xl transition-all">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 3. Buttons

**Primary Button**:
```jsx
<button className="bg-accent-blue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
  Primary Action
</button>
```

**Secondary Button**:
```jsx
<button className="bg-gray-200 hover:bg-gray-300 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
  Secondary Action
</button>
```

**Danger Button**:
```jsx
<button className="bg-accent-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
  Delete
</button>
```

**Ghost Button**:
```jsx
<button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg transition-all">
  Cancel
</button>
```

**Icon Button**:
```jsx
<button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
  <Plus className="w-5 h-5 text-accent-blue" />
</button>
```

---

### 4. Form Inputs

**Text Input**:
```jsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
  placeholder="Enter text..."
/>
```

**Textarea**:
```jsx
<textarea
  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200 min-h-[100px]"
  placeholder="Enter description..."
/>
```

**Select Dropdown**:
```jsx
<select className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Checkbox**:
```jsx
<label className="flex items-center space-x-2 cursor-pointer">
  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue" />
  <span className="text-gray-300">Remember me</span>
</label>
```

---

### 5. Cards

**Basic Glass Card**:
```jsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
  <h3 className="text-xl font-semibold text-white mb-2">Card Title</h3>
  <p className="text-gray-400">Card content goes here...</p>
</div>
```

**Hover Card**:
```jsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-accent-blue/20 hover:-translate-y-1 transition-all duration-200">
  <h3 className="text-xl font-semibold text-white mb-2">Interactive Card</h3>
  <p className="text-gray-400">Hover over me!</p>
</div>
```

**Card with Icon**:
```jsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
  <div className="flex items-start space-x-4">
    <div className="p-3 bg-accent-blue/20 rounded-full">
      <Briefcase className="w-6 h-6 text-accent-blue" />
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-semibold text-white mb-2">Experience</h3>
      <p className="text-gray-400">Your work history</p>
    </div>
  </div>
</div>
```

---

### 6. Password Protection Overlay

**Component Code**:
```jsx
const ProtectedPage = ({ children, onUnlock }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === 'Encrypt') {
      setUnlocked(true);
      setError('');
      if (onUnlock) onUnlock();
    } else {
      setError('Incorrect password');
    }
  };

  if (unlocked) return children;

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-dark-900/90 to-dark-800/80 border border-accent-blue/30 shadow-xl rounded-xl px-8 py-10 flex flex-col items-center w-full max-w-sm backdrop-blur-xl"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
      >
        <h2 className="text-xl font-semibold mb-6 text-white tracking-tight text-center">Enter Password</h2>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full px-5 py-3 rounded-lg border border-accent-blue/30 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue text-base tracking-widest mb-3 transition-all duration-200 shadow-inner backdrop-blur"
          placeholder="Password"
          autoFocus
        />
        {error && <div className="text-red-400 text-sm mb-2 font-medium animate-pulse">{error}</div>}
        <button
          type="submit"
          className="w-full mt-2 py-3 rounded-lg bg-accent-blue hover:bg-accent-purple text-white font-semibold text-base shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          Unlock
        </button>
      </form>
    </div>
  );
};
```

---

### 7. Search Bar

**Component**:
```jsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  <input
    type="text"
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
  />
</div>
```

---

### 8. File Upload Area

**Component**:
```jsx
<div className="border-2 border-dashed border-accent-blue/30 rounded-xl p-8 text-center bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
  <Upload className="w-12 h-12 mx-auto mb-4 text-accent-blue" />
  <p className="text-white font-medium mb-2">Drop files here or click to browse</p>
  <p className="text-gray-400 text-sm">Supports PDF, DOC, DOCX, JPG, PNG</p>
  <input type="file" className="hidden" />
</div>
```

---

## 📐 Layout & Spacing

### Container Widths
```javascript
max-w-xs    // 320px - Small modals
max-w-sm    // 384px - Forms
max-w-md    // 448px - Dialogs
max-w-lg    // 512px - Medium content
max-w-xl    // 576px - Large content
max-w-2xl   // 672px - Wide content
max-w-7xl   // 1280px - Page containers
```

### Spacing Scale
```javascript
space-x-2   // 8px  - Tight spacing
space-x-3   // 12px - Default spacing
space-x-4   // 16px - Comfortable spacing
space-x-6   // 24px - Section spacing
space-x-8   // 32px - Large spacing
```

### Padding/Margin
```javascript
p-2   // 8px
p-3   // 12px
p-4   // 16px
p-6   // 24px
p-8   // 32px
p-10  // 40px
```

### Border Radius
```javascript
rounded-lg   // 8px  - Buttons, inputs
rounded-xl   // 12px - Cards
rounded-2xl  // 16px - Modals
rounded-full // Circle - Icons, avatars
```

---

## 🎬 Animations

### Keyframes
```css
/* Slide Up Animation */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale Up Animation */
@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Fade In Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Tailwind Animation Classes
```javascript
animate-slide-up   // For toasts, notifications
animate-scale-up   // For modals, dialogs
animate-fade-in    // For page transitions
animate-spin       // For loading spinners
animate-pulse      // For attention-grabbing elements
```

### Transition Classes
```javascript
transition-all duration-200      // Smooth all properties
transition-colors duration-200   // Color changes only
transition-transform duration-200 // Transform only
hover:-translate-y-1             // Lift on hover
hover:scale-105                  // Grow on hover
```

---

## 🎨 Icons

**Library**: Lucide React

**Installation**:
```bash
npm install lucide-react
```

**Common Icons Used**:
```jsx
import {
  // Navigation
  Home, User, Briefcase, GraduationCap, FolderGit, FileText, Shield, Activity,
  
  // Actions
  Plus, Edit3, Trash2, Save, X, Search, Upload, Download, ExternalLink,
  
  // Status
  CheckCircle, XCircle, AlertCircle, Info, Lock, Unlock,
  
  // Misc
  Calendar, Github, Mail, Phone, MapPin, Eye, EyeOff
} from 'lucide-react';
```

**Icon Sizes**:
```jsx
className="w-4 h-4"  // Small (16px)
className="w-5 h-5"  // Default (20px)
className="w-6 h-6"  // Large (24px)
className="w-8 h-8"  // Extra large (32px)
```

**Icon Colors**:
```jsx
text-accent-blue     // Primary actions
text-accent-green    // Success
text-accent-red      // Danger
text-gray-400        // Neutral
text-white           // Emphasis
```

---

## ♿ Accessibility

### Focus States
```jsx
focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent
```

### ARIA Attributes
```jsx
aria-label="Close dialog"
aria-hidden="true"
role="dialog"
role="alert"
```

### Keyboard Navigation
- All interactive elements accessible via Tab
- Enter/Space to activate buttons
- Escape to close modals/dialogs

---

## 📝 Usage Examples

### Complete Form Example
```jsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
  <h2 className="text-2xl font-semibold text-white mb-6">Add Experience</h2>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
        placeholder="Google"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
        placeholder="Software Engineer"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
      <textarea
        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200 min-h-[100px]"
        placeholder="Describe your role..."
      />
    </div>
    
    <div className="flex space-x-3 mt-6">
      <button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg transition-all">
        Cancel
      </button>
      <button className="flex-1 bg-accent-blue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
        Save
      </button>
    </div>
  </div>
</div>
```

### Dashboard Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-accent-blue/20 hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-accent-blue/20 rounded-full">
          <Briefcase className="w-6 h-6 text-accent-blue" />
        </div>
        <div className="flex space-x-2">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <Edit3 className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-all">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
      <p className="text-gray-400 text-sm">{item.description}</p>
    </div>
  ))}
</div>
```

---

## 🎯 Quick Reference

### Tailwind Config
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: { /* ... */ },
        accent: { /* ... */ }
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px'
      }
    }
  }
}
```

### Global Styles (index.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply transition-colors duration-300;
  }
  
  ::-webkit-scrollbar {
    @apply w-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-dark-800;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-dark-600 rounded-full;
  }
}
```

---

## 🚀 Implementation Tips

1. **Always use glassmorphism** for cards and overlays
2. **Consistent spacing** - stick to the spacing scale
3. **Smooth transitions** - add `transition-all duration-200` to interactive elements
4. **Dark mode first** - design for dark theme, then adapt for light
5. **Icon consistency** - use Lucide React throughout
6. **Toast for feedback** - always show user feedback for actions
7. **Confirm destructive actions** - use ConfirmDialog for delete operations
8. **Focus states** - ensure all interactive elements have clear focus indicators
9. **Loading states** - show spinners during async operations
10. **Responsive design** - use Tailwind's responsive classes (`md:`, `lg:`, etc.)

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🎨 Design Philosophy

**DeepLock's design is built on three core principles:**

1. **Glassmorphism**: Create depth with frosted glass effects and subtle borders
2. **Dark Elegance**: Deep backgrounds with vibrant accent colors for hierarchy
3. **Smooth Interactions**: Everything should feel fluid with proper transitions

**Visual Hierarchy:**
- Use color to guide attention (blue for primary, red for danger)
- Size indicates importance (larger text = more important)
- Spacing creates relationships (grouped elements are related)

**Consistency:**
- Same padding across all cards (p-6)
- Same border radius for similar elements
- Same transition duration (200ms) everywhere

---

## 💡 Pro Tips

- **Glass effect sweetspot**: `bg-white/5` with `backdrop-blur-xl` and `border-white/10`
- **Best shadow**: `shadow-lg` with `hover:shadow-xl hover:shadow-accent-blue/20`
- **Perfect hover lift**: `hover:-translate-y-1 transition-all duration-200`
- **Readable text on glass**: Always use `text-white` or `text-gray-100`, never gray-500+
- **Icon + text spacing**: Use `space-x-3` for perfect alignment
- **Modal backdrop**: `bg-black/50 backdrop-blur-sm` for best focus

---

**🎉 You now have everything needed to replicate the DeepLock design system in any project!**

Simply share this prompt with your AI assistant or team and say: *"Apply the DeepLock design system to [your project]"*
