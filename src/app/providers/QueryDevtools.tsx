import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Query } from '@tanstack/react-query';
import { queryClient } from '../queryClient';

const panelStyles: CSSProperties = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  width: 320,
  maxHeight: '60vh',
  overflowY: 'auto',
  background: 'rgba(30, 30, 30, 0.95)',
  color: '#fff',
  borderRadius: 8,
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
  fontFamily: 'monospace',
  fontSize: 12,
  zIndex: 9999,
  paddingBottom: 12,
};

const headerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const buttonStyles: CSSProperties = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  zIndex: 9999,
  background: '#0d6efd',
  color: '#fff',
  border: 'none',
  borderRadius: 9999,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 12,
};

const statusColors: Record<Query['state']['status'], string> = {
  pending: '#f0ad4e',
  success: '#5cb85c',
  error: '#d9534f',
};

const formatQuery = (query: Query) => ({
  hash: query.queryHash,
  status: query.state.status,
  observers: query.getObserversCount(),
  dataUpdatedAt: query.state.dataUpdatedAt,
  queryKey: query.queryKey,
});

export function QueryDevtools() {
  const [isOpen, setIsOpen] = useState(false);
  const [queries, setQueries] = useState(() => queryClient.getQueryCache().getAll());

  useEffect(() => {
    return queryClient.getQueryCache().subscribe(() => {
      setQueries(queryClient.getQueryCache().getAll());
    });
  }, []);

  const formatted = useMemo(() => queries.map(formatQuery), [queries]);

  if (!isOpen) {
    return (
      <button style={buttonStyles} type="button" onClick={() => setIsOpen(true)}>
        Open Query Devtools
      </button>
    );
  }

  return (
    <div style={panelStyles}>
      <div style={headerStyles}>
        <strong>React Query</strong>
        <button type="button" onClick={() => setIsOpen(false)}>
          ×
        </button>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: '8px 12px' }}>
        {formatted.length === 0 ? (
          <li style={{ opacity: 0.7 }}>No queries</li>
        ) : (
          formatted.map((query) => (
            <li key={query.hash} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{JSON.stringify(query.queryKey)}</span>
                <span style={{ color: statusColors[query.status] }}>{query.status}</span>
              </div>
              <div style={{ opacity: 0.7 }}>observers: {query.observers}</div>
              <div style={{ opacity: 0.7 }}>updated: {query.dataUpdatedAt || 'never'}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
