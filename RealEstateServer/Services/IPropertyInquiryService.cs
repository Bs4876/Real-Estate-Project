using DTOs;

namespace Services
{
    public interface IPropertyInquiryService
    {
        Task<PropertyInquiryDTO> AddInquiry(PropertyInquiryCreateDTO createDto);
        Task<PropertyInquiryDTO> GetInquiryById(int id);
        Task<List<PropertyInquiryDTO>> GetInquiriesByOwnerId(int ownerId);
        Task<List<PropertyInquiryDTO>> GetInquiriesByUserId(int userId);
        Task<List<PropertyInquiryDTO>> GetAllInquiries();
        Task<PropertyInquiryDTO> UpdateInquiryStatus(int id, PropertyInquiryStatusUpdateDTO dto);
        Task DeleteInquiry(int id);
    }
}
