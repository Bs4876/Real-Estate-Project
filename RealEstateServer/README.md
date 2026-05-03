# Real Estate Backend API

ASP.NET Core Web API for a real estate platform. Enables property listings, user registration, orders, inquiries, and admin management.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup and Installation](#setup-and-installation)
4. [Configuration](#configuration)
5. [Architecture](#architecture)
6. [API Reference](#api-reference)
7. [Data Models](#data-models)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [Business Flows](#business-flows)
10. [Testing](#testing)
11. [Contributing](#contributing)
12. [Security Considerations](#security-considerations)
13. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | ASP.NET Core 8.0 |
| Database | SQL Server |
| ORM | Entity Framework Core |
| Logging | NLog (file + email) |
| Email | MailKit (Gmail SMTP) |
| Mapping | AutoMapper |
| API Docs | Swagger (Development) |

---

## Project Structure

```
Real-Estate-Backend/
├── WebApiShop/                    # Main API project
│   ├── Controllers/               # API endpoints
│   │   ├── UsersController.cs
│   │   ├── ProductController.cs
│   │   ├── OrderController.cs
│   │   ├── CategoryController.cs
│   │   ├── AdminController.cs
│   │   ├── PasswordController.cs
│   │   ├── ProductImageController.cs
│   │   ├── PropertyInquiryController.cs
│   │   └── RatingController.cs
│   ├── Middleware/
│   │   ├── ErrorHandlingMiddleware.cs
│   │   ├── AdminAuthorizationMiddleware.cs
│   │   └── RatingMiddleware.cs
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── nlog.config
├── Entities/                      # Domain models
├── Repository/                    # Data access (EF Core, DbContext)
├── Services/                      # Business logic
├── DTOs/                          # Data Transfer Objects
└── TestProject/                   # Unit & integration tests
```

---

## Setup and Installation

### Prerequisites

| Requirement | Version / Details |
|-------------|-------------------|
| .NET SDK | 8.0 or later |
| SQL Server | LocalDB, Express, or full instance |
| IDE (optional) | Visual Studio 2022, Rider, or VS Code with C# extension |

Verify .NET:

```powershell
dotnet --version
```

### 1. Restore Dependencies

```powershell
dotnet restore
# or
dotnet restore WebApiShop.sln
```

### 2. Create the Database

**Option A: Run the SQL Script (recommended)**

1. Open SQL Server Management Studio (SSMS) or run `sqlcmd`
2. Execute the script at `WebApiShop/SCRIPT.txt`
3. Creates `RealEstateDB_` and tables: Users, Categories, Products, Orders, OrderItems, ProductImages, Ratings, PropertyInquiries, AdminInquiries

**Option B: EF Core Migrations**

```powershell
dotnet ef migrations add InitialCreate --project Repository --startup-project WebApiShop
dotnet ef database update --project Repository --startup-project WebApiShop
```

### 3. Configure Connection String

Edit `WebApiShop/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=RealEstateDB_;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| Server | SQL Server instance | `DESKTOP-XXX`, `localhost`, `(localdb)\MSSQLLocalDB` |
| Database | Database name | `RealEstateDB_` |
| Trusted_Connection | Windows auth | `True` |
| TrustServerCertificate | Skip cert validation (dev) | `True` |

For SQL auth: `Server=SERVER;Database=RealEstateDB_;User Id=USER;Password=PASSWORD;TrustServerCertificate=True;`

### 4. Build and Run

```powershell
dotnet build
dotnet run --project WebApiShop
```

**Launch profiles:**
- HTTP: `http://localhost:5202`
- HTTPS: `https://localhost:7046`
- Swagger: `http://localhost:5202/swagger`

### Quick Commands

| Command | Purpose |
|---------|---------|
| `dotnet restore` | Restore packages |
| `dotnet build` | Build solution |
| `dotnet run --project WebApiShop` | Run API |
| `dotnet watch run --project WebApiShop` | Run with hot reload |
| `dotnet test TestProject/TestProject.csproj` | Run tests |

---

## Configuration

### appsettings.json

**Logging:**
```json
"Logging": {
  "LogLevel": {
    "Default": "Information",
    "Microsoft.AspNetCore": "Warning"
  }
}
```

**AllowedHosts:** `"*"` (allow any host; restrict in production)

**EmailSettings (optional):**
```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": "587",
  "SenderEmail": "your-email@gmail.com",
  "SenderPassword": "your-app-password",
  "RecipientEmail": "recipient@example.com"
}
```

### appsettings.Development.json

Override connection string for local development.

### launchSettings.json (`WebApiShop/Properties/`)

| Profile | URLs |
|---------|------|
| http | http://localhost:5202 |
| https | https://localhost:7046; http://localhost:5202 |
| IIS Express | http://localhost:44146, https://localhost:44305 |

### nlog.config

- **File logging:** `../../../logFile.log`
- **Email logging:** Sends on Error level (configure SMTP in `nlog.config`)

### CORS (Program.cs)

- Allowed origin: `http://localhost:4200` (Angular frontend)
- Exposed header: `IsAdmin`

### User Secrets (recommended for dev)

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=...;Database=...;..." --project WebApiShop
dotnet user-secrets set "EmailSettings:SenderPassword" "app-password" --project WebApiShop
```

### Environment Variables

Override config: `Section__Key` (e.g., `ConnectionStrings__DefaultConnection`)

---

## Architecture

### High-Level Flow

```
HTTP Request
    ↓
Middleware (ErrorHandling → AdminAuthorization → Rating → StaticFiles → Routing → Authorization)
    ↓
Controllers
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Database (SQL Server)
```

### Project Dependencies

```
WebApiShop → Services
Services → Repository, DTOs
Repository → Entities, DTOs
TestProject → DTOs, Entities, Repository, Services
```

### Middleware Pipeline (order)

1. **UseErrorHandling** – Catches unhandled exceptions, returns 500 JSON
2. **AdminAuthorizationMiddleware** – Blocks non-admin access to `/api/admin/*` (except POST `/api/admin/inquiry`)
3. **UseRating** – Logs every request (Host, Method, Path, etc.) to Ratings table
4. UseStaticFiles, UseRouting, UseAuthorization, MapControllers

### Entity Model (ShopContext)

| DbSet | Entity | Description |
|-------|--------|-------------|
| Categories | Category | Property types |
| Products | Product | Real estate listings |
| ProductImages | ProductImage | Additional images per product |
| Users | User | Users (owners, customers, admins) |
| Orders | Order | Orders |
| OrderItems | OrderItem | Line items in orders |
| PropertyInquiries | PropertyInquiry | Inquiries about properties |
| AdminInquiries | AdminInquiry | General contact inquiries |
| Ratings | Rating | Request logging |

### Key Patterns

- **Repository pattern** – Abstracts data access
- **Service pattern** – Business logic in services
- **DTO pattern** – Entities not exposed directly
- **AutoMapper** – Maps Entities ↔ DTOs in `Services/AutoMapping.cs`
- **Dependency Injection** – All services/repos registered as Scoped in Program.cs

---

## API Reference

**Base URL:** `/api`  
**Content-Type:** `application/json` (unless noted)  
**Admin routes:** Require `IsAdmin: true` header (except POST `/api/admin/inquiry`)  
**CORS:** `http://localhost:4200`

### Users (`/api/users`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get all users |
| GET | `/{id}` | Get user by ID |
| POST | `/` | Register (UserRegisterDTO) |
| POST | `/login` | Login (UserLoginDTO) |
| PUT | `/{id}` | Update user |
| DELETE | `/{id}` | Delete user |

**Register body:** FullName, Email, Password (min 8, strength ≥2), Phone, Address  
**Login body:** Email, Password  
**Response:** UserProfileDTO (no password)

### Products (`/api/product`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | List (filtered, paged) |
| GET | `/{id}` | Get by ID |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |
| GET | `owner/{ownerId}` | Get by owner |
| GET | `check-availability?productId=&start=&end=` | Check availability |
| GET | `search?query=` | Search |
| GET | `featured?count=5` | Featured products |

**List query params:** categoryIds, title, city, minPrice, maxPrice, rooms, beds, position, skip

### Orders (`/api/order`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get all orders |
| GET | `/{id}` | Get by ID |
| GET | `user/{userId}` | Get by user |
| POST | `/` | Create (OrderCreateDTO) |
| PUT | `/{orderId}/status` | Update status |
| PUT | `/{orderId}/delivered` | Mark delivered |
| GET | `occupied-dates/{productId}?month=&year=` | Occupied dates |

**Create body:** UserId, OrderItems (ProductId, StartDate?, EndDate?)

### Categories (`/api/category`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get all |
| GET | `/{id}` | Get by ID |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

### Product Images (`/api/productimage`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/{id}` | Get by ID |
| GET | `productImage/{productId}` | Get by product |
| POST | `/` | Add image (URL) |
| POST | `upload` | Upload file (multipart/form-data) |
| PUT | `/{imageId}` | Update |
| DELETE | `/{id}` | Delete |

### Property Inquiries (`/api/propertyinquiry`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get all |
| GET | `/{id}` | Get by ID |
| GET | `owner/{ownerId}` | Get by owner |
| GET | `user/{userId}` | Get by user |
| POST | `/` | Create |
| PUT | `/{id}/status` | Update status |
| DELETE | `/{id}` | Delete |

**Create body:** ProductId, UserId, OwnerId, Name, Phone, Email, Message

### Admin (`/api/admin`)

**All require `IsAdmin: true` except POST inquiry.**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `users` | Get all users |
| GET | `products` | Get all products |
| GET | `orders` | Get all orders |
| GET | `statistics` | Admin stats |
| GET | `inquiries` | Get admin inquiries |
| GET | `inquiry/{id}` | Get inquiry by ID |
| POST | `inquiry` | Create inquiry (public) |
| PUT | `inquiry/{id}/status` | Update inquiry status |
| DELETE | `user/{id}` | Delete user |
| DELETE | `product/{id}` | Delete product |
| DELETE | `order/{id}` | Delete order |
| DELETE | `inquiry/{id}` | Delete inquiry |

### Password (`/api/password`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Check password strength (body: raw string) |

**Response:** CheckPassword (password, strength 0–4)

### Ratings (`/api/rating`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `all` | Get all ratings (analytics) |

### Error Responses

| Status | When |
|--------|------|
| 400 | Validation, bad request |
| 403 | Admin route without IsAdmin header |
| 404 | Resource not found |
| 409 | Order conflict (product unavailable) |
| 500 | Unhandled exception |

---

## Data Models

### Entity Relationships

```
User ◄── Products (Owner), Orders
Product ◄── ProductImages, OrderItems, PropertyInquiries
Category ◄── Products
Order ◄── OrderItems
OrderItem ◄── Product
PropertyInquiry ◄── Product, User, Owner
AdminInquiry ◄── User (optional)
Rating (standalone)
```

### Key Entities

**User:** UserId, FullName, Email, Password, Phone, Address, IsAdmin  
**Product:** ProductId, Title, Description, Price, ImageUrl, CategoryId, City, Rooms, Beds, OwnerId, IsAvailable, TransactionType  
**Order:** OrderId, UserId, OrderDate, TotalAmount, Status  
**OrderItem:** OrderItemId, OrderId, ProductId, StartDate, EndDate, PriceAtPurchase  
**Category:** CategoryId, CategoryName, Description  
**PropertyInquiry:** InquiryId, ProductId, UserId, OwnerId, Name, Phone, Email, Message, Status  
**AdminInquiry:** InquiryId, UserId, Name, Email, Phone, Subject, Message, Status  
**Rating:** RatingId, Host, Method, Path, Referer, UserAgent, RecordDate

### DTOs by Domain

**User:** UserProfileDTO, UserRegisterDTO, UserLoginDTO, UserUpdateDTO  
**Product:** ProductSummaryDTO, ProductDetailsDTO, ProductCreateDTO, ProductUpdateDTO, PageResponse\<T\>  
**Order:** OrderDTO, OrderCreateDTO, OrderItemCreateDTO, OrderStatusUpdateDTO, OccupiedDatesResponseDTO  
**Category:** CategoryDTO, CategoryCreateDTO, CategoryUpdateDTO  
**Inquiries:** PropertyInquiryDTO, PropertyInquiryCreateDTO, AdminInquiryDTO, AdminInquiryCreateDTO

Mappings in `Services/AutoMapping.cs`.

---

## Authentication and Authorization

### Overview

No JWT or bearer tokens. Login returns UserProfileDTO with IsAdmin. Frontend stores user state and sends `IsAdmin: true` for admin endpoints. AdminAuthorizationMiddleware validates this header.

### Registration

1. POST /api/users with UserRegisterDTO
2. Password strength ≥ 2 (zxcvbn); email unique
3. Returns UserProfileDTO (no password)

### Login

1. POST /api/users/login with UserLoginDTO
2. Returns UserProfileDTO or 400

### Password Update

PUT /api/users/{id} with UserUpdateDTO. If Password provided, OldPassword required; new password strength ≥ 2.

### Admin Authorization

- Path not `/api/admin` → pass through
- POST /api/admin/inquiry → pass through (public)
- Otherwise: require `IsAdmin: true` header; else 403

### Limitations

- No session/token; stateless header-based
- Role granularity: admin vs non-admin only
- No per-resource ownership checks

---

## Business Flows

### Order Creation

1. POST /api/order with UserId, OrderItems (ProductId, StartDate, EndDate)
2. For each item: validate product exists, skip Sale/מכירה, check availability, compute days × price
3. If unavailable → 409 Conflict (Hebrew message)
4. Total = sum of item totals; persist Order + OrderItems

### Availability (CheckAvailability)

Returns false if: product missing/unavailable, Sale/מכירה, invalid dates, overlaps with existing OrderItems. Returns true if available.

### Property Inquiry

1. POST /api/propertyinquiry with ProductId, UserId, OwnerId, Name, Phone, Email, Message
2. Status = "New"; save; return PropertyInquiryDTO

### Admin Inquiry (Contact Form)

1. POST /api/admin/inquiry (no auth) with Name, Email, Phone, Subject, Message
2. Save AdminInquiry; send email to RecipientEmail; return AdminInquiryDTO

### Image Upload

1. POST /api/productimage/upload with multipart file
2. Save to wwwroot/images/{Guid}.ext
3. Return relative URL (e.g. /images/xxx.jpg)

### Occupied Dates

GET /api/order/occupied-dates/{productId}?month=&year= returns dates already booked for that product.

---

## Testing

### Stack

xUnit, Moq, Moq.EntityFrameworkCore, EF Core InMemory, Coverlet

### Run Tests

```powershell
dotnet test TestProject/TestProject.csproj
dotnet test TestProject/TestProject.csproj --collect:"XPlat Code Coverage"
```

### DatabaseFixture

Uses `UseInMemoryDatabase(Guid.NewGuid())` for isolated integration tests. Implement `IClassFixture<DatabaseFixture>` and use `_fixture.Context`.

### Unit Tests

Mock I*Repository, IMapper; test service logic.

### Integration Tests

Use real repositories with in-memory DB via DatabaseFixture.

### Existing Tests

UserUnitTest, OrdersUnitTest, CategoriesUnitTest, ProductUnitTest, UserIntegrationTest, OrderIntegrationTest, CategoriesIntegrationTest, ProductIntegrationTest

---

## Contributing

### Adding a New Feature

1. **Entity:** Create in Entities/, add DbSet to ShopContext, update SCRIPT.txt
2. **DTOs:** Create in DTOs/, add mappings in AutoMapping.cs
3. **Repository:** IMyEntityRepository + MyEntityRepository, register in Program.cs
4. **Service:** IMyEntityService + MyEntityService, register in Program.cs
5. **Controller:** MyEntityController with [Route("api/[controller]")]
6. **Tests:** Unit and integration tests

### Naming Conventions

- Entity: singular (Product)
- DTO: *DTO, *CreateDTO, *UpdateDTO
- Repository: IProductRepository, ProductRepository
- Service: IProductService, ProductService
- Controller: ProductController → api/product

### Code Style

- Use async Task for I/O
- Log with ILogger and structured messages
- Return NotFound() for missing resources
- No circular project references

### Checklist

- [ ] Tests added
- [ ] No secrets in code
- [ ] dotnet build succeeds
- [ ] dotnet test passes

---

## Security Considerations

### Current State

- No JWT; admin via `IsAdmin` header (spoofable)
- Passwords: verify hashing in UsersRepository
- No resource ownership checks
- Secrets in appsettings (use User Secrets / env vars)
- CORS restricted to localhost:4200
- HTTPS supported
- SQL injection: EF parameterized

### Critical Risks

1. **Admin header spoofing** – Implement JWT/sessions with server-side validation
2. **Credentials in config** – Use User Secrets, env vars, Key Vault
3. **Password storage** – Hash with bcrypt/Argon2
4. **No ownership checks** – Add per-resource authorization

### Deployment Checklist

- [ ] Secrets externalized
- [ ] HTTPS enforced
- [ ] CORS restricted to prod frontend
- [ ] Passwords hashed
- [ ] Swagger disabled in production
- [ ] `dotnet list package --vulnerable` clean

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SQL connection failed | Verify SQL Server running; fix Server in connection string |
| Database does not exist | Run WebApiShop/SCRIPT.txt |
| Port in use | Change in launchSettings.json |
| CORS errors | Ensure frontend at http://localhost:4200 or update Program.cs |
| NLog file not found | Create log dir or fix path in nlog.config |
| MailKit errors | Check SMTP credentials; disable email target if unused |

---

*Last updated: March 2026*
