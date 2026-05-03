using Entities;
using Moq;
using Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace TestProject
{
    public class ProductUnitTest
    {
        private readonly Mock<IProductRepository> _mockRepository;

        public ProductUnitTest()
        {
            _mockRepository = new Mock<IProductRepository>();
        }

        [Fact]
        public async Task GetProducts_ReturnsFilteredProducts()
        {
            // Arrange
            var products = new List<Product>
            {
                new Product { ProductId = 1, Title = "Product1", Price = 100, CategoryId = 1 },
                new Product { ProductId = 2, Title = "Product2", Price = 200, CategoryId = 2 },
                new Product { ProductId = 3, Title = "Product3", Price = 150, CategoryId = 1 }
            };

            _mockRepository.Setup(repo => repo.GetProducts(It.IsAny<int?[]>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<int>(), It.IsAny<int>()))
                           .ReturnsAsync((products, products.Count));

            // Act
            var result = await _mockRepository.Object.GetProducts(new int?[] { 1 }, null, null, 100, 200, null, null, 1, 10);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.total);
            Assert.Equal(3, result.Item1.Count);
        }

        [Fact]
        public async Task GetProducts_ReturnsZeroWhenNoProductsMatchCriteria()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetProducts(It.IsAny<int?[]>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<int>(), It.IsAny<int>()))
                           .ReturnsAsync((new List<Product>(), 0));

            // Act
            var result = await _mockRepository.Object.GetProducts(new int?[] { 1 }, null, null, 250, 300, null, null, 1, 10);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.total);
            Assert.Empty(result.Item1);
        }
    }
}
