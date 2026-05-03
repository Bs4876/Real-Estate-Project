using Entities;

namespace Repository
{
    public interface IProductRepository
    {
        Task<Product> AddProduct(Product product);
        Task<bool> DeleteProduct(int id);
        Task<Product> GetProductById(int id);
        Task<(List<Product>, int total)> GetProducts(int?[] categoryIds, string? title, string? city, decimal? minPrice, decimal? maxPrice, int? rooms, int? beds, int position = 1, int skip = 10);
        Task<List<Product>> GetAllProductsForAdmin();
        Task<List<Product>> GetProductsByOwnerId(int ownerId);
        Task<Product> UpdateProduct(int id, Product productToUpdate);
        Task<List<Product>> SearchProducts(string query);
        Task<List<Product>> GetFeaturedProducts(int count = 5);
    }
}