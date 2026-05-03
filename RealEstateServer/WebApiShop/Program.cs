using Microsoft.AspNetCore.Hosting.Server;
using System;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using NLog.Web;
using Repositories;
using Repository;
using Services;
using WebApiShop;
using WebApiShop.Middleware;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("BatshevaConnection");
builder.Services.AddDbContext<ShopContext>(option => option.UseSqlServer(connectionString));


builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IUsersServices, UsersServices>();
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoriesServies, CategoriesServies>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IProductImageService, ProductImageService>();
builder.Services.AddScoped<IProductImageRepository, ProductImageRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPropertyInquiryService, PropertyInquiryService>();
builder.Services.AddScoped<IPropertyInquiryRepository, PropertyInquiryRepository>();
builder.Services.AddScoped<IAdminInquiryRepository, AdminInquiryRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();


builder.Host.UseNLog();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("IsAdmin");
    });
});

// Rate limiting: per-client IP Fixed Window (5 requests per 15 seconds)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.OnRejected = async (context, cancellationToken) =>
    {
        // compute retry-after as the window length (best-effort)
        var retryAfterSeconds = 15;
        var nextRetry = DateTime.UtcNow.AddSeconds(retryAfterSeconds).ToString("o");

        context.HttpContext.Response.Headers["Retry-After"] = retryAfterSeconds.ToString();
        context.HttpContext.Response.ContentType = "application/json";
        context.HttpContext.Response.StatusCode = 429;

        var responseObj = new
        {
            StatusCode = 429,
            Message = "Too many requests. Please try again later.",
            nextRetryTime = nextRetry
        };

        var json = JsonSerializer.Serialize(responseObj);

        // Try to log the rejection (if logger is available from DI) including both RemoteIp and X-Forwarded-For for diagnostics
        try
        {
            var logger = context.HttpContext.RequestServices.GetService(typeof(Microsoft.Extensions.Logging.ILoggerFactory)) as Microsoft.Extensions.Logging.ILoggerFactory;
            var xff = context.HttpContext.Request.Headers.ContainsKey("X-Forwarded-For") ? context.HttpContext.Request.Headers["X-Forwarded-For"].ToString() : null;
            logger?.CreateLogger("RateLimiter").LogWarning("Request rejected by rate limiter. Path={Path} RemoteIp={RemoteIp} XFF={Xff}", context.HttpContext.Request.Path, context.HttpContext.Connection.RemoteIpAddress?.ToString(), xff);
        }
        catch { /* swallow logging errors */ }

        await context.HttpContext.Response.WriteAsync(json, cancellationToken);
    };

    // Create a partitioned global limiter (per-IP fixed window) so UseRateLimiter() will enforce it for all requests
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        // Prefer the server-populated RemoteIpAddress (safer). If not available, fall back to X-Forwarded-For.
        string? ip = httpContext.Connection.RemoteIpAddress?.ToString();

        if (string.IsNullOrEmpty(ip) && httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var xff))
        {
            // X-Forwarded-For may contain a list of IPs
            ip = xff.ToString().Split(',')[0].Trim();
        }

        ip ??= "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromSeconds(15),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
   
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors();

// If running behind a proxy, enable forwarded headers so RemoteIpAddress reflects client IP
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Small diagnostic middleware to log incoming IPs and X-Forwarded-For values to help debug rate limiting
var loggerFactory = app.Services.GetRequiredService<Microsoft.Extensions.Logging.ILoggerFactory>();
var diagLogger = loggerFactory.CreateLogger("RateLimiter.Debug");
app.Use(async (ctx, next) =>
{
    string? xff = ctx.Request.Headers.ContainsKey("X-Forwarded-For") ? ctx.Request.Headers["X-Forwarded-For"].ToString() : null;
    var ip = !string.IsNullOrEmpty(xff) ? xff.Split(',')[0].Trim() : ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    diagLogger.LogDebug("Incoming request {Method} {Path} from IP={Ip} XFF={Xff}", ctx.Request.Method, ctx.Request.Path, ip, xff);
    await next();
});

// Plug in rate limiter before error handling so rejections are serialized uniformly
app.UseRateLimiter();

app.UseErrorHandling();
app.UseMiddleware<AdminAuthorizationMiddleware>();
app.UseRating();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();