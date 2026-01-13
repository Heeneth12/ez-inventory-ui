import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McpChatBotComponent } from './mcp-chat-bot.component';

describe('McpChatBotComponent', () => {
  let component: McpChatBotComponent;
  let fixture: ComponentFixture<McpChatBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McpChatBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McpChatBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
