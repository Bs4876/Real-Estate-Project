import { Component, ViewEncapsulation, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatMessage {
  role: string;
  content: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './chatbot-component.html',
  styleUrl: './chatbot-component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  messages: Message[] = [];
  userInput = '';
  isTyping = false;
  private shouldScroll = false;
  private history: ChatMessage[] = [];

  quickActions = [
    { label: 'נכסים למכירה', icon: 'pi-home', action: 'sale' },
    { label: 'נכסים להשכרה', icon: 'pi-key', action: 'rent' },
    { label: 'נופש', icon: 'pi-sun', action: 'vacation' },
    { label: 'יצירת קשר', icon: 'pi-phone', action: 'contact' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.addBotMessage('שלום! 👋 אני עוזר הנדל"ן החכם שלך. אני יכול לעזור לך למצוא נכסים, לענות על שאלות ועוד. איך אוכל לעזור?');
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const userText = this.userInput.trim();
    this.userInput = '';
    this.addUserMessage(userText);
    this.isTyping = true;
    this.shouldScroll = true;

    this.http.post<{ reply?: string; error?: string }>('https://localhost:44305/api/chat', {
      message: userText,
      history: this.history
    }).subscribe({
      next: (res) => {
        this.isTyping = false;
        const reply = res.reply || res.error || 'מצטער, לא הצלחתי לעבד את הבקשה.';
        this.addBotMessage(reply);
        this.history.push({ role: 'user', content: userText });
        this.history.push({ role: 'assistant', content: reply });
        this.shouldScroll = true;
      },
      error: () => {
        this.isTyping = false;
        this.addBotMessage('מצטער, יש בעיה בחיבור לשרת ה-AI. נסה שוב מאוחר יותר.');
        this.shouldScroll = true;
      }
    });
  }

  handleQuickAction(action: string) {
    switch (action) {
      case 'sale':
        this.router.navigate(['/products'], { queryParams: { type: 'Sale' } });
        this.addBotMessage('מעביר אותך לנכסים למכירה... 🏠');
        break;
      case 'rent':
        this.router.navigate(['/products'], { queryParams: { type: 'Rent' } });
        this.addBotMessage('מעביר אותך לנכסים להשכרה... 🔑');
        break;
      case 'vacation':
        this.router.navigate(['/products'], { queryParams: { type: 'Vacation' } });
        this.addBotMessage('מעביר אותך לנכסי נופש... ☀️');
        break;
      case 'contact':
        this.router.navigate(['/contact']);
        this.addBotMessage('מעביר אותך לדף יצירת קשר... 📞');
        break;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  addUserMessage(text: string) {
    this.messages.push({ text, isBot: false, timestamp: new Date() });
    this.shouldScroll = true;
  }

  addBotMessage(text: string) {
    this.messages.push({ text, isBot: true, timestamp: new Date() });
    this.shouldScroll = true;
  }
}
