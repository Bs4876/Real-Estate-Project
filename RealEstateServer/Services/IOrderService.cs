using DTOs;

namespace Services
{
    public interface IOrderService
    {
        Task<OrderDTO> AddOrder(OrderCreateDTO createOrder);
        Task<List<OrderHistoryAdminDTO>> GetAllOrders();
        Task<OccupiedDatesResponseDTO> GetOccupiedDatesForProduct(int productId, int month, int year);
        Task<OrderDTO> GetOrderById(int id);
        Task<List<OrderHistoryDTO>> GetOrdersByUserId(int userId);
        Task<bool> OrderDelivered(int orderId);
        Task<OrderDTO> UpdateOrderStatus(int orderId, OrderStatusUpdateDTO dto);
    }
}