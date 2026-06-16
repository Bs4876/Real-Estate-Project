using DTOs;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebApiShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IProductService _productService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(IHttpClientFactory httpClientFactory, IProductService productService, ILogger<ChatController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _productService = productService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest req)
        {
            try
            {
                // Fetch real products from DB
                var products = await _productService.GetFeaturedProducts(50);

                var productList = products.Select(p => new
                {
                    title = p.Title,
                    price = p.Price,
                    city = p.City,
                    rooms = p.Rooms,
                    beds = p.Beds,
                    transactionType = p.TransactionType,
                    isAvailable = p.IsAvailable,
                    description = ""
                }).ToList();

                var payload = new
                {
                    message = req.Message,
                    history = req.History,
                    products = productList
                };

                var http = _httpClientFactory.CreateClient();
                var res = await http.PostAsJsonAsync("http://localhost:8001/chat", payload);

                if (!res.IsSuccessStatusCode)
                {
                    _logger.LogError("AI service returned {StatusCode}", res.StatusCode);
                    return StatusCode(500, "AI service unavailable");
                }

                var data = await res.Content.ReadFromJsonAsync<ChatResponse>();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ChatController");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public record ChatRequest(string Message, List<HistoryItem> History);
    public record HistoryItem(string Role, string Content);
    public record ChatResponse(string Reply);
}
