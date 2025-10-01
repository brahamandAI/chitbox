import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinFolder(folderId: number) {
    if (this.socket) {
      this.socket.emit('join_folder', folderId);
    }
  }

  leaveFolder(folderId: number) {
    if (this.socket) {
      this.socket.emit('leave_folder', folderId);
    }
  }

  startTyping(threadId: number, folderId: number) {
    if (this.socket) {
      this.socket.emit('typing_start', { threadId, folderId });
    }
  }

  stopTyping(threadId: number, folderId: number) {
    if (this.socket) {
      this.socket.emit('typing_stop', { threadId, folderId });
    }
  }

  onNewEmail(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_email', callback);
    }
  }

  onEmailUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('email_updated', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  offNewEmail(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('new_email', callback);
    }
  }

  offEmailUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('email_updated', callback);
    }
  }

  offUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user_typing', callback);
    }
  }
}

export const socketService = new SocketService();
