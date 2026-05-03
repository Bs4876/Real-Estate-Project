# Real Estate Platform - Detailed Technical Guide

## Folder Structure

### Backend Structure
```
RealEstateServer/
├── WebApiShop/                    # Main entry point
│   ├── Controllers/               # 8 controllers
│   ├── Middleware/                # Error handling, Admin auth, Rating
│   ├── wwwroot/images/            # Property images
│   ├── Program.cs                 # DI and Middleware configuration
│   └── appsettings.json           # DB and email settings
├── Services/                      # Business Logic Layer
├── Repository/                    # Data Access Layer
├── Entities/                      # Domain Models
├── DTOs/                          # Data Transfer Objects (30+ DTOs)
└── TestProject/                   # Unit & Integration Tests
```

### Frontend Structure
```
RealEstateClient/
├── src/app/
│   ├── component/                 # 20+ feature components
│   ├── services/                  # API client services
│   ├── models/                    # TypeScript interfaces
│   ├── guards/                    # Route guards
│   ├── config/                    # Configuration files
│   └── utils/                     # Utility functions
├── angular.json
├── package.json
└── DESIGN_SYSTEM.md
```

## What Each Layer Does

### Backend Layers

**Controllers** - Receives requests, calls Services, returns DTOs
**Services** - Business logic, uses AutoMapper, returns DTOs
**Repository** - Database access, LINQ queries, returns Entities
**Entities** - Database models (EF Core)
**DTOs** - Data transfer between layers

### Frontend Layers

**Components** - UI logic, Subscribe to Observables
**Services** - HTTP calls, returns Observables
**Models** - TypeScript interfaces

## Naming Conventions

### Backend (C#)
- Classes: `PascalCase`
- Interfaces: `IPascalCase`
- Methods: `PascalCase` + `Async` suffix
- Parameters: `camelCase`
- Private fields: `_camelCase`

### Frontend (TypeScript)
- Components: `kebab-case.component.ts`
- Classes: `PascalCase`
- Methods/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## How to Write a New Component

```bash
cd src/app/component
mkdir my-component
```

Create 3 files: `.ts`, `.html`, `.scss`

```typescript
@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.html',
  styleUrls: ['./my-component.scss']
})
export class MyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(private myService: MyService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

Add to `app.routes.ts`

## How to Add a New Endpoint

1. Create DTO in `DTOs/`
2. Add mapping in `AutoMapping.cs`
3. Add method in Repository
4. Add method in Service
5. Add endpoint in Controller
6. Register in DI in `Program.cs`

## How to Work with the Database

### Backend (EF Core)

```csharp
// Read
var product = await _context.Products
    .Include(p => p.ProductImages)
    .FirstOrDefaultAsync(p => p.ProductId == id);

// Create
_context.Products.Add(product);
await _context.SaveChangesAsync();

// Update
product.Price = 600000;
await _context.SaveChangesAsync();

// Delete
_context.Products.Remove(product);
await _context.SaveChangesAsync();
```

### Frontend (HTTP)

```typescript
// GET
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products`);
}

// POST
createProduct(product: Product): Observable<Product> {
  return this.http.post<Product>(`${this.apiUrl}/products`, product);
}

// PUT
updateProduct(id: number, product: Product): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/products/${id}`, product);
}

// DELETE
deleteProduct(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
}
```

## Common Code Patterns

### Repository Pattern
```csharp
public interface IProductRepository {
    Task<Product> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product> AddAsync(Product product);
}
```

### Observable Pattern
```typescript
products$: Observable<Product[]>;

ngOnInit(): void {
  this.products$ = this.productService.getProducts();
}
```

### Subscription Management
```typescript
private subscriptions: Subscription[] = [];

ngOnInit(): void {
  const sub = this.service.getData().subscribe(data => {});
  this.subscriptions.push(sub);
}

ngOnDestroy(): void {
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

## Important Tips

1. Always async/await on Backend
2. Always Unsubscribe on Frontend
3. Don't return Entities - only DTOs
4. Use AutoMapper
5. All errors through Middleware
6. Follow DESIGN_SYSTEM.md
7. Write tests for every feature
8. Use PrimeNG components

---

**Last Updated**: 2025 | **Version**: 1.0
