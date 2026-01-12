import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpService } from '../../layouts/service/http-svc/http.service';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  // Point everything to the Java Backend
  private static AI_BASE_URL = environment.devUrl + '/v1/mcp/chat';

  constructor(private http: HttpClient, private httpService: HttpService) { }

  /**
   * Sends message to Java Backend (which then calls MCP)
   */
  sendMessage(message: string, conversationId: number | null): Observable<any> {
    const payload = {
      message: message,
      conversationId: conversationId
    };
    // Calls POST /v1/mcp/chat/send
    return this.http.post<any>(`${AiChatService.AI_BASE_URL}/send`, payload);
  }

  /**
   * Get All Conversations for a Tenant
   */
  getHistory(successfn: any, errorfn: any) {
    return this.httpService.getHttp(`${AiChatService.AI_BASE_URL}/history`, successfn, errorfn);
  }

  /**
   * Get Messages for a specific Conversation
   */
  getMessages(conversationId: number, successfn: any, errorfn: any) {
    return this.httpService.getHttp(`${AiChatService.AI_BASE_URL}/${conversationId}/messages`, successfn, errorfn);
  }
}