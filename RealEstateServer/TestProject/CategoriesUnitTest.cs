using Entities;
using Moq;
using Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace TestProject
{
    public class CategoryUnitTest
    {
        private readonly Mock<ICategoryRepository> _mockRepository;

        public CategoryUnitTest()
        {
            _mockRepository = new Mock<ICategoryRepository>();
        }

        [Fact]
        public async Task GetCategories_ReturnsAllCategories()
        {
            // Arrange
            var categories = new List<Category>
            {
                new Category { CategoryId = 1, CategoryName = "Electronics" },
                new Category { CategoryId = 2, CategoryName = "Clothing" }
            };

            _mockRepository.Setup(repo => repo.GetAllCategories()).ReturnsAsync(categories);

            // Act
            var result = await _mockRepository.Object.GetAllCategories();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, c => c.CategoryName == "Electronics");
        }
        [Fact]
        public async Task GetCategories_ReturnsEmptyListWhenNoCategoriesExist()
        {
            // Arrange
            var categories = new List<Category>();

            _mockRepository.Setup(repo => repo.GetAllCategories()).ReturnsAsync(categories);

            // Act
            var result = await _mockRepository.Object.GetAllCategories();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
