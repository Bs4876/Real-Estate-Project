using DTOs;
using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ShopContext _ShopContext;

        public ProductRepository(ShopContext ShopContext)
        {
            this._ShopContext = ShopContext;
        }

        public async Task<(List<Product>, int total)> GetProducts(int?[] categoryIds,string? title, string? city, decimal? minPrice, decimal? maxPrice, int? rooms, int? beds, int position = 1, int skip = 10)
        {
           var query = _ShopContext.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Where(product =>
                ((minPrice == null) ? (true) : (product.Price >= minPrice))
                && ((maxPrice == null) ? (true) : (product.Price <= maxPrice))
                && ((categoryIds == null || categoryIds.Length == 0) ? (true) : (categoryIds.Contains(product.CategoryId)))
                && ((rooms == null) ? (true) : (product.Rooms == rooms))
                && ((beds == null) ? (true) : (product.Beds == beds))
                && ((city == null) ? (true) : (product.City.Contains(city)))
                && ((title == null) ? (true) : product.Title.Contains(title))
                && (product.IsAvailable == true)
            ).OrderBy(product => product.Price);

            Console.WriteLine(query.ToQueryString());

            List<Product> products = await query.Skip(((position - 1) * skip))
            .Take(skip).ToListAsync();

            var total = await query.CountAsync();
            return (products, total);
        }

        public async Task<Product> GetProductById(int id)
        {
            return await _ShopContext.Products
                .Include(p => p.Category)
                .Include(p => p.Owner)
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<List<Product>> GetProductsByOwnerId(int ownerId)
        {
            return await _ShopContext.Products
                .Include(p => p.Category)
                .Where(p => p.OwnerId == ownerId && p.IsAvailable != false)
                .ToListAsync();
        }


        public async Task<Product> AddProduct(Product product)
        {
            await _ShopContext.Products.AddAsync(product);
            await _ShopContext.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> UpdateProduct(int id, Product dto)
        {
            var product = await _ShopContext.Products
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return null;

            if (dto.Title != null)
                product.Title = dto.Title;

            if (dto.Description != null)
                product.Description = dto.Description;

            if (dto.Price != null)
                product.Price = dto.Price;

            if (dto.CategoryId != null)
                product.CategoryId = dto.CategoryId;

            if (dto.City != null)
                product.City = dto.City;

            if (dto.Beds != null)
                product.Beds = dto.Beds.Value;

            if (dto.Rooms != null)
                product.Rooms = dto.Rooms.Value;

            if (dto.TransactionType != null)
                product.TransactionType = dto.TransactionType;

            if (dto.IsAvailable != null)
                product.IsAvailable = dto.IsAvailable;
            if (dto.IsAvailable != null)
            {
                Console.WriteLine($"Updating IsAvailable from {product.IsAvailable} to {dto.IsAvailable}");
                product.IsAvailable = dto.IsAvailable;
            }
            if (!string.IsNullOrEmpty(dto.ImageUrl))
                product.ImageUrl = dto.ImageUrl;


            if (dto.ProductImages != null)
            {
                _ShopContext.ProductImages.RemoveRange(product.ProductImages);

                product.ProductImages = dto.ProductImages
                    .Select(img => new ProductImage
                    {
                        AdditionalImageUrl = img.AdditionalImageUrl
                    })
                    .ToList();
            }

            await _ShopContext.SaveChangesAsync();
            return product;
        }


        public async Task<bool> DeleteProduct(int id)
        {
            Product product = await _ShopContext.Products.FindAsync(id);
            if (product == null)
            {
                return false;
            }

            _ShopContext.Products.Remove(product);
            await _ShopContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Product>> GetAllProductsForAdmin()
        {
            return await _ShopContext.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .ToListAsync();
        }

        public async Task<List<Product>> SearchProducts(string query)
        {
            return await _ShopContext.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Where(p => p.IsAvailable == true && 
                           (p.Title.Contains(query) || p.City.Contains(query)))
                .OrderByDescending(p => p.CreatedDate)
                .Take(10)
                .ToListAsync();
        }

        public async Task<List<Product>> GetFeaturedProducts(int count = 5)
        {
            return await _ShopContext.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Where(p => p.IsAvailable == true)
                .OrderByDescending(p => p.CreatedDate)
                .Take(count)
                .ToListAsync();
        }
    }
}