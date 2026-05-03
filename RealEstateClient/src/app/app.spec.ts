import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app'; // שינוי מ-App ל-AppComponent
import { provideRouter } from '@angular/router'; // נחוץ כדי שהבדיקה תכיר את ה-RouterOutlet

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])] // מוסיפים הגדרת ראוטר בסיסית לבדיקה
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'RealEstateClient' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('RealEstateClient');
  });
});
