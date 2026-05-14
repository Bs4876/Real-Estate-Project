# Repository Instructions

## What This Project Is
ASP.NET Core 8 Web API for a real estate platform. Users can browse/list properties, place rental orders, submit inquiries, and admins can manage everything. The frontend is a separate Angular app at `http://localhost:4200`.

---

## Solution Layout
```
RealEstateServer/
├── Entities/        → EF Core domain models (auto-generated, #nullable disable)
├── DTOs/            → C# records for API input/output — never expose Entities directly
├── Repository/      → ShopContext (DbContext) + one repository class per entity
├── Services/        → Business logic + AutoMapper profile (AutoMapping.cs)
├── WebApiShop/      → Controllers, Middleware, Program.cs, nlog.config
└── TestProject/     → xUnit unit + integration tests
```

**Key files to know before touching anything:**
- `Repository/ShopContext.cs` — all DbSets and EF model config
- `Services/AutoMapping.cs` — every AutoMapper mapping lives here
- `WebApiShop/Program.cs` — all DI registrations and middleware order
- `WebApiShop/appsettings.json` — connection strings and email config
- `WebApiShop/nlog.config` — logging configuration with email alerts

---

## Tech Stack
- **Framework:** ASP.NET Core 8.0
- **ORM:** Entity Framework Core 8.0.24 (SQL Server in prod, InMemory in tests)
- **Mapping:** AutoMapper 12 — mappings in `Services/AutoMapping.cs`
- **Logging:** NLog via `WebApiShop/nlog.config` (file + email on Error)
- **Email:** MailKit with Gmail SMTP (configured in appsettings.json)
- **Password strength:** zxcvbn-core — `IPasswordService.checkStrengthPassword()` returns `CheckPassword { password, strength }` where `strength` is 0–4; minimum required is `>= 2`
- **Tests:** xUnit + Moq + `Microsoft.EntityFrameworkCore.InMemory`
- **Rate Limiting:** 5 requests per 15 seconds per IP address

---

## How to Add a New Feature (exact order)
1. **Entity** → `Entities/MyEntity.cs` — add `DbSet<MyEntity>` to `ShopContext`, configure in `OnModelCreating`
2. **DTOs** → `DTOs/MyEntityDTO.cs`, `MyEntityCreateDTO.cs` etc. — use C# `record` types
3. **Mappings** → add `CreateMap<>` pairs in `Services/AutoMapping.cs`
4. **Repository interface** → `Repository/IMyEntityRepository.cs`
5. **Repository class** → `Repository/MyEntityRepository.cs` — inject `ShopContext`
6. **Service interface** → `Services/IMyEntityService.cs`
7. **Service class** → `Services/MyEntityService.cs` — inject `IMyEntityRepository` + `IMapper`
8. **Register** → add both as `.AddScoped<>` in `WebApiShop/Program.cs`
9. **Controller** → `WebApiShop/Controllers/MyEntityController.cs` with `[Route("api/[controller]")]`

---

## Existing Entities & Their Repositories
| Entity | Repository Interface | Repository Class | Service Interface | Service Class |
|---|---|---|---|---|
| `User` | `IUsersRepository` | `UsersRepository` | `IUsersServices` | `UsersServices` |
| `Product` | `IProductRepository` | `ProductRepository` | `IProductService` | `ProductService` |
| `Category` | `ICategoryRepository` | `CategoryRepository` | `ICategoriesServies` | `CategoriesServies` |
| `Order` | `IOrderRepository` | `OrderRepository` | `IOrderService` | `OrderService` |
| `OrderItem` | — | — | — | — |
| `ProductImage` | `IProductImageRepository` | `ProductImageRepository` | `IProductImageService` | `ProductImageService` |
| `Rating` | `IRatingRepository` | `RatingRepository` | `IRatingService` | `RatingService` |
| `PropertyInquiry` | `IPropertyInquiryRepository` | `PropertyInquiryRepository` | `IPropertyInquiryService` | `PropertyInquiryService` |
| `AdminInquiry` | `IAdminInquiryRepository` | `AdminInquiryRepository` | `IAdminService` | `AdminService` |
| `CheckPassword` | — | `PasswordRepository` | `IPasswordService` | `PasswordService` |

---

## Complete DTOs Reference (30+ DTOs)

### User DTOs
- **`UserProfileDTO`** (record) — User profile without email: `(int UserId, string FullName, string Phone, string Address, bool IsAdmin)`
- **`UserRegisterDTO`** (record) — Registration: `(string FullName, string Email, string Password, string Phone, string Address)`
- **`UserLoginDTO`** (record) — Login: `(string Email, string Password)`
- **`UserUpdateDTO`** (record) — Profile updates
- **`UserOwner`** (class) — Owner information

### Product DTOs
- **`ProductSummaryDTO`** (record) — List view: `(int ProductId, string Title, decimal Price, string ImageUrl, string City, int? Beds, int? Rooms, int? CategoryId, int? OwnerId, string CategoryCategoryName, string TransactionType, bool IsAvailable)`
- **`ProductDetailsDTO`** (record) — Full product details
- **`ProductCreateDTO`** (record) — Create new product
- **`ProductUpdateDTO`** (record) — Update product
- **`ProductViewDTO`** (record) — Display view
- **`ProductDTO`** (record) — Basic product info

### Product Image DTOs
- **`ProductImageDTO`** (record) — Image details
- **`ProductImageCreateDTO`** (record) — Upload image
- **`ProductImageUpdateDTO`** (record) — Update image
- **`ProductImageUrlDTO`** (record) — Image URL only

### Order DTOs
- **`OrderDTO`** (record) — Order details
- **`OrderCreateDTO`** (record) — Create order
- **`OrderHistoryDTO`** (record) — User order history
- **`OrderHistoryAdminDTO`** (record) — Admin order history with user names
- **`OrderAdminDTO`** (record) — Admin order view
- **`OrderStatusUpdateDTO`** (record) — Update order status
- **`OrderItemDTO`** (record) — Order line items
- **`OrderItemCreateDTO`** (record) — Create order item
- **`OrderItemViewDTO`** (record) — Display order item
- **`OccupiedDatesResponseDTO`** (record) — Rental availability dates

### Category DTOs
- **`CategoryDTO`** (record) — Category info
- **`CategoryCreateDTO`** (record) — Create category
- **`CategoryUpdateDTO`** (record) — Update category

### Inquiry DTOs
- **`PropertyInquiryDTO`** (record) — Property inquiry details
- **`PropertyInquiryCreateDTO`** (record) — Submit inquiry
- **`PropertyInquiryStatusUpdateDTO`** (record) — Update inquiry status
- **`AdminInquiryDTO`** (record) — Admin inquiry details
- **`AdminInquiryCreateDTO`** (record) — Create admin inquiry
- **`AdminInquiryStatusUpdateDTO`** (record) — Update admin inquiry status

### Admin DTOs
- **`AdminStatisticsDTO`** (record) — Dashboard stats: `(int TotalUsers, int TotalProducts, int TotalOrders)`

### Utility DTOs
- **`PageResponseDTO<T>`** (class) — Pagination wrapper with properties: `Data`, `TotalItems`, `CurrentPage`, `PageSize`, `HasPreviousPage`, `HasNextPage`

---

## Critical Entity Rules
| Entity | Required fields | Notes |
|---|---|---|
| `Product` | `Title`, `TransactionType` | `TransactionType` must be `"Rent"` or `"Sale"` / `"מכירה"`. Sale items cannot be booked. |
| `User` | `FullName`, `Email`, `Password` | `Email` is unique in DB |
| `Order` | `UserId`, `TotalAmount` | `TotalAmount` is `decimal`, `OrderDate` is `DateTime?` |
| `OrderItem` | `OrderId`, `ProductId`, `PriceAtPurchase` | `StartDate`/`EndDate` are `DateTime?` |
| `PropertyInquiry` | `Name`, `Phone`, `Email`, `ProductId`, `UserId`, `OwnerId` | Default status: `"New"` |
| `AdminInquiry` | `Name`, `Email`, `Phone`, `Subject` | `UserId` is nullable |
| `Rating` | `Host`, `Method`, `Path`, `RecordDate` | Logs all requests automatically |

---

## AutoMapper Mappings (in Services/AutoMapping.cs)
```csharp
// Users
CreateMap<User, UserProfileDTO>();
CreateMap<UserRegisterDTO, User>();
CreateMap<UserUpdateDTO, User>();
CreateMap<User, UserUpdateDTO>();

// Products
CreateMap<Product, ProductSummaryDTO>()
    .ForMember(dest => dest.TransactionType, opt => opt.MapFrom(src => src.TransactionType))
    .ForMember(dest => dest.CategoryCategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : null));
CreateMap<Product, ProductDetailsDTO>();
CreateMap<ProductDetailsDTO, Product>();
CreateMap<ProductCreateDTO, Product>();
CreateMap<ProductUpdateDTO, Product>();
CreateMap<Product, ProductViewDTO>();

// Product Images
CreateMap<ProductImage, ProductImageDTO>();
CreateMap<ProductImageDTO, ProductImage>();
CreateMap<ProductImageCreateDTO, ProductImage>();
CreateMap<ProductImageUpdateDTO, ProductImage>();
CreateMap<ProductImage, ProductImageUrlDTO>();
CreateMap<ProductImageUrlDTO, ProductImage>();

// Categories
CreateMap<Category, CategoryDTO>();
CreateMap<CategoryDTO, Category>();
CreateMap<CategoryCreateDTO, Category>();
CreateMap<CategoryUpdateDTO, Category>();

// Orders
CreateMap<Order, OrderDTO>();
CreateMap<OrderDTO, Order>();
CreateMap<OrderCreateDTO, Order>();
CreateMap<Order, OrderHistoryDTO>();
CreateMap<Order, OrderHistoryAdminDTO>()
    .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : "לא ידוע"));
CreateMap<Order, OrderAdminDTO>()
    .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : "לא ידוע"));

// Order Items
CreateMap<OrderItem, OrderItemDTO>();
CreateMap<OrderItemDTO, OrderItem>();
```

---

## Middleware Pipeline (order is fixed — do not change)
1. **`UseRateLimiter`** — 5 requests per 15 seconds per IP (uses X-Forwarded-For if available)
2. **`UseErrorHandling`** — catches all unhandled exceptions → 500 JSON, handles 429 rate limit responses
3. **`AdminAuthorizationMiddleware`** — blocks `/api/admin/*` unless header `IsAdmin: true` is present. **Exception:** `POST /api/admin/inquiry` is public
4. **`UseRating`** — logs every request to the `Ratings` table (Host, Method, Path, Referer, UserAgent, RecordDate)
5. **`UseStaticFiles`** → **`UseRouting`** → **`UseAuthorization`** → **`MapControllers`**

### Middleware Details

#### ErrorHandlingMiddleware
- Catches all unhandled exceptions
- Returns JSON error responses with StatusCode, Message, ErrorDetails
- Handles 429 rate limit responses with nextRetryTime
- Logs all errors with full exception details

#### AdminAuthorizationMiddleware
- Checks `IsAdmin: true` header for `/api/admin/*` routes
- **Exception:** `POST /api/admin/inquiry` is public (no admin check)
- Returns 403 Forbidden with "Access denied. Admin privileges required." message

#### RatingMiddleware
- Logs every request to Rating entity
- Captures: Host, Method, Path, Referer, UserAgent, RecordDate
- Uses dependency injection to get IRatingService

---

## Configuration Files

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server = DESKTOP-TB3DT9H; Database = RealEstateDB_; Trusted_Connection = True; TrustServerCertificate = True;",
    "BatshevaConnection": "Server = DESKTOP-1VUANBN; Database = RealEstateDB_; Trusted_Connection = True; TrustServerCertificate = True;",
    "SchoolConnection": "Server = SRV2\\PUPILS; Database = RealEstateEND; Trusted_Connection = True; TrustServerCertificate = True;"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": "587",
    "SenderEmail": "l0583263572@gmail.com",
    "SenderPassword": "fmrx gzko ebxa apnl",
    "RecipientEmail": "l0583263572@gmail.com"
  }
}
```

### NLog Configuration
- **File logging:** `../../../logFile.log` with detailed format including URL, action, body
- **Email logging:** Sends errors to `39216259168@mby.co.il` via Gmail SMTP
- **Log levels:** Info+ to file, Error+ to email
- **Filters:** Skips Microsoft and System.Net.Http logs

---

## Testing Rules

### DatabaseFixture Pattern
```csharp
public class DatabaseFixture : IDisposable
{
    public ShopContext Context { get; private set; }

    public DatabaseFixture()
    {
        var options = new DbContextOptionsBuilder<ShopContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        Context = new ShopContext(options);
    }
}
```

### Unit Test Patterns
- **Always mock:** `IRepository`, `IMapper`, `IPasswordService`
- **Test password validation:** `Assert.ThrowsAsync<Exception>` for weak passwords
- **Mock product repository:** Return empty list for `GetProductsByOwnerId` in delete tests
- **UserProfileDTO constructor:** `(int UserId, string FullName, string Phone, string Address, bool IsAdmin)` — **no Email**

### Integration Test Rules
- **Always use `DatabaseFixture`** — creates unique InMemory database per test
- **Never use SQL Server** in tests
- **Required fields:** When creating `Product`, always set `TransactionType = "Rent"`
- **Service exceptions:** `RegisterUser` throws `Exception` on weak password

```powershell
dotnet test TestProject/TestProject.csproj
```

---

## Build & Configuration
```powershell
dotnet restore
dotnet build        # expect ~51 nullable warnings (CS8603 etc.) — these are pre-existing, not errors
dotnet run --project WebApiShop
# API: http://localhost:5202
# Swagger: http://localhost:5202/swagger  (dev only)
```

**Active Connection String:** Uses `BatshevaConnection` from appsettings.json
**CORS:** Only allows `http://localhost:4200` with exposed header `IsAdmin`

---

## Known Quirks & Important Notes
- **`ICategoriesServies`** has a typo (missing 'r') — this is the existing interface name, match it exactly
- **Entities** are in `#nullable disable` mode (auto-generated by EF Core Power Tools) — do not add nullable annotations
- **`PageResponseDTO<T>`** is a class with property setters, not a record — instantiate with `new PageResponseDTO<T>()` then set properties
- **Rate limiting** is enabled globally (5 requests per 15 seconds per IP)
- **Hebrew error messages** are used in some services and controllers
- **Email credentials** are hardcoded in appsettings.json — use environment variables in production
- **Multiple connection strings** available for different environments (Default, Batsheva, School)
- **NLog email alerts** send to specific email on errors — configure for your environment