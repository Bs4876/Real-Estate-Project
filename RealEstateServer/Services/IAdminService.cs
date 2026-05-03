using DTOs;

namespace Services
{
    public interface IAdminService
    {
        Task<List<UserProfileDTO>> GetAllUsers();
        Task<List<ProductDetailsDTO>> GetAllProducts();
        Task<List<OrderAdminDTO>> GetAllOrders();
        Task<bool> DeleteUser(int id);
        Task<bool> DeleteProduct(int id);
        Task<bool> DeleteOrder(int id);
        Task<AdminStatisticsDTO> GetStatistics();
        Task<AdminInquiryDTO> AddAdminInquiry(AdminInquiryCreateDTO createDto);
        Task<List<AdminInquiryDTO>> GetAllAdminInquiries();
        Task<AdminInquiryDTO> GetAdminInquiryById(int id);
        Task<AdminInquiryDTO> UpdateAdminInquiryStatus(int id, AdminInquiryStatusUpdateDTO dto);
        Task DeleteAdminInquiry(int id);
    }
}
