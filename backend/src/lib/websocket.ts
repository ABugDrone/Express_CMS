import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { env } from '../config/env.js';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
  rooms: Set<string>;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocketClient> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer): void {
    if (!env.WS_ENABLED) {
      console.log('ℹ WebSocket is disabled');
      return;
    }

    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
    });

    this.wss.on('connection', (ws: WebSocketClient, req) => {
      ws.isAlive = true;
      ws.rooms = new Set();
      this.clients.add(ws);

      console.log(`✓ WebSocket client connected (Total: ${this.clients.size})`);

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      // Handle pong responses
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`✓ WebSocket client disconnected (Total: ${this.clients.size})`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to JM News WebSocket',
        timestamp: new Date().toISOString(),
      }));
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    console.log(`✓ WebSocket server initialized on ${env.APP_URL}/ws`);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: WebSocketClient, message: any): void {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;

      case 'join':
        // Join a room (e.g., article comments, breaking news)
        if (message.room) {
          ws.rooms.add(message.room);
          ws.send(JSON.stringify({ 
            type: 'joined', 
            room: message.room,
            message: `Joined room: ${message.room}`,
          }));
        }
        break;

      case 'leave':
        // Leave a room
        if (message.room) {
          ws.rooms.delete(message.room);
          ws.send(JSON.stringify({ 
            type: 'left', 
            room: message.room,
            message: `Left room: ${message.room}`,
          }));
        }
        break;

      case 'auth':
        // Authenticate user (optional)
        if (message.userId) {
          ws.userId = message.userId;
          ws.send(JSON.stringify({ 
            type: 'authenticated', 
            userId: message.userId,
          }));
        }
        break;

      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: `Unknown message type: ${message.type}`,
        }));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(data: any): void {
    if (!this.wss) return;

    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Broadcast message to specific room
   */
  broadcastToRoom(room: string, data: any): void {
    if (!this.wss) return;

    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.rooms.has(room)) {
        client.send(message);
      }
    });
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, data: any): void {
    if (!this.wss) return;

    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(message);
      }
    });
  }

  /**
   * Notify about new comment
   */
  notifyNewComment(articleId: number, comment: any): void {
    this.broadcastToRoom(`article:${articleId}`, {
      type: 'new_comment',
      articleId,
      comment,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about breaking news
   */
  notifyBreakingNews(article: any): void {
    this.broadcast({
      type: 'breaking_news',
      article,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about article view count update
   */
  notifyViewUpdate(articleId: number, views: number): void {
    this.broadcastToRoom(`article:${articleId}`, {
      type: 'view_update',
      articleId,
      views,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close(() => {
        console.log('✓ WebSocket server closed');
      });
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients).filter(c => c.readyState === WebSocket.OPEN).length,
    };
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();
