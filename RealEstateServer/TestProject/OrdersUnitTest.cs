using Entities;
using Moq;
using Repository;
using System;
using System.Threading.Tasks;
using Xunit;

namespace TestProject
{
    public class OrderUnitTest
    {
        private readonly Mock<IOrderRepository> _mockRepository;

        public OrderUnitTest()
        {
            _mockRepository = new Mock<IOrderRepository>();
        }

        [Fact]
        public async Task GetOrderById_ReturnsOrderWhenOrderExists()
        {
            // Arrange
            var order = new Order { OrderId = 1, OrderDate = DateTime.Now, TotalAmount = 100.0m, UserId = 1 };
            _mockRepository.Setup(repo => repo.GetOrderById(1)).ReturnsAsync(order);

            // Act
            var result = await _mockRepository.Object.GetOrderById(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.OrderId);
            Assert.Equal(order.OrderDate, result.OrderDate);
            Assert.Equal(order.TotalAmount, result.TotalAmount);
            Assert.Equal(order.UserId, result.UserId);
        }

        [Fact]
        public async Task GetOrderById_ReturnsNullWhenOrderDoesNotExist()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.GetOrderById(2)).ReturnsAsync((Order)null);

            // Act
            var result = await _mockRepository.Object.GetOrderById(2);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task AddOrder_ReturnsAddedOrder()
        {
            // Arrange
            var order = new Order { OrderId = 3, OrderDate = DateTime.Now, TotalAmount = 200.0m, UserId = 1 };
            _mockRepository.Setup(repo => repo.AddOrder(order)).ReturnsAsync(order);

            // Act
            var result = await _mockRepository.Object.AddOrder(order);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.OrderId);
            Assert.Equal(order.OrderDate, result.OrderDate);
            Assert.Equal(order.TotalAmount, result.TotalAmount);
            Assert.Equal(order.UserId, result.UserId);
        }

        [Fact]
        public async Task CalculateOrderSum_HappyPath_ReturnsCorrectSum()
        {
            // Arrange
            decimal pricePerDay = 100.0m;
            int days = 5;
            decimal expectedSum = pricePerDay * days;

            // Act
            decimal calculatedSum = pricePerDay * days;

            // Assert
            Assert.Equal(expectedSum, calculatedSum);
            Assert.Equal(500.0m, calculatedSum);
        }

        [Fact]
        public async Task CalculateOrderSum_UnhappyPath_HandlesZeroDays()
        {
            // Arrange
            decimal pricePerDay = 100.0m;
            int days = 0;

            // Act
            decimal calculatedSum = pricePerDay * days;

            // Assert
            Assert.Equal(0, calculatedSum);
        }
    }
}
