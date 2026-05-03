import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: Date;
  category: string;
  readTime: number;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, DialogModule],
  templateUrl: './blog-component.html',
  styleUrl: './blog-component.scss'
})
export class BlogComponent implements OnInit {
  selectedPost: BlogPost | null = null;
  displayDialog = false;
  
  blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'מדריך לרכישת דירה ראשונה',
      excerpt: 'כל מה שצריך לדעת לפני רכישת הדירה הראשונה - מימון, משכנתא, ובדיקות חשובות',
      content: 'תוכן מלא של המאמר...',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
      author: 'צוות האתר',
      date: new Date('2024-01-15'),
      category: 'מכירה',
      readTime: 5
    },
    {
      id: 2,
      title: 'טיפים לבחירת צימר מושלם',
      excerpt: 'איך לבחור צימר שמתאים בדיוק לצרכים שלכם - מיקום, מתקנים ועוד',
      content: 'תוכן מלא של המאמר...',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      author: 'צוות האתר',
      date: new Date('2024-01-10'),
      category: 'נופש',
      readTime: 4
    },
    {
      id: 3,
      title: 'השכרת דירה - זכויות וחובות',
      excerpt: 'מדריך מקיף לשוכרים ומשכירים - חוזה שכירות, זכויות ותקנות',
      content: 'תוכן מלא של המאמר...',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
      author: 'צוות האתר',
      date: new Date('2024-01-05'),
      category: 'השכרה',
      readTime: 6
    },
    {
      id: 4,
      title: 'השקעה בנדל"ן - האם זה משתלם?',
      excerpt: 'ניתוח מעמיק של השקעה בנדל"ן בישראל - יתרונות, חסרונות ותחזיות',
      content: 'תוכן מלא של המאמר...',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      author: 'צוות האתר',
      date: new Date('2024-01-01'),
      category: 'השקעות',
      readTime: 8
    },
    {
      id: 5,
      title: 'שיפוץ דירה - מה חשוב לדעת',
      excerpt: 'תכנון שיפוץ נכון, בחירת קבלנים ותקציב - המדריך המלא',
      content: 'תוכן מלא של המאמר...',
      image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800',
      author: 'צוות האתר',
      date: new Date('2023-12-28'),
      category: 'שיפוץ',
      readTime: 7
    },
    {
      id: 6,
      title: 'מגמות בשוק הנדל"ן 2024',
      excerpt: 'סקירה של המגמות החמות בשוק הנדל"ן הישראלי לשנת 2024',
      content: 'תוכן מלא של המאמר...',
      image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800',
      author: 'צוות האתר',
      date: new Date('2023-12-20'),
      category: 'מגמות',
      readTime: 5
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  getCategoryColor(category: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const colors: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'מכירה': 'info',
      'נופש': 'warn',
      'השכרה': 'success',
      'השקעות': 'danger',
      'שיפוץ': 'secondary',
      'מגמות': 'contrast'
    };
    return colors[category] || 'info';
  }

  readPost(postId: number): void {
    this.selectedPost = this.blogPosts.find(p => p.id === postId) || null;
    this.displayDialog = true;
  }
}
