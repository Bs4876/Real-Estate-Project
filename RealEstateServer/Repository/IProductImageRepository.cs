using Entities;

namespace Repository
{
    public interface IProductImageRepository
    {
        Task<ProductImage> AddProductImage(ProductImage productImage);
        Task DeleteImage(ProductImage image);
        Task<ProductImage> getProductImageById(int id);
        Task<List<ProductImage>> GetProductImagesByProductId(int productId);
        Task<ProductImage> UpdateProductImage(int imageId, ProductImage updateImage);
    }
}