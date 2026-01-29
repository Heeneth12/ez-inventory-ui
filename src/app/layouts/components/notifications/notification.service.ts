import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import SockJS from 'sockjs-client';
import { HttpService } from '../../service/http-svc/http.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private stompClient: Client | null = null;
  private readonly socketUrl = environment.devUrl + '/ws';
  private readonly apiUrl = environment.devUrl + '/api/notifications';

  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationSubject.asObservable();

  constructor(private http: HttpService) { }

  connect(userId: string, orgId?: string, groupId?: string) {
    const socket = new SockJS(`${this.socketUrl}?userId=${userId}`);

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { userId: userId } // Handshake Handler ID
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket');

      // 1. Subscribe to Global
      this.stompClient?.subscribe('/topic/public', (msg) => this.handleMessage(msg));

      // 2. Subscribe to Private (User)
      this.stompClient?.subscribe('/user/queue/notifications', (msg) => this.handleMessage(msg));

      // 3. Subscribe to Org
      if (orgId) {
        this.stompClient?.subscribe(`/topic/org.${orgId}`, (msg) => this.handleMessage(msg));
      }

      // 4. Subscribe to Group
      if (groupId) {
        this.stompClient?.subscribe(`/topic/group.${groupId}`, (msg) => this.handleMessage(msg));
      }
    };

    this.stompClient.activate();
  }

  private handleMessage(message: Message) {
    if (message.body) {
      const newNote: Notification = JSON.parse(message.body);
      const current = this.notificationSubject.getValue();
      // Add new notification to the TOP
      this.notificationSubject.next([newNote, ...current]);
    }
  }

  makeAsRead(id: number, successfn: any, errorfn: any) {
    return this.http.postHttp(`${this.apiUrl}/${id}/read`, {}, successfn, errorfn);
  }
}