using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.EntityFrameworkCore;
using NLog.Web;
using Repositories;
using Repository;
using Services;
using WebApiShop;
using WebApiShop.Middleware;

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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
   
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors();


app.UseErrorHandling();
app.UseMiddleware<AdminAuthorizationMiddleware>();
app.UseRating();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();