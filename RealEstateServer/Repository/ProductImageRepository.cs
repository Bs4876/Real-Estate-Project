using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class ProductImageRepository :  IProductImageRepository
    {
        private readonly ShopContext _ShopContext;

        public ProductImageRepository(ShopContext ShopContext)
        {
            this._ShopContext = ShopContext;
        }

        public async Task<ProductImage> getProductImageById(int id)
        {
            return await _ShopContext.ProductImages.FirstOrDefaultAsync(x => x.ImageId == id);
        }

        public async Task<List<ProductImage>> GetProductImagesByProductId(int productId)
        {
            return await _ShopContext.ProductImages
                .Where(img => img.ProductId == productId)
                .ToListAsync();
        }

        public async Task<ProductImage> AddProductImage(ProductImage productImage)
        {
            await _ShopContext.ProductImages.AddAsync(productImage);
            await _ShopContext.SaveChangesAsync();
            return productImage;
        }

        public async Task<ProductImage> UpdateProductImage(int imageId, ProductImage updateImage)
        {
            ProductImage image = await _ShopContext.ProductImages.FirstOrDefaultAsync(img => img.ImageId == imageId);

            if (image == null)
                return null;
            image.ProductId = updateImage.ProductId;
            image.AdditionalImageUrl = updateImage.AdditionalImageUrl;

            await _ShopContext.SaveChangesAsync();
            return image;
        }

        public async Task DeleteImage(ProductImage image)
        {
            _ShopContext.ProductImages.Remove(image);
            await _ShopContext.SaveChangesAsync();
        }
    }
}