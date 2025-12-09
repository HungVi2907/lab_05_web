# Lab 05 - Module 5: Advanced React Patterns & Optimization

**MSSV:** 23251776  
**Họ tên:** Tran Hung Vi  
**Môn:** Web Application Development

---

## 📋 Tổng Quan

Project này bao gồm **20 bài tập** (10 bài thực hành + 10 bài Capstone) về các kỹ thuật nâng cao trong React:

- **State Management** với useReducer và Redux Toolkit
- **Performance Optimization** với useMemo, useCallback, Code Splitting
- **Design Patterns**: Compound Components, Portal, Error Boundary
- **Testing**: Integration Testing với React Testing Library

---

## 🚀 Cài Đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Chạy tests
npm test

# Build production
npm run build
```

---

## 📁 Cấu Trúc Project

```
src/
├── exercises/                    # 10 bài tập thực hành
│   ├── A1-useReducer-FSM/       # State Machine với useReducer
│   ├── A2-Redux-cartSlice/      # Redux Toolkit slice
│   ├── B1-useMemo-optimization/ # useMemo & React.memo
│   ├── B2-useCallback/          # useCallback optimization
│   ├── B3-CodeSplitting/        # React.lazy & Suspense
│   ├── C1-CompoundTabs/         # Compound Component Pattern
│   ├── C2-PortalModal/          # Portal-based Modal
│   ├── C3-ErrorBoundary/        # Error Boundary Pattern
│   ├── D1-IntegrationTesting/   # Integration Tests
│   └── D2-TestingErrorBoundary/ # Error Boundary Tests
│
├── capstone/                     # 10 bài Capstone Project
│   ├── store/                   # E1: Redux Store Setup
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts     # E2: Authentication
│   │       ├── inventorySlice.ts# E3, E4: Entity Adapter & Async
│   │       └── uiSlice.ts       # UI State Management
│   ├── components/
│   │   ├── PrivateRoute.tsx     # E2: Protected Routing
│   │   ├── DataTable.tsx        # E7: Compound Table
│   │   └── DeleteConfirmModal.tsx# E8: Portal Modal
│   ├── pages/
│   │   ├── LoginPage.tsx        # Login Page
│   │   ├── DashboardPage.tsx    # Dashboard
│   │   ├── InventoryPage.tsx    # E5: Optimized Page
│   │   ├── AnalyticsPage.tsx    # E6, E9: Lazy + Error Boundary
│   │   └── ExercisesPage.tsx    # Exercises Demo
│   └── tests/
│       └── integration.test.ts  # E10: Integration Tests
│
├── App.tsx                      # Main App với Routing
├── index.tsx                    # Entry Point
└── index.css                    # Global Styles
```

---

## 📚 Chi Tiết Bài Tập

### Group A: State Management

#### A1: useReducer Finite State Machine
- File: `src/exercises/A1-useReducer-FSM/UserList.tsx`
- Pattern: FSM với states: `idle` → `loading` → `success`/`failure`
- Demo: Fetch users với proper state transitions

#### A2: Redux Toolkit cartSlice
- File: `src/exercises/A2-Redux-cartSlice/`
- Features: `addItem`, `removeItem`, `clearCart` actions
- Bonus: Memoized `selectTotalWithTax` selector

### Group B: Performance Optimization

#### B1: useMemo Optimization
- File: `src/exercises/B1-useMemo-optimization/LaggyList.tsx`
- Demo: 10,000 items với expensive sorting
- Techniques: `useMemo`, `React.memo`

#### B2: useCallback
- File: `src/exercises/B2-useCallback/TodoList.tsx`
- Demo: Todo list với stable callbacks
- Prevents unnecessary re-renders

#### B3: Code Splitting
- File: `src/exercises/B3-CodeSplitting/CodeSplitting.tsx`
- Route-based splitting với `React.lazy`
- `Suspense` fallback loading

### Group C: Design Patterns

#### C1: Compound Tabs
- File: `src/exercises/C1-CompoundTabs/Tabs.tsx`
- Pattern: Context-based compound components
- API: `<Tabs><TabsList><Tab/></TabsList><TabPanels><TabPanel/></TabPanels></Tabs>`

#### C2: Portal Modal
- File: `src/exercises/C2-PortalModal/Modal.tsx`
- `createPortal` để render ngoài DOM tree
- Proper focus management

#### C3: Error Boundary
- File: `src/exercises/C3-ErrorBoundary/ErrorBoundary.tsx`
- Class-based error catching
- Graceful error UI

### Group D: Testing

#### D1: Integration Testing
- Files: `src/exercises/D1-IntegrationTesting/`
- Full login form với async submission
- Comprehensive RTL tests

#### D2: Testing Error Boundaries
- File: `src/exercises/D2-TestingErrorBoundary/`
- Test error catching
- Verify fallback rendering

---

## 🏆 Capstone Project

### E1: Redux Store Setup
- Configured store với 4 slices: auth, inventory, ui, cart
- Typed hooks: `useAppDispatch`, `useAppSelector`

### E2: Authentication & Protected Routing
- `authSlice` với login/logout async thunks
- `PrivateRoute` component với role-based access

### E3: Entity Adapter
- `inventorySlice` với `createEntityAdapter`
- Normalized state cho 5000+ products

### E4: Async Thunks
- `fetchInventory`, `addProduct`, `updateProduct`, `deleteProduct`
- Loading states & error handling

### E5: Optimization Pass
- `InventoryPage` với full optimization:
  - `useMemo` cho filtering/sorting
  - `useCallback` cho handlers
  - `React.memo` cho ProductRow

### E6: Lazy Loading
- `AnalyticsPage` lazy loaded
- Suspense fallback

### E7: Compound DataTable
- Flexible table với Column registration
- Context-based pattern

### E8: Portal Delete Modal
- `DeleteConfirmModal` với Portal
- Reusable confirmation dialog

### E9: Error Boundary
- Error boundary wrapper cho Analytics
- Graceful error handling

### E10: Testing
- Comprehensive integration tests
- Auth flow tests
- Inventory management tests

---

## 🔑 Demo Credentials

```
Admin: admin@example.com / admin123
User:  user@example.com / user123
```

---

## 📖 Tài Liệu Tham Khảo

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Testing Library](https://testing-library.com/react)
- [React Router](https://reactrouter.com/)

---

## ✅ Checklist Bài Nộp

- [x] A1: useReducer FSM
- [x] A2: Redux cartSlice
- [x] B1: useMemo optimization
- [x] B2: useCallback
- [x] B3: Code Splitting
- [x] C1: Compound Tabs
- [x] C2: Portal Modal
- [x] C3: Error Boundary
- [x] D1: Integration Testing
- [x] D2: Testing Error Boundaries
- [x] E1-E10: Capstone Project

**Tổng: 20/20 bài tập hoàn thành**
