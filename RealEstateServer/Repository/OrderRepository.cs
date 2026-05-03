using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ShopContext _ShopContext;
        public OrderRepository(ShopContext ShopContext)
        {
            this._ShopContext = ShopContext;
        }

        public async Task<Order> GetOrderById(int ind)
        {
            return await _ShopContext.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(x => x.OrderId == ind);
        }
        public async Task<List<Order>> GetOrdersByUserId(int ind)
        {
            return await _ShopContext.Orders
                .Where(o => o.UserId == ind)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();
        }

        public async Task<List<Order>> GetAllOrders()
        {
            return await _ShopContext.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();
        }

        public async Task<Order> AddOrder(Order order)
        {
            await _ShopContext.Orders.AddAsync(order);
            await _ShopContext.SaveChangesAsync();
            return order;
        }


        public async Task<Order> UpdateOrderStatus(int orderId, string status)
        {
            Order order = await _ShopContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
                return null;

            order.Status = status;
            await _ShopContext.SaveChangesAsync();
            return order;
        }

        public async Task<bool> OrderDelivered(int orderId)
        {
            Order order = await _ShopContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
                return false;

            order.Status = "delivered";
            await _ShopContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<OrderItem>> GetOrderItemsByProductId(int productId)
        {
            return await _ShopContext.OrderItems
                .Where(oi => oi.ProductId == productId)
                .ToListAsync();
        }

        public async Task<List<(DateTime Start, DateTime End)>> GetProductOccupiedRanges(int productId, int month, int year)
        {
            var firstDayOfMonth = new DateTime(year, month, 1);
            var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

            return await _ShopContext.OrderItems
                .Where(oi => oi.ProductId == productId &&
                             oi.StartDate <= lastDayOfMonth &&
                             oi.EndDate >= firstDayOfMonth)
                .Select(oi => new { oi.StartDate, oi.EndDate })
                .ToListAsync()
                .ContinueWith(t => t.Result.Select(x => (x.StartDate.Value, x.EndDate.Value)).ToList());
        }

        public async Task DeleteOrder(int orderId)
        {
            Order order = await _ShopContext.Orders.FindAsync(orderId);
            if (order != null)
            {
                _ShopContext.Orders.Remove(order);
                await _ShopContext.SaveChangesAsync();
            }
        }
    }
}
