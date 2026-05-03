# Real Estate Platform - General Guidelines

## What the System Does

A full-stack real estate platform that enables:
- **Property Owners**: Publish properties for sale, rent, or vacation with image management, pricing, and details
- **Customers**: Search and filter properties, add to favorites, place orders and payments, ratings, and inquiries
- **Admins**: Manage users, properties, orders, statistics, and inquiries through a dedicated dashboard
- **Additional Features**: Chatbot, shopping cart system, email notifications, occupied dates management for vacation rentals

## Technologies

### Backend
- **Framework**: ASP.NET Core Web API (.NET 8.0)
- **Database**: SQL Server
- **ORM**: Entity Framework Core
- **Logging**: NLog with email support
- **Email**: MailKit (Gmail SMTP)
- **Mapping**: AutoMapper
- **API Documentation**: Swagger UI
- **Architecture**: Layered Architecture (Controllers → Services → Repository → Entities)

### Frontend
- **Framework**: Angular 21.1.4
- **Language**: TypeScript 5.9
- **UI Library**: PrimeNG 21.1.1 + PrimeFlex
- **State Management**: RxJS 7.8
- **Testing**: Vitest 4.0.8, Jasmine
- **Styling**: SCSS with purple gradient design system
- **Package Manager**: npm 11.8.0

## Architecture

### Backend - Layered Architecture
```
Controllers (API Layer)
    ↓
Services (Business Logic)
    ↓
Repository (Data Access)
    ↓
Entities (Domain Models)
    ↓
Database (SQL Server)
```

**Principles:**
- Clear separation between layers
- Dependency Injection for all services
- Repository Pattern for data access
- DTO Pattern for data transfer between layers
- Custom Middleware for error handling and authorization

### Frontend - Component-Based Architecture
```
App Component (Root)
    ↓
Feature Components (Pages)
    ↓
Services (API Communication)
    ↓
Models (TypeScript Interfaces)
```

**Principles:**
- Component-based architecture
- Reactive programming with RxJS
- Lazy loading for modules
- Route guards for protecting routes
- Shared services for global state

## How to Run the Project

### Frontend Setup
```bash
cd RealEstateClient
npm install
ng serve                    # Runs on http://localhost:4200
ng build                    # Production build to dist/
ng test                     # Run Vitest tests
```

### Backend Setup
1. **Database**: Ensure SQL Server is running. Connection string in `appsettings.json`
2. **Build & Run**:
   ```bash
   cd RealEstateServer
   dotnet build
   dotnet run --project WebApiShop/WebApiShop.csproj
   ```
3. **API Access**: Swagger UI available at `https://localhost:44305/swagger`

### Important Settings
- **Frontend API Base**: Configured in services (typically `https://localhost:44305`)
- **CORS**: Backend allows only `http://localhost:4200`
- **Email**: Gmail SMTP settings in `appsettings.json`
- **Database Connection**: `appsettings.json` contains server name

## Important Code Rules and Principles

### Backend (.NET/C#)

1. **Always Async/Await**
   - All Service and Repository methods use `async Task`/`async Task<T>`
   - No synchronous database calls

2. **Exception Handling**
   - Central Middleware (`ErrorHandlingMiddleware`) handles all exceptions
   - Don't wrap try-catch in Controllers - let middleware handle it

3. **Dependency Injection**
   - All services registered in `Program.cs` with `AddScoped`
   - Use constructor injection only

4. **Always DTOs**
   - Never return Entities directly from API
   - Use AutoMapper for Entity ↔ DTO mapping

5. **Repository Pattern**
   - All database access through Repository
   - Services don't talk directly to DbContext

6. **Logging**
   - Use NLog for all logs
   - Levels: Debug, Info, Warning, Error

### Frontend (Angular/TypeScript)

1. **Component Structure**
   - Each component in its own folder with `.ts`, `.html`, `.scss`
   - File names: `component-name.component.ts`

2. **Services**
   - All API calls through Services only
   - Use RxJS Observables (not Promises)
   - Inject services through constructor

3. **Reactive Programming**
   - Use RxJS operators: `map`, `switchMap`, `catchError`
   - Subscribe only in components, not in services
   - Unsubscribe in `ngOnDestroy`

4. **Styling**
   - Follow `DESIGN_SYSTEM.md`
   - Use CSS variables (not hardcoded colors)
   - Color scheme: Purple gradient `#667eea → #764ba2`

5. **Type Safety**
   - Define interfaces for all models
   - Don't use `any` (unless no choice)
   - Use TypeScript strict mode

6. **Error Handling**
   - Handle HTTP errors in every subscribe
   - Display user-friendly messages
   - Use PrimeNG MessageService

### General Principles

1. **Clean Code**
   - Descriptive variable and function names
   - Short and focused functions (Single Responsibility)
   - Avoid code duplication (DRY)

2. **Security**
   - Don't store passwords in plain text
   - Validate all user input
   - Use HTTPS only in production

3. **Performance**
   - Lazy loading for large components
   - Pagination for long lists
   - Caching for static data

4. **Testing**
   - Write unit tests for every new service
   - Integration tests for critical flows
   - E2E tests for main scenarios

## Core Entities

- **User**: Registered users (owners and customers) with authentication
- **Product**: Real estate properties with all details (price, location, rooms)
- **Category**: Property types
- **Order**: Customer orders with status tracking
- **OrderItem**: Items in order
- **ProductImage**: Support for multiple images per property
- **Rating**: User ratings for properties
- **PropertyInquiry**: Customer inquiries about properties
- **AdminInquiry**: Admin inquiries

## Important Tools and Libraries

### Backend
- **AutoMapper**: Automatic mapping between DTOs and Entities
- **NLog**: Logging with email notifications on errors
- **MailKit**: Email sending (Gmail SMTP)
- **Swagger**: Automatic API documentation

### Frontend
- **PrimeNG**: Ready-made UI components (buttons, dialogs, tables, calendar)
- **PrimeFlex**: Responsive Grid system
- **RxJS**: Reactive programming
- **Vitest**: Unit testing

## Important Notes

1. **Connection Strings**: Update SQL Server name in `appsettings.json` according to your machine
2. **CORS**: Frontend must run on port 4200
3. **Email Config**: Set environment variables in production (not hardcoded)
4. **Middleware Order**: Order matters in `Program.cs`
5. **Port Conflicts**: Ensure ports 4200 and 44305 are available

---

**Last Updated**: 2025 | **Version**: 1.0
