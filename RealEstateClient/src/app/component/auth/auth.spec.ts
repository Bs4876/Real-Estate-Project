import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth'; // שימי לב לשינוי כאן

describe('AuthComponent', () => { // וגם כאן
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent] // וגם כאן
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});