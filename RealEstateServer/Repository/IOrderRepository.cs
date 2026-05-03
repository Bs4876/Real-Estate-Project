using Entities;

namespace Repository
{
    public interface IOrderRepository
    {
        Task<Order> AddOrder(Order order);
        Task<List<Order>> GetAllOrders();
        Task<Order> GetOrderById(int ind);
        Task<List<OrderItem>> GetOrderItemsByProductId(int productId);
        Task<List<Order>> GetOrdersByUserId(int ind);
        Task<List<(DateTime Start, DateTime End)>> GetProductOccupiedRanges(int productId, int month, int year);
        Task<bool> OrderDelivered(int orderId);
        Task<Order> UpdateOrderStatus(int orderId, string status);
        Task DeleteOrder(int orderId);
    }
}