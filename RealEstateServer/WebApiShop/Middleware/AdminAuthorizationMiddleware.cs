namespace WebApiShop.Middleware
{
    public class AdminAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;

        public AdminAuthorizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/api/admin"))
            {
                // Allow POST to /api/admin/inquiry for all users
                if (context.Request.Path.Value.Equals("/api/admin/inquiry", StringComparison.OrdinalIgnoreCase) 
                    && context.Request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase))
                {
                    await _next(context);
                    return;
                }

                var isAdminHeader = context.Request.Headers["IsAdmin"].FirstOrDefault();
                if (isAdminHeader != "true")
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Access denied. Admin privileges required.");
                    return;
                }
            }

            await _next(context);
        }
    }
}
