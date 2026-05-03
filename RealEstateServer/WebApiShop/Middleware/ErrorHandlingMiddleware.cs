using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace WebApiShop
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);

                // If downstream set 429 and didn't write a body, ensure we return a JSON with nextRetryTime
                if (httpContext.Response?.StatusCode == 429 && !httpContext.Response.HasStarted)
                {
                    // Try to read Retry-After header if present
                    var retryAfterHeader = httpContext.Response.Headers.ContainsKey("Retry-After")
                        ? httpContext.Response.Headers["Retry-After"].ToString()
                        : null;

                    DateTime nextRetryUtc;
                    if (int.TryParse(retryAfterHeader, out var seconds))
                    {
                        nextRetryUtc = DateTime.UtcNow.AddSeconds(seconds);
                    }
                    else
                    {
                        nextRetryUtc = DateTime.UtcNow.AddSeconds(15); // default
                    }

                    httpContext.Response.ContentType = "application/json";

                    var response = new
                    {
                        StatusCode = 429,
                        Message = "Too many requests. Please try again later.",
                        nextRetryTime = nextRetryUtc.ToString("o")
                    };

                    var jsonResponse = JsonSerializer.Serialize(response);
                    await httpContext.Response.WriteAsync(jsonResponse);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);

                httpContext.Response.ContentType = "application/json";
                httpContext.Response.StatusCode = 500;

                var response = new
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred. Please try again later.",
                    ErrorDetails = ex.Message
                };

                var jsonResponse = JsonSerializer.Serialize(response);
                await httpContext.Response.WriteAsync(jsonResponse);
            }
        }
    }

    public static class ErrorHandlingExtensions
    {
        public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ErrorHandlingMiddleware>();
        }
    }
}