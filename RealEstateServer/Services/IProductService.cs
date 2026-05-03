using DTOs;

namespace Services
{
    public interface IProductService
    {
        Task<ProductDetailsDTO> AddProduct(ProductCreateDTO productCreateDto);
        Task<bool> CheckAvailability(int productId, DateTime? start, DateTime? end);
        Task<bool> DeleteProduct(int id);
        Task<ProductDetailsDTO> GetProductById(int id);
        Task<PageResponseDTO<ProductSummaryDTO>> GetProducts(int?[] categoryIds, string? title, string? city, decimal? minPrice, decimal? maxPrice, int? rooms, int? beds, int position, int skip);
        Task<List<ProductSummaryDTO>> GetProductsByOwnerId(int ownerId);
        Task<ProductDetailsDTO> UpdateProduct(int id, ProductUpdateDTO productUpdateDto);
        Task<List<ProductSummaryDTO>> SearchProducts(string query);
        Task<List<ProductSummaryDTO>> GetFeaturedProducts(int count = 5);
    }
}