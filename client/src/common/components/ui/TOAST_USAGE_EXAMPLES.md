# Toast Usage Examples - Professional Design

This document shows how to use the redesigned, professional toast notifications in the application.

## 🎨 Design Features

The toast notifications now feature:
- ✨ **Beautiful gradient backgrounds** with subtle color tints
- 🎯 **Context-aware icons** (CheckCircle, XCircle, Info, AlertCircle)
- 🌓 **Full dark mode support** with optimized colors
- 💫 **Smooth animations** and transitions
- 🎭 **Backdrop blur** effect for modern aesthetics
- 📐 **Professional spacing** and typography
- 🔘 **Enhanced close button** with hover states

---

## Available Variants

### 1. **Success Toast** (Green) ✅
Use for successful operations, confirmations, and positive feedback.

```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Success!",
  description: "Your operation completed successfully.",
  variant: "success",
});
```

**Examples:**
- Payment processed successfully
- Student enrolled successfully
- Data saved successfully
- File downloaded successfully

---

### 2. **Error/Destructive Toast** (Red) ❌
Use for errors, failures, and critical issues.

```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Error",
  description: "Something went wrong. Please try again.",
  variant: "destructive",
});
```

**Examples:**
- Payment failed
- Enrollment error
- Network error
- Validation errors

---

### 3. **Info Toast** (Blue) ℹ️
Use for informational messages, tips, and neutral notifications.

```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Information",
  description: "This is an informational message.",
  variant: "info",
});
```

**Examples:**
- Print dialog opened
- File opened in new tab
- Process started
- System notifications

---

### 4. **Default Toast** (System Theme)
Use for general messages that don't fall into the above categories.

```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Notification",
  description: "This is a general notification.",
  // variant: "default" is implied if not specified
});
```

---

## Quick Reference

| Variant | Color | Use Case | Example |
|---------|-------|----------|---------|
| `success` | 🟢 Green | Success, Confirmation | "Payment Successful" |
| `destructive` | 🔴 Red | Errors, Failures | "Payment Failed" |
| `info` | 🔵 Blue | Information, Tips | "Print Started" |
| `default` | ⚫ Theme | General messages | "Processing..." |

---

## Implementation Notes

### Visual Design
All toast variants feature:
- ✅ **Gradient backgrounds** - Soft gradients from light to slightly darker tones
- ✅ **Context icons** - Automatically displayed based on variant
- ✅ **Rounded corners** - Modern `rounded-xl` for a polished look
- ✅ **Shadow effects** - Enhanced `shadow-xl` for depth
- ✅ **Backdrop blur** - Subtle blur effect for modern aesthetics
- ✅ **2px borders** - Thicker borders for better definition
- ✅ **Professional spacing** - Optimized padding and gaps
- ✅ **Dark mode** - Fully optimized colors for both light and dark themes

### Color Palette
- **Success**: Green-50 to Green-100 gradient (Green-600 icon)
- **Error**: Red-50 to Red-100 gradient (Red-600 icon)
- **Info**: Blue-50 to Blue-100 gradient (Blue-600 icon)
- **Default**: Slate colors with system theme support

### Typography
- **Title**: Semibold, tight leading, tight tracking
- **Description**: Regular weight, relaxed leading, 80% opacity

### Interactive Elements
- **Close button**: Rounded, hover background, smooth transitions
- **Hover states**: Highlighted backgrounds on close button
- **Focus states**: Ring indicators for accessibility

The toast system uses Radix UI under the hood and supports all standard features like:
- Auto-dismiss
- Manual dismiss
- Swipe gestures
- Action buttons
- Accessibility features
- Keyboard navigation

