/**
 * ============================================
 * C1 — Compound Tabs Component
 * ============================================
 * 
 * WHAT: Tạo <Tabs>, <Tabs.List>, <Tabs.Tab>, <Tabs.Panel> hoạt động qua Context
 * 
 * WHY:
 * - Flexible API giống HTML select/option
 * - Tránh prop drilling
 * - Cho phép custom layout mà không phá logic
 * - Scalable pattern cho complex UI
 * 
 * HOW:
 * 1. Tạo TabsContext
 * 2. Tabs giữ state activeIndex và cung cấp context
 * 3. Tab: setActiveIndex khi click
 * 4. Panel: hiển thị nếu index trùng activeIndex
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ============================================
// CONTEXT DEFINITION
// ============================================

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

// Custom hook to use tabs context
const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return context;
};

// ============================================
// TABS ROOT COMPONENT
// ============================================

interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> & {
  List: typeof TabsList;
  Tab: typeof Tab;
  Panel: typeof TabPanel;
  Panels: typeof TabPanels;
} = ({ children, defaultIndex = 0, onChange, className }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleSetActiveIndex = (index: number) => {
    setActiveIndex(index);
    onChange?.(index);
  };

  return (
    <TabsContext.Provider
      value={{ activeIndex, setActiveIndex: handleSetActiveIndex }}
    >
      <div className={`tabs-container ${className || ''}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// ============================================
// TABS LIST COMPONENT
// ============================================

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`tabs-list ${className || ''}`} role="tablist">
      {children}
    </div>
  );
};

// ============================================
// TAB COMPONENT
// ============================================

interface TabProps {
  children: ReactNode;
  index: number;
  disabled?: boolean;
  className?: string;
}

const Tab: React.FC<TabProps> = ({ children, index, disabled = false, className }) => {
  const { activeIndex, setActiveIndex } = useTabsContext();
  const isActive = activeIndex === index;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      className={`tab-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className || ''}`}
      onClick={() => !disabled && setActiveIndex(index)}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
};

// ============================================
// TAB PANELS CONTAINER
// ============================================

interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

const TabPanels: React.FC<TabPanelsProps> = ({ children, className }) => {
  return (
    <div className={`tab-panels ${className || ''}`}>
      {children}
    </div>
  );
};

// ============================================
// TAB PANEL COMPONENT
// ============================================

interface TabPanelProps {
  children: ReactNode;
  index: number;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, index, className }) => {
  const { activeIndex } = useTabsContext();
  
  if (activeIndex !== index) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`tab-panel ${className || ''}`}
      style={{ padding: '20px' }}
    >
      {children}
    </div>
  );
};

// Attach sub-components
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
Tabs.Panels = TabPanels;

// ============================================
// DEMO COMPONENT
// ============================================

const CompoundTabsDemo: React.FC = () => {
  return (
    <div className="card">
      <h2 className="section-title">C1: Compound Tabs Component</h2>

      {/* Basic Usage */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Basic Usage</h3>
        <Tabs defaultIndex={0} onChange={(index) => console.log('Tab changed to:', index)}>
          <Tabs.List>
            <Tabs.Tab index={0}>Profile</Tabs.Tab>
            <Tabs.Tab index={1}>Settings</Tabs.Tab>
            <Tabs.Tab index={2}>Notifications</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panels>
            <Tabs.Panel index={0}>
              <h4>👤 Profile Tab</h4>
              <p>Manage your profile information here.</p>
              <div style={{ marginTop: '15px' }}>
                <label>Name: </label>
                <input type="text" className="input-field" defaultValue="John Doe" />
              </div>
            </Tabs.Panel>
            <Tabs.Panel index={1}>
              <h4>⚙️ Settings Tab</h4>
              <p>Configure your application settings.</p>
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" defaultChecked />
                  Enable dark mode
                </label>
              </div>
            </Tabs.Panel>
            <Tabs.Panel index={2}>
              <h4>🔔 Notifications Tab</h4>
              <p>Manage your notification preferences.</p>
              <ul style={{ marginTop: '15px' }}>
                <li>Email notifications: Enabled</li>
                <li>Push notifications: Disabled</li>
              </ul>
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>

      {/* With Disabled Tab */}
      <div style={{ marginBottom: '30px' }}>
        <h3>With Disabled Tab</h3>
        <Tabs defaultIndex={0}>
          <Tabs.List>
            <Tabs.Tab index={0}>Available</Tabs.Tab>
            <Tabs.Tab index={1} disabled>Premium (Locked)</Tabs.Tab>
            <Tabs.Tab index={2}>Free</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panels>
            <Tabs.Panel index={0}>
              <p>This content is available to everyone.</p>
            </Tabs.Panel>
            <Tabs.Panel index={1}>
              <p>Premium content - you shouldn't see this!</p>
            </Tabs.Panel>
            <Tabs.Panel index={2}>
              <p>Free content for all users.</p>
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>

      {/* Technical Info */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Compound Component Pattern:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Parent <code>&lt;Tabs&gt;</code> manages state</li>
          <li><code>&lt;Tabs.List&gt;</code> contains tab buttons</li>
          <li><code>&lt;Tabs.Tab&gt;</code> renders clickable tab</li>
          <li><code>&lt;Tabs.Panel&gt;</code> renders content conditionally</li>
          <li>Context API for internal state sharing</li>
        </ul>
        <pre style={{ 
          marginTop: '15px',
          background: '#f8f8f8', 
          padding: '10px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '13px' 
        }}>
{`<Tabs defaultIndex={0}>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel index={0}>Content 1</Tabs.Panel>
    <Tabs.Panel index={1}>Content 2</Tabs.Panel>
  </Tabs.Panels>
</Tabs>`}
        </pre>
      </div>
    </div>
  );
};

export { Tabs, TabsList, Tab, TabPanel, TabPanels };
export default CompoundTabsDemo;
