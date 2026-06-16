using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebApiShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IProductService _productService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(IHttpClientFactory httpClientFactory, IProductService productService, ILogger<SearchController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _productService = productService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SearchQuery req)
        {
            try
            {
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

                var http = _httpClientFactory.CreateClient();
                var res = await http.PostAsJsonAsync("http://localhost:8001/search", new
                {
                    query = req.Query,
                    products = productList,
                    top_k = 5
                });

                var data = await res.Content.ReadFromJsonAsync<SearchResponse>();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchController");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public record SearchQuery(string Query);
    public record SearchResponse(List<object> Results);
}
