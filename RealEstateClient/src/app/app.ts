import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './component/header-component/header-component';
import { CartSidebarComponent } from './component/cart-sidebar/cart-sidebar.component';
import { FavoritesSidebarComponent } from './component/favorites-sidebar/favorites-sidebar.component';
import { FooterComponent } from './component/footer-component/footer-component';
import { ChatbotComponent } from './component/chatbot-component/chatbot-component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, HeaderComponent, CartSidebarComponent, FavoritesSidebarComponent, FooterComponent, ChatbotComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  title = 'RealEstateClient';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }
}