using Entities;
using Microsoft.EntityFrameworkCore;
using Repository;
using System;
using System.Threading.Tasks;
using Xunit;

namespace TestProject
{
    public class OrderIntegrationTest : IClassFixture<DatabaseFixture>
    {
        private readonly OrderRepository _orderRepository;
        private readonly DatabaseFixture _fixture;

        public OrderIntegrationTest(DatabaseFixture fixture)
        {
            _fixture = fixture;
            _orderRepository = new OrderRepository(_fixture.Context);
        }

        [Fact]
        public async Task AddOrder_SavesOrderToDatabase()
        {
            // Arrange
            var user = new User
            {
                FullName = "TestUser",
                Email = "test@test.com",
                Password = "TestPassword"
            };

            _fixture.Context.Users.Add(user);
            await _fixture.Context.SaveChangesAsync();

            var order = new Order
            {
                OrderDate = DateTime.Now,
                TotalAmount = 150.0m,
                UserId = user.UserId
            };

            // Act
            var result = await _orderRepository.AddOrder(order);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(order.TotalAmount, result.TotalAmount);
            Assert.Equal(order.UserId, result.UserId);

            var savedOrder = await _fixture.Context.Orders.FirstOrDefaultAsync(x => x.OrderId == result.OrderId);
            Assert.NotNull(savedOrder);
            Assert.Equal(order.TotalAmount, savedOrder.TotalAmount);
            Assert.Equal(order.UserId, savedOrder.UserId);
        }

        [Fact]
        public async Task GetOrderById_ReturnsOrderWhenExists()
        {
            // Arrange
            var user = new User
            {
                FullName = "TestUser2",
                Email = "test2@test.com",
                Password = "TestPassword"
            };

            _fixture.Context.Users.Add(user);
            await _fixture.Context.SaveChangesAsync();

            var order = new Order
            {
                OrderDate = DateTime.Now,
                TotalAmount = 150.0m,
                UserId = user.UserId
            };

            await _orderRepository.AddOrder(order);

            // Act
            var fetchedOrder = await _orderRepository.GetOrderById(order.OrderId);

            // Assert
            Assert.NotNull(fetchedOrder);
            Assert.Equal(order.OrderId, fetchedOrder.OrderId);
            Assert.Equal(order.UserId, fetchedOrder.UserId);
        }

        [Fact]
        public async Task GetOrderById_ReturnsNullWhenOrderDoesNotExist()
        {
            // Act
            var result = await _orderRepository.GetOrderById(99);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task AddOrder_CalculatesCorrectSum_HappyPath()
        {
            // Arrange
            var user = new User { FullName = "SumTestUser", Email = "sum@test.com", Password = "Pass123" };
            _fixture.Context.Users.Add(user);
            await _fixture.Context.SaveChangesAsync();

            var order = new Order
            {
                OrderDate = DateTime.Now,
                TotalAmount = 500.0m,
                UserId = user.UserId
            };

            // Act
            var result = await _orderRepository.AddOrder(order);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(500.0m, result.TotalAmount);
        }

        [Fact]
        public async Task AddOrder_HandlesZeroSum_UnhappyPath()
        {
            // Arrange
            var user = new User { FullName = "ZeroSumUser", Email = "zero@test.com", Password = "Pass123" };
            _fixture.Context.Users.Add(user);
            await _fixture.Context.SaveChangesAsync();

            var order = new Order
            {
                OrderDate = DateTime.Now,
                TotalAmount = 0.0m,
                UserId = user.UserId
            };

            // Act
            var result = await _orderRepository.AddOrder(order);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0.0m, result.TotalAmount);
        }
    }
}
