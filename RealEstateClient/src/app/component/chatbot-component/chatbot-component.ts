import { Component, ViewEncapsulation, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
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
  quickActions = [
    { label: 'נכסים למכירה', icon: 'pi-home', action: 'sale' },
    { label: 'נכסים להשכרה', icon: 'pi-key', action: 'rent' },
    { label: 'נופש', icon: 'pi-sun', action: 'vacation' },
    { label: 'יצירת קשר', icon: 'pi-phone', action: 'contact' }
  ];

  constructor(private router: Router) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }
  
  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.addBotMessage('שלום! 👋 אני עוזר הנדל"ן הדיגיטלי. איך אוכל לעזור לך היום?');
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    
    this.addUserMessage(this.userInput);
    const input = this.userInput.toLowerCase();
    this.userInput = '';
    this.shouldScroll = true;
    
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      this.handleUserInput(input);
      this.shouldScroll = true;
    }, 1000);
  }

  handleUserInput(input: string) {
    if (input.includes('עמלה') || input.includes('תשלום')) {
      this.addBotMessage('העמלה שלנו:\n• נופש: 3% מהמחיר\n• השכרה: חודש אחד מתוך תקופת השכירות\n• מכירה: ללא עמלה');
    } else if (input.includes('הוסף') || input.includes('פרסם') || input.includes('נכס')) {
      this.addBotMessage('כדי להוסיף נכס חדש, לחץ על "הוסף נכס" בתפריט העליון או היכנס לפרופיל שלך.');
    } else if (input.includes('מועדפים')) {
      this.addBotMessage('המועדפים שלך נמצאים בתפריט העליון (אייקון הלב ❤️). שם תוכל לראות את כל הנכסים ששמרת.');
    } else if (input.includes('קשר') || input.includes('עזרה')) {
      this.addBotMessage('אפשר ליצור קשר דרך:\n• כפתור "יצירת קשר" בכל נכס\n• דף "צור קשר" בתפריט\n• טלפון: 1-800-REALESTATE');
    } else if (input.includes('מכירה')) {
      this.router.navigate(['/products'], { queryParams: { type: 'Sale' } });
      this.addBotMessage('מעביר אותך לנכסים למכירה... 🏠');
    } else if (input.includes('השכרה')) {
      this.router.navigate(['/products'], { queryParams: { type: 'Rent' } });
      this.addBotMessage('מעביר אותך לנכסים להשכרה... 🔑');
    } else if (input.includes('נופש')) {
      this.router.navigate(['/products'], { queryParams: { type: 'Vacation' } });
      this.addBotMessage('מעביר אותך לנכסי נופש... ☀️');
    } else {
      this.addBotMessage('אני כאן לעזור! נסה לשאול על:\n• עמלות ותשלומים\n• הוספת נכס\n• מועדפים\n• יצירת קשר\n• חיפוש נכסים');
    }
  }

  handleQuickAction(action: string) {
    switch(action) {
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

  addUserMessage(text: string) {
    this.messages.push({ text, isBot: false, timestamp: new Date() });
    this.shouldScroll = true;
  }

  addBotMessage(text: string) {
    this.messages.push({ text, isBot: true, timestamp: new Date() });
    this.shouldScroll = true;
  }
}
