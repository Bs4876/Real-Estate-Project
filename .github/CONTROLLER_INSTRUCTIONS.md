# Controller Instructions

## Controller Architecture Overview
All controllers follow a consistent pattern with dependency injection, async operations, and standardized response formats. Controllers are located in `WebApiShop/Controllers/` and handle HTTP requests by delegating business logic to services.

---

## Standard Controller Structure

### Base Pattern
```csharp
[ApiController]
[Route("api/[controller]")]
public class MyEntityController : ControllerBase
{
    private readonly IMyEntityService _service;
    private readonly ILogger<MyEntityController> _logger;

    public MyEntityController(IMyEntityService service, ILogger<MyEntityController> logger)
    {
        _service = service;
        _logger = logger;
    }
}
```

### Standard Response Patterns
- **Success (200):** `Ok(data)`
- **Created (201):** `CreatedAtAction(nameof(GetById), new { id = result.Id }, result)`
- **No Content (204):** `NoContent()` for successful updates/deletes
- **Not Found (404):** `NotFound()` when resource doesn't exist
- **Bad Request (400):** `BadRequest(new { message = ex.Message })` for validation errors
- **Conflict (409):** `Conflict(new { Message = "..." })` for business conflicts (Hebrew messages)
- **Forbidden (403):** Admin middleware returns "Access denied. Admin privileges required."

---

## Complete Controllers Reference

### UsersController (`api/users`)
**Dependencies:** `IUsersServices`, `ILogger<UsersController>`

**Endpoints:**
```csharp
[HttpGet]                           // Get all users (returns empty list if none)
[HttpGet("{id}")]                   // Get user by ID
[HttpPost]                          // Register new user
[HttpPost("login")]                 // User login
[HttpPut("{id}")]                   // Update user profile
[HttpDelete("{id}")]                // Delete user
```

**Implementation Patterns:**
```csharp
[HttpPost]
public async Task<ActionResult<UserProfileDTO>> RegisterUser(UserRegisterDTO user)
{
    try
    {
        UserProfileDTO result = await _iUsersServices.RegisterUser(user);
        _logger.LogInformation("User registered successfully: ID: {Id}, Email: {Email}", result.UserId, user.Email);
        return CreatedAtAction(nameof(GetAllUsers), new { id = result.UserId }, result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Registration failed for user email: {Email}", user.Email);
        return BadRequest(new { message = ex.Message });
    }
}

[HttpPost("login")]
public async Task<ActionResult<UserProfileDTO>> LoginUser(UserLoginDTO userToLog)
{
    UserProfileDTO user = await _iUsersServices.LoginUser(userToLog);
    if (user == null)
    {
        _logger.LogInformation("Login failed for email: {Email}", userToLog.Email);
        return BadRequest("Login failed for email: {Email}");
    }
    _logger.LogInformation("User login successfully: Name: {FullName}, Email: {Email}", user.FullName, userToLog.Email);
    return Ok(user);
}
```

**Special Behaviors:**
- Registration validates password strength (throws exception if weak)
- Email uniqueness validation in service layer
- Login returns user profile on success, BadRequest on failure
- Delete checks existence before deletion, cascades to owned products
- GetAllUsers returns empty list instead of NotFound

---

### ProductController (`api/product`)
**Dependencies:** `IProductService`, `ICategoriesServies`, `ILogger<ProductController>`

**Endpoints:**
```csharp
[HttpGet]                                    // Get products with filtering & pagination
[HttpGet("{id}")]                           // Get product details
[HttpPost]                                  // Add new product
[HttpPut("{id}")]                          // Update product
[HttpDelete("{id}")]                       // Delete product
[HttpGet("owner/{ownerId}")]               // Get products by owner
[HttpGet("check-availability")]            // Check availability for dates
[HttpGet("search")]                        // Search products by query
[HttpGet("featured")]                      // Get featured products
```

**Complex Filtering Example:**
```csharp
[HttpGet]
public async Task<ActionResult<PageResponseDTO<ProductSummaryDTO>>> GetProducts(
    [FromQuery] int?[] categoryIds, 
    string? title, 
    string? city, 
    decimal? minPrice, 
    decimal? maxPrice, 
    int? rooms, 
    int? beds, 
    int position, 
    int skip)
{
    // Validate category IDs first
    foreach (int id in categoryIds)
    {
        CategoryDTO category = await _iCategoriesServies.GetCategoryById(id);
        if (category == null)
        {
            _logger.LogWarning("Category with ID {Id} was not found", id);
            return BadRequest("Category with ID was not found");
        }
    }
    
    try
    {
        PageResponseDTO<ProductSummaryDTO> result = await _iProductService.GetProducts(
            categoryIds, title, city, minPrice, maxPrice, rooms, beds, position, skip);
        _logger.LogInformation("Successfully fetched products.");
        return Ok(result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error occurred while fetching products. CategoryIds: {CategoryIds}, City: {City}...", 
            categoryIds, city);
        return BadRequest(new { Message = "An error occurred while fetching products.", Details = ex.Message });
    }
}
```

**Special Behaviors:**
- Validates category IDs before filtering
- Returns `PageResponseDTO<ProductSummaryDTO>` for pagination
- Availability checking for rental dates
- Search returns empty list for empty/whitespace queries
- Featured products with configurable count (default 5)
- Detailed error logging with all filter parameters

---

### OrderController (`api/order`)
**Dependencies:** `IOrderService`, `ILogger<OrderController>`

**Endpoints:**
```csharp
[HttpGet("{id}")]                          // Get order by ID
[HttpGet("user/{userId}")]                 // Get user's order history
[HttpGet]                                  // Get all orders (admin view)
[HttpPost]                                 // Create new order
[HttpPut("{orderId}/status")]              // Update order status
[HttpPut("{orderId}/delivered")]           // Mark order as delivered
[HttpGet("occupied-dates/{productId}")]    // Get occupied dates for product
```

**Hebrew Error Handling:**
```csharp
[HttpPost]
public async Task<ActionResult<OrderDTO>> AddOrder(OrderCreateDTO order)
{
    try
    {
        OrderDTO postOrder = await _iOrderService.AddOrder(order);
        _logger.LogInformation("Order added successfully with ID: {Id}", postOrder.OrderId);
        return CreatedAtAction(nameof(GetOrderById), new { id = postOrder.OrderId }, postOrder);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error occurred while adding order");
        if (ex.Message == "ProductUnavailable")
        {
            return Conflict(new { Message = "אחת מהדירות שבחרת כבר תפוסה בתאריכים אלו." });
        }
        return BadRequest(new { Message = "חלה שגיאה בביצוע ההזמנה", Details = ex.Message });
    }
}

[HttpGet("occupied-dates/{productId}")]
public async Task<IActionResult> GetOccupiedDates(int productId, [FromQuery] int month, [FromQuery] int year)
{
    if (month < 1 || month > 12) return BadRequest("חודש לא תקין");
    
    var result = await _iOrderService.GetOccupiedDatesForProduct(productId, month, year);
    return Ok(result);
}
```

**Special Behaviors:**
- Hebrew error messages for user-facing errors
- Special handling for "ProductUnavailable" exceptions → Conflict response
- Month validation (1-12) for occupied dates
- Returns different DTOs for user vs admin views

---

### AdminController (`api/admin`)
**Dependencies:** `IAdminService`, `ILogger<AdminController>`
**Protected by:** `AdminAuthorizationMiddleware` (requires `IsAdmin: true` header)

**Endpoints:**
```csharp
[HttpGet("users")]                         // Get all users
[HttpGet("products")]                      // Get all products  
[HttpDelete("user/{id}")]                  // Delete user (admin)
[HttpDelete("product/{id}")]               // Delete product (admin)
[HttpGet("statistics")]                    // Get admin statistics
[HttpGet("orders")]                        // Get all orders (admin view)
[HttpDelete("order/{id}")]                 // Delete order (admin)
[HttpGet("inquiries")]                     // Get all admin inquiries
[HttpGet("inquiry/{id}")]                  // Get admin inquiry by ID
[HttpPost("inquiry")]                      // Create admin inquiry (PUBLIC!)
[HttpPut("inquiry/{id}/status")]           // Update inquiry status
[HttpDelete("inquiry/{id}")]               // Delete admin inquiry
```

**Public Endpoint Exception:**
```csharp
[HttpPost("inquiry")]  // This endpoint is PUBLIC - no admin check!
public async Task<ActionResult<AdminInquiryDTO>> AddAdminInquiry(AdminInquiryCreateDTO createDto)
{
    try
    {
        _logger.LogInformation("Adding new admin inquiry from: {Email}", createDto.Email);
        AdminInquiryDTO inquiry = await _adminService.AddAdminInquiry(createDto);
        _logger.LogInformation("Admin inquiry added successfully with ID: {Id}", inquiry.InquiryId);
        return CreatedAtAction(nameof(GetAdminInquiryById), new { id = inquiry.InquiryId }, inquiry);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error occurred while adding admin inquiry. Inner: {Inner}", ex.InnerException?.Message);
        return BadRequest(new { Message = "שגיאה ביצירת הפנייה", Details = ex.Message, Inner = ex.InnerException?.Message });
    }
}
```

**Special Behaviors:**
- Most endpoints require admin authorization via middleware
- **Exception:** `POST /inquiry` is public (bypasses admin check)
- Returns `AdminStatisticsDTO` with TotalUsers, TotalProducts, TotalOrders
- Hebrew error messages in some endpoints
- Comprehensive logging for all admin actions

---

### CategoryController (`api/category`)
**Dependencies:** `ICategoriesServies` (note the typo!), `ILogger<CategoryController>`

**Endpoints:**
```csharp
[HttpGet]                                  // Get all categories
[HttpGet("{id}")]                         // Get category by ID
[HttpPost]                                // Create category (admin only)
[HttpPut("{id}")]                        // Update category (admin only)  
[HttpDelete("{id}")]                     // Delete category (admin only)
```

---

### ProductImageController (`api/productimage`)
**Dependencies:** `IProductImageService`, `ILogger<ProductImageController>`

**Endpoints:**
```csharp
[HttpPost]                                // Upload product image
[HttpGet("product/{productId}")]          // Get product images
[HttpPut("{id}")]                        // Update product image
[HttpDelete("{id}")]                     // Delete product image
```

---

### PropertyInquiryController (`api/propertyinquiry`)
**Dependencies:** `IPropertyInquiryService`, `ILogger<PropertyInquiryController>`

**Endpoints:**
```csharp
[HttpPost]                                // Submit property inquiry
[HttpGet("user/{userId}")]                // Get user's inquiries
[HttpGet("owner/{ownerId}")]              // Get inquiries for owner's properties
[HttpPut("{id}/status")]                  // Update inquiry status
```

---

### RatingController (`api/rating`)
**Dependencies:** `IRatingService`, `ILogger<RatingController>`

**Endpoints:**
```csharp
[HttpPost]                                // Submit product rating
[HttpGet("product/{productId}")]          // Get product ratings
[HttpGet("user/{userId}")]                // Get user's ratings
```

---

### PasswordController (`api/password`)
**Dependencies:** `IPasswordService`, `ILogger<PasswordController>`

**Endpoints:**
```csharp
[HttpPost("check-strength")]              // Check password strength
[HttpPost("reset")]                       // Reset password (if implemented)
```

---

## Controller Conventions & Patterns

### Error Handling Pattern
```csharp
try
{
    var result = await _service.SomeMethod(dto);
    _logger.LogInformation("Operation successful with ID: {Id}", result.Id);
    return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error occurred during operation for {Parameter}", parameter);
    return BadRequest(new { message = ex.Message });
}
```

### Logging Guidelines
```csharp
// Success operations
_logger.LogInformation("Successfully created entity with ID {Id}", result.Id);
_logger.LogInformation("User login successfully: Name: {FullName}, Email: {Email}", user.FullName, email);

// Warnings for not found
_logger.LogWarning("Entity with ID {Id} not found", id);
_logger.LogWarning("Login failed for email: {Email}", email);

// Errors with full context
_logger.LogError(ex, "Error processing request for entity ID {Id}", id);
_logger.LogError(ex, "Registration failed for user email: {Email}", user.Email);
```

### Admin Authorization
- **Middleware:** `AdminAuthorizationMiddleware` checks `IsAdmin: true` header
- **Applies to:** All `/api/admin/*` routes
- **Exception:** `POST /api/admin/inquiry` is public
- **Response:** 403 Forbidden with "Access denied. Admin privileges required."

### Hebrew Error Messages
Used in user-facing endpoints for better UX:
```csharp
return Conflict(new { Message = "אחת מהדירות שבחרת כבר תפוסה בתאריכים אלו." });
return BadRequest(new { Message = "חלה שגיאה בביצוע ההזמנה", Details = ex.Message });
return BadRequest("חודש לא תקין");
return BadRequest(new { Message = "שגיאה ביצירת הפנייה", Details = ex.Message });
```

### Validation Patterns
- **DTO validation:** Use DTOs for input validation
- **Business rules:** Services handle business rule validation  
- **Category validation:** ProductController validates category IDs before filtering
- **Date validation:** OrderController validates month range (1-12)
- **Empty query handling:** ProductController returns empty list for empty search queries

---

## Testing Controllers

### Integration Test Pattern
```csharp
[Fact]
public async Task GetById_ExistingId_ReturnsOk()
{
    // Arrange
    var client = _factory.CreateClient();
    
    // Act
    var response = await client.GetAsync("/api/product/1");
    
    // Assert
    response.EnsureSuccessStatusCode();
    var content = await response.Content.ReadAsStringAsync();
    var result = JsonSerializer.Deserialize<ProductDetailsDTO>(content);
    Assert.NotNull(result);
}
```

### Unit Test Pattern
```csharp
[Fact]
public async Task RegisterUser_ThrowsException_WhenPasswordWeak()
{
    // Arrange
    var mockService = new Mock<IUsersServices>();
    var mockLogger = new Mock<ILogger<UsersController>>();
    var controller = new UsersController(mockService.Object, mockLogger.Object);
    
    mockService.Setup(s => s.RegisterUser(It.IsAny<UserRegisterDTO>()))
               .ThrowsAsync(new Exception("הסיסמה חלשה מדי"));
    
    // Act & Assert
    var result = await controller.RegisterUser(new UserRegisterDTO("Test", "test@test.com", "weak", "123", "Address"));
    var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
}
```

### Test Scenarios to Cover
- **All HTTP status codes:** 200, 201, 204, 400, 403, 404, 409
- **Admin authorization:** Test with and without `IsAdmin: true` header
- **Validation errors:** Invalid input, missing required fields
- **Business rule violations:** Weak passwords, duplicate emails, unavailable products
- **Logging behavior:** Verify appropriate log levels and messages
- **Hebrew error messages:** Ensure proper encoding and display

---

## Special Controller Behaviors Summary

### UsersController
- Password strength validation via `IPasswordService`
- Email uniqueness validation
- Cascading delete to owned products
- Returns empty list instead of 404 for GetAllUsers

### ProductController  
- Category validation before filtering
- Complex filtering with multiple optional parameters
- Availability checking for rental conflicts
- Search with empty query handling
- Featured products with configurable count

### OrderController
- Hebrew error messages for better UX
- Special "ProductUnavailable" exception handling
- Date validation for occupied dates
- Different DTOs for user vs admin views

### AdminController
- Mixed public/admin endpoints (inquiry creation is public)
- Comprehensive admin statistics
- Bulk operations for admin management
- Hebrew error messages

### All Controllers
- Consistent error handling with try-catch
- Structured logging with contextual information
- DTO-only responses (never expose entities)
- Async/await patterns throughout