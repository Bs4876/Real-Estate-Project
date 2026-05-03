using Microsoft.AspNetCore.Mvc;
using Services;
using DTOs;
using Entities;
namespace WebApiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductImageController : Controller
    {
        private readonly IProductImageService _iProductImageService;
        private readonly ILogger<ProductImageController> _logger;

        public ProductImageController(IProductImageService iProductImageService, ILogger<ProductImageController> logger)
        {
            _iProductImageService = iProductImageService;
            _logger = logger;
        }

        // GET api/<OrderController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductImageDTO>> GetProductImageById(int id)
        {
            ProductImageDTO productImage = await _iProductImageService.getProductImageById(id);
            if(productImage == null) 
            {
                _logger.LogWarning("Product Image with ID {Id} was not found", id);
                return NotFound();
            }
            return productImage;
        }

        [HttpGet("productImage/{productId}")]
        public async Task<ActionResult<List<ProductImageDTO>>> GetProductImagesByProductId(int productId)
        {
            List<ProductImageDTO> productImages = await _iProductImageService.GetProductImagesByProductId(productId);
            if (productImages == null)
            {
                _logger.LogWarning("Products Image with productID {productId} was not found", productId);
                return NotFound();
            }
            return productImages;
        }

        // POST api/<OrderController>
        [HttpPost]
        public async Task<ActionResult<ProductImageDTO>> AddProductImage(ProductImageCreateDTO productImage)
        {
            ProductImageDTO image = await _iProductImageService.AddProductImage(productImage);
            if (image == null)
            {
                _logger.LogWarning("Failed to add image for product {productId}", productImage.ProductId);
                return BadRequest();
            }
            _logger.LogInformation("Image {imageId} added successfully to product {productId}", image.ImageId, image.ProductId);
            return CreatedAtAction(nameof(GetProductImageById), new { id = image.ImageId }, image);
            //return await _iProductImageService.Invite(order);
        }

        [HttpPut("{imageId}")]
        public async Task<ActionResult> UpdateProductImage(int imageId, ProductImageUpdateDTO imageUpdate)
        {
            ProductImageDTO image = await _iProductImageService.UpdateProductImage(imageId, imageUpdate);
            if (image == null)
            {
                _logger.LogWarning("Update failed: Image {imageId} not found", imageId);
                return BadRequest();
            }

            _logger.LogInformation("Image {imageId} was updated successfully", imageId);
            return Ok(image);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {

            var success = await _iProductImageService.DeleteImage(id);
            if (!success)
            {
                _logger.LogWarning("Delete failed: Attempted to delete non-existent image {id}", id);
                return NotFound();
            }
            _logger.LogInformation("Image {id} was deleted successfully", id);
            return NoContent();
        }
        [HttpPost("upload")]
        public async Task<ActionResult<string>> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            string imageUrl = await _iProductImageService.UploadImage(file);
            return Ok(imageUrl);
        }

    }
}
