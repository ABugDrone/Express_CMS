import { useEffect, useRef, useCallback, useState } from 'react';

interface BreakingNewsEvent {
  type: 'breaking_news';
  article: { id: number; title: string; slug: string; excerpt: string };
  timestamp: string;
}

interface NewCommentEvent {
  type: 'new_comment';
  articleId: number;
  comment: { id: number; author: string; content: string; createdAt: string };
  timestamp: string;
}

interface ViewUpdateEvent {
  type: 'view_update';
  articleId: number;
  views: number;
  timestamp: string;
}

type WsMessage = BreakingNewsEvent | NewCommentEvent | ViewUpdateEvent;

interface WsOptions {
  onBreakingNews?: (article: BreakingNewsEvent['article']) => void;
  onNewComment?: (data: NewCommentEvent) => void;
  onViewUpdate?: (data: ViewUpdateEvent) => void;
  onConnected?: () => void;
  rooms?: string[];
}

export function useWebSocket(options: WsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const [connected, setConnected] = useState(false);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        options.onConnected?.();
        // Join rooms
        options.rooms?.forEach(room => {
          ws.send(JSON.stringify({ type: 'join', room }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          switch (msg.type) {
            case 'breaking_news':
              options.onBreakingNews?.(msg.article);
              break;
            case 'new_comment':
              options.onNewComment?.(msg);
              break;
            case 'view_update':
              options.onViewUpdate?.(msg);
              break;
          }
        } catch { /* skip malformed */ }
      };

      ws.onclose = () => {
        setConnected(false);
        if (mountedRef.current) {
          reconnectTimer.current = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => { ws.close(); };
      wsRef.current = ws;
    } catch {
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, [options.onBreakingNews, options.onNewComment, options.onViewUpdate, options.onConnected, options.rooms]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, send };
}
