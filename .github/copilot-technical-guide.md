# Real Estate Platform - הנחיות טכניות מפורטות

## מבנה תיקיות

### Backend Structure
```
RealEstateServer/
├── WebApiShop/                    # נקודת כניסה ראשית
│   ├── Controllers/               # 8 קונטרולרים
│   │   ├── UsersController.cs
│   │   ├── ProductsController.cs
│   │   ├── OrdersController.cs
│   │   ├── CategoriesController.cs
│   │   ├── ProductImagesController.cs
│   │   ├── RatingsController.cs
│   │   ├── PropertyInquiriesController.cs
│   │   └── AdminController.cs
│   ├── Middleware/
│   │   ├── ErrorHandlingMiddleware.cs
│   │   ├── AdminAuthorizationMiddleware.cs
│   │   └── RatingMiddleware.cs
│   ├── wwwroot/images/            # תמונות נכסים
│   ├── Program.cs                 # הגדרות DI ו-Middleware
│   ├── appsettings.json           # הגדרות DB ומייל
│   └── nlog.config                # הגדרות לוגים
├── Services/                      # Business Logic Layer
│   ├── AutoMapping.cs             # פרופילי AutoMapper
│   ├── IUsersServices.cs + UsersServices.cs
│   ├── IProductService.cs + ProductService.cs
│   ├── IOrderService.cs + OrderService.cs
│   ├── ICategoriesServies.cs + CategoriesServies.cs
│   ├── IProductImageService.cs + ProductImageService.cs
│   ├── IRatingService.cs + RatingService.cs
│   ├── IPropertyInquiryService.cs + PropertyInquiryService.cs
│   ├── IAdminService.cs + AdminService.cs
│   ├── IEmailService.cs + EmailService.cs
│   └── IPasswordService.cs + PasswordService.cs
├── Repository/                    # Data Access Layer
│   ├── ShopContext.cs             # EF Core DbContext
│   ├── IUsersRepository.cs + UsersRepository.cs
│   ├── IProductRepository.cs + ProductRepository.cs
│   ├── IOrderRepository.cs + OrderRepository.cs
│   ├── ICategoryRepository.cs + CategoryRepository.cs
│   ├── IProductImageRepository.cs + ProductImageRepository.cs
│   ├── IRatingRepository.cs + RatingRepository.cs
│   ├── IPropertyInquiryRepository.cs + PropertyInquiryRepository.cs
│   └── IAdminInquiryRepository.cs + AdminInquiryRepository.cs
├── Entities/                      # Domain Models
│   ├── User.cs
│   ├── Product.cs
│   ├── Order.cs
│   ├── OrderItem.cs
│   ├── Category.cs
│   ├── ProductImage.cs
│   ├── Rating.cs
│   ├── PropertyInquiry.cs
│   └── AdminInquiry.cs
├── DTOs/                          # Data Transfer Objects (30+ DTOs)
│   ├── UserLoginDTO.cs
│   ├── UserRegisterDTO.cs
│   ├── ProductDTO.cs
│   ├── ProductCreateDTO.cs
│   ├── OrderDTO.cs
│   ├── OrderCreateDTO.cs
│   └── ... (עוד 24 DTOs)
└── TestProject/                   # Unit & Integration Tests
```

### Frontend Structure
```
RealEstateClient/
├── src/app/
│   ├── component/                 # כל הקומפוננטות
│   │   ├── home-component/
│   │   ├── product-list-component/
│   │   ├── product-details-component/
│   │   ├── product-card-component/
│   │   ├── product-filter-component/
│   │   ├── add-product-component/
│   │   ├── edit-product-component/
│   │   ├── cart-component/
│   │   ├── cart-sidebar/
│   │   ├── checkout-component/
│   │   ├── order-success-component/
│   │   ├── favorites-component/
│   │   ├── favorites-sidebar/
│   │   ├── user-profile-component/
│   │   ├── admin-dashboard-component/
│   │   ├── auth/
│   │   ├── header-component/
│   │   ├── footer-component/
│   │   ├── contact-component/
│   │   ├── about-component/
│   │   └── chatbot-component/
│   ├── services/                  # API Services
│   │   ├── user-service.ts
│   │   ├── product-service.ts
│   │   ├── order-service.ts
│   │   ├── category-service.ts
│   │   ├── cart-service.ts
│   │   ├── favorites-service.ts
│   │   ├── contact-service.ts
│   │   ├── admin-service.ts
│   │   ├── admin-inquiry-service.ts
│   │   └── property-inquiry-service.ts
│   ├── models/                    # TypeScript Interfaces
│   │   ├── user/user-model.ts
│   │   ├── product/product-model.ts
│   │   ├── order/order-model.ts
│   │   ├── order-item/order-item-model.ts
│   │   ├── category/category-model.ts
│   │   ├── cart/cart-item.model.ts
│   │   ├── product-image/product-image-model.ts
│   │   ├── contact/contact-model.ts
│   │   ├── admin/admin-model.ts
│   │   ├── admin-inquiry/admin-inquiry-model.ts
│   │   └── property-inquiry/property-inquiry-model.ts
│   ├── guards/
│   │   └── admin.guard.ts         # הגנה על נתיבי מנהל
│   ├── config/
│   │   └── commission.config.ts   # הגדרות עמלות
│   ├── utils/
│   │   └── validation.utils.ts    # פונקציות ולידציה
│   ├── app.routes.ts              # הגדרות ניתוב
│   ├── app.config.ts              # הגדרות גלובליות
│   └── app.ts                     # Root Component
├── angular.json                   # הגדרות Angular CLI
├── package.json                   # תלויות npm
├── tsconfig.json                  # הגדרות TypeScript
└── DESIGN_SYSTEM.md               # מדריך עיצוב
```

## מה כל שכבה עושה

### Backend Layers

**Controllers Layer**
- מקבל HTTP requests
- מבצע ולידציה בסיסית
- קורא ל-Services
- מחזיר DTOs (לא Entities!)
- דוגמה:
```csharp
[HttpGet("{id}")]
public async Task<ActionResult<ProductDTO>> GetProduct(int id)
{
    var product = await _productService.GetProductByIdAsync(id);
    return Ok(product);
}
```

**Services Layer**
- לוגיקה עסקית
- קורא ל-Repositories
- משתמש ב-AutoMapper למיפוי
- מחזיר DTOs
- דוגמה:
```csharp
public async Task<ProductDTO> GetProductByIdAsync(int id)
{
    var product = await _repository.GetByIdAsync(id);
    return _mapper.Map<ProductDTO>(product);
}
```

**Repository Layer**
- גישה למסד נתונים בלבד
- CRUD operations
- LINQ queries
- מחזיר Entities
- דוגמה:
```csharp
public async Task<Product> GetByIdAsync(int id)
{
    return await _context.Products
        .Include(p => p.ProductImages)
        .FirstOrDefaultAsync(p => p.ProductId == id);
}
```

**Entities Layer**
- מודלים של מסד נתונים
- נוצרים אוטומטית על ידי EF Core
- אל תערוך ידנית (אלא אם צריך)

**DTOs Layer**
- העברת נתונים בין שכבות
- הגנה על Entities
- שליטה במה שנחשף ל-client

### Frontend Layers

**Components**
- UI logic
- Subscribe ל-Observables
- Unsubscribe ב-ngOnDestroy
- דוגמה:
```typescript
ngOnInit(): void {
  this.productService.getProducts().subscribe({
    next: (data) => this.products = data,
    error: (err) => console.error(err)
  });
}
```

**Services**
- HTTP calls ל-API
- מחזיר Observables
- אל תעשה subscribe כאן!
- דוגמה:
```typescript
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products`);
}
```

**Models**
- TypeScript interfaces
- תואמים ל-DTOs של Backend
- דוגמה:
```typescript
export interface Product {
  productId: number;
  title: string;
  price: number;
  transactionType: string;
}
```

## Naming Conventions

### Backend (C#)
- **Classes**: PascalCase - `ProductService`, `UserRepository`
- **Interfaces**: I + PascalCase - `IProductService`, `IUserRepository`
- **Methods**: PascalCase - `GetProductByIdAsync`, `CreateOrderAsync`
- **Parameters**: camelCase - `userId`, `productId`
- **Private fields**: _camelCase - `_context`, `_mapper`
- **Async methods**: סיומת Async - `GetProductAsync`

### Frontend (TypeScript)
- **Components**: kebab-case - `product-list-component.ts`
- **Classes**: PascalCase - `ProductService`, `CartItem`
- **Interfaces**: PascalCase - `Product`, `Order`
- **Methods**: camelCase - `getProducts()`, `addToCart()`
- **Variables**: camelCase - `productList`, `userId`
- **Constants**: UPPER_SNAKE_CASE - `API_URL`, `MAX_ITEMS`

### Files
- **Backend**: PascalCase.cs - `ProductService.cs`
- **Frontend Components**: kebab-case.component.ts - `product-list.component.ts`
- **Frontend Services**: kebab-case.service.ts - `product.service.ts`
- **Frontend Models**: kebab-case.model.ts - `product.model.ts`

## איך כותבים קומפוננטה חדשה (Angular)

1. **צור תיקייה חדשה**:
```bash
cd src/app/component
mkdir my-component
```

2. **צור 3 קבצים**:
- `my-component.ts`
- `my-component.html`
- `my-component.scss`

3. **מבנה הקומפוננטה**:
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.html',
  styleUrls: ['./my-component.scss']
})
export class MyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private myService: MyService
  ) {}

  ngOnInit(): void {
    // טען נתונים
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

4. **הוסף ל-routes** ב-`app.routes.ts`:
```typescript
{
  path: 'my-route',
  component: MyComponent
}
```

## איך מוסיפים Endpoint חדש (Backend)

1. **צור DTO** ב-`DTOs/`:
```csharp
public class MyDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
}
```

2. **הוסף מיפוי** ב-`Services/AutoMapping.cs`:
```csharp
CreateMap<MyEntity, MyDTO>();
CreateMap<MyDTO, MyEntity>();
```

3. **הוסף מתודה ב-Repository**:
```csharp
public async Task<MyEntity> GetMyDataAsync(int id)
{
    return await _context.MyEntities.FindAsync(id);
}
```

4. **הוסף מתודה ב-Service**:
```csharp
public async Task<MyDTO> GetMyDataAsync(int id)
{
    var entity = await _repository.GetMyDataAsync(id);
    return _mapper.Map<MyDTO>(entity);
}
```

5. **הוסף endpoint ב-Controller**:
```csharp
[HttpGet("my-endpoint/{id}")]
public async Task<ActionResult<MyDTO>> GetMyData(int id)
{
    var result = await _service.GetMyDataAsync(id);
    return Ok(result);
}
```

6. **רשום ב-DI** ב-`Program.cs` (אם צריך):
```csharp
builder.Services.AddScoped<IMyService, MyService>();
builder.Services.AddScoped<IMyRepository, MyRepository>();
```

## איך עובדים עם ה-DB בפרויקט

### Backend (EF Core)

**קריאת נתונים**:
```csharp
// פשוט
var product = await _context.Products.FindAsync(id);

// עם Include (Eager Loading)
var product = await _context.Products
    .Include(p => p.ProductImages)
    .Include(p => p.Category)
    .FirstOrDefaultAsync(p => p.ProductId == id);

// עם Where
var products = await _context.Products
    .Where(p => p.Price > 1000)
    .ToListAsync();
```

**הוספת נתונים**:
```csharp
var product = new Product { Title = "דירה חדשה", Price = 500000 };
_context.Products.Add(product);
await _context.SaveChangesAsync();
```

**עדכון נתונים**:
```csharp
var product = await _context.Products.FindAsync(id);
product.Price = 600000;
await _context.SaveChangesAsync();
```

**מחיקת נתונים**:
```csharp
var product = await _context.Products.FindAsync(id);
_context.Products.Remove(product);
await _context.SaveChangesAsync();
```

### Frontend (HTTP Calls)

**GET**:
```typescript
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products`);
}
```

**POST**:
```typescript
createProduct(product: Product): Observable<Product> {
  return this.http.post<Product>(`${this.apiUrl}/products`, product);
}
```

**PUT**:
```typescript
updateProduct(id: number, product: Product): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/products/${id}`, product);
}
```

**DELETE**:
```typescript
deleteProduct(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
}
```

## דפוסי קוד נפוצים

### Backend Patterns

**Repository Pattern**:
```csharp
public interface IProductRepository
{
    Task<Product> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product> AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(int id);
}
```

**Service Pattern**:
```csharp
public interface IProductService
{
    Task<ProductDTO> GetProductByIdAsync(int id);
    Task<IEnumerable<ProductDTO>> GetAllProductsAsync();
    Task<ProductDTO> CreateProductAsync(ProductCreateDTO dto);
    Task UpdateProductAsync(int id, ProductUpdateDTO dto);
    Task DeleteProductAsync(int id);
}
```

### Frontend Patterns

**Observable Pattern**:
```typescript
products$: Observable<Product[]>;

ngOnInit(): void {
  this.products$ = this.productService.getProducts();
}
```

**Subscription Management**:
```typescript
private subscriptions: Subscription[] = [];

ngOnInit(): void {
  const sub = this.productService.getProducts().subscribe(
    data => this.products = data
  );
  this.subscriptions.push(sub);
}

ngOnDestroy(): void {
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

## טיפים חשובים

1. **תמיד השתמש ב-async/await בצד Backend**
2. **תמיד Unsubscribe בצד Frontend**
3. **אל תחזיר Entities מ-Controllers - רק DTOs**
4. **השתמש ב-AutoMapper - אל תמפה ידנית**
5. **כל שגיאה צריכה לעבור דרך Middleware**
6. **עקוב אחרי DESIGN_SYSTEM.md לעיצוב**
7. **כתוב tests לכל feature חדש**
8. **השתמש ב-PrimeNG components - אל תבנה מאפס**

---

**עודכן לאחרונה**: 2025 | **גרסה**: 1.0
