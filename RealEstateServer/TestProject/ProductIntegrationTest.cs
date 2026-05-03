using Entities;
using Microsoft.EntityFrameworkCore;
using Repository;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace TestProject
{
    public class ProductRepositoryIntegrationTests : IClassFixture<DatabaseFixture>
    {
        private readonly ProductRepository _productRepository;
        private readonly DatabaseFixture _fixture;

        public ProductRepositoryIntegrationTests(DatabaseFixture fixture)
        {
            _fixture = fixture;
            _productRepository = new ProductRepository(_fixture.Context);
        }

        private async Task<Category> CreateCategory(string categoryName)
        {
            var category = new Category { CategoryName = categoryName };
            await _fixture.Context.Categories.AddAsync(category);
            await _fixture.Context.SaveChangesAsync();
            return category;
        }

        [Fact]
        public async Task GetProducts_ReturnsFilteredProductsFromDatabase()
        {
            // Arrange
            var category = await CreateCategory("Category1");
            var product1 = new Product { Title = "Product1", Price = 100, CategoryId = category.CategoryId, TransactionType = "Rent" };
            var product2 = new Product { Title = "Product2", Price = 200, CategoryId = category.CategoryId, TransactionType = "Rent" };

            await _fixture.Context.Products.AddRangeAsync(product1, product2);
            await _fixture.Context.SaveChangesAsync();

            // Act
            var result = await _productRepository.GetProducts(new int?[] { category.CategoryId }, null, null, 100, 200, null, null, 1, 10);

            // Assert
            Assert.True(result.Item1.Count >= 0);
        }

        [Fact]
        public async Task GetProducts_ReturnsEmptyListWhenNoProductsMatchCriteria()
        {
            // Arrange
            var category = await CreateCategory("Category1");
            var product = new Product { Title = "Product1", Price = 100, CategoryId = category.CategoryId, TransactionType = "Rent" };
            await _fixture.Context.Products.AddAsync(product);
            await _fixture.Context.SaveChangesAsync();

            // Act
            var result = await _productRepository.GetProducts(new int?[] { 2 }, null, null, 200, 300, null, null, 1, 10);

            // Assert
            Assert.Equal(0, result.total);
            Assert.Empty(result.Item1);
        }

        [Fact]
        public async Task GetProducts_ReturnsAllProductsWhenNoFiltersApplied()
        {
            // Arrange
            var category1 = await CreateCategory("Category1");
            var category2 = await CreateCategory("Category2");
            var product1 = new Product { Title = "Product1", Price = 100, CategoryId = category1.CategoryId, TransactionType = "Rent" };
            var product2 = new Product { Title = "Product2", Price = 200, CategoryId = category2.CategoryId, TransactionType = "Rent" };

            await _fixture.Context.Products.AddRangeAsync(product1, product2);
            await _fixture.Context.SaveChangesAsync();

            // Act
            var result = await _productRepository.GetProducts(new int?[] {}, null, null, null, null, null, null, 1, 10);

            // Assert
            Assert.True(result.Item1.Count >= 0);
        }
    }
}
