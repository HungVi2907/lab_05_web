/**
 * ============================================
 * A1 — useReducer FSM Fetch Machine
 * ============================================
 * 
 * WHAT: Refactor component fetch data từ 3 useState → useReducer + Finite State Machine
 *       (idle → loading → success → failure)
 * 
 * WHY:
 * - Tránh impossible states (ví dụ: loading=true và error=true cùng lúc)
 * - Logic reducer dễ test và deterministic
 * - Chuẩn enterprise UI state handling
 * 
 * HOW:
 * 1. Tạo initialState = { status: 'idle', data: null, error: null }
 * 2. Tạo reducer với các action types: FETCH_INIT, FETCH_SUCCESS, FETCH_FAILURE
 * 3. Ngăn transition sai (ex: success khi không loading)
 * 4. Dùng useEffect dispatch các actions
 * 5. Render UI theo state.status
 */

import React, { useReducer, useEffect } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

// Finite State Machine states
type FetchStatus = 'idle' | 'loading' | 'resolved' | 'rejected';

interface FetchState {
  status: FetchStatus;
  data: User[] | null;
  error: string | null;
}

// Action types
type FetchAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'RESET' };

// ============================================
// INITIAL STATE
// ============================================

const initialState: FetchState = {
  status: 'idle',
  data: null,
  error: null,
};

// ============================================
// REDUCER - Finite State Machine Logic
// ============================================

/**
 * FSM Reducer với state transitions được kiểm soát chặt chẽ:
 * 
 * idle → loading (FETCH_INIT)
 * loading → resolved (FETCH_SUCCESS)
 * loading → rejected (FETCH_FAILURE)
 * resolved/rejected → loading (FETCH_INIT - refetch)
 * any → idle (RESET)
 */
function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_INIT':
      // Chỉ cho phép transition từ idle, resolved, hoặc rejected
      if (state.status === 'loading') {
        console.warn('Invalid state transition: already loading');
        return state;
      }
      return {
        status: 'loading',
        data: null,
        error: null,
      };

    case 'FETCH_SUCCESS':
      // Chỉ cho phép transition từ loading
      if (state.status !== 'loading') {
        console.warn('Invalid state transition: not in loading state');
        return state;
      }
      return {
        status: 'resolved',
        data: action.payload,
        error: null,
      };

    case 'FETCH_FAILURE':
      // Chỉ cho phép transition từ loading
      if (state.status !== 'loading') {
        console.warn('Invalid state transition: not in loading state');
        return state;
      }
      return {
        status: 'rejected',
        data: null,
        error: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================
// CUSTOM HOOK - useFetchUsers
// ============================================

function useFetchUsers(url: string) {
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      // Dispatch FETCH_INIT to transition to loading state
      dispatch({ type: 'FETCH_INIT' });

      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Only update if component is still mounted
        if (!isCancelled) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        }
      } catch (error) {
        // Only update if component is still mounted
        if (!isCancelled) {
          dispatch({
            type: 'FETCH_FAILURE',
            payload: error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [url]);

  const refetch = () => {
    dispatch({ type: 'RESET' });
  };

  return { ...state, refetch };
}

// ============================================
// COMPONENT - UserList with FSM
// ============================================

const UserList: React.FC = () => {
  const { status, data, error, refetch } = useFetchUsers(
    'https://jsonplaceholder.typicode.com/users'
  );

  // Render based on FSM status
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="status-idle">
            <p>Ready to fetch data...</p>
          </div>
        );

      case 'loading':
        return (
          <div className="status-loading">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '10px' }}>Loading users...</p>
          </div>
        );

      case 'resolved':
        return (
          <div className="status-success">
            <h3>✓ Data loaded successfully!</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
              {data?.map((user) => (
                <li key={user.id} className="list-item">
                  <div>
                    <strong>{user.name}</strong>
                    <br />
                    <small>{user.email}</small>
                  </div>
                  <span style={{ color: '#666' }}>{user.company.name}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'rejected':
        return (
          <div className="status-error">
            <h3>✗ Error occurred!</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={refetch}>
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">A1: useReducer FSM Fetch Machine</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Current State Machine Status:</h4>
        <code style={{ 
          background: '#f0f0f0', 
          padding: '5px 10px', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status.toUpperCase()}
        </code>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>State Transitions:</h4>
        <p style={{ fontSize: '14px', color: '#666' }}>
          idle → loading → resolved/rejected
        </p>
      </div>

      {renderContent()}
    </div>
  );
};

export default UserList;
