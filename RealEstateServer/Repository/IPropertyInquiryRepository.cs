using Entities;

namespace Repository
{
    public interface IPropertyInquiryRepository
    {
        Task<PropertyInquiry> AddInquiry(PropertyInquiry inquiry);
        Task<PropertyInquiry> GetInquiryById(int id);
        Task<List<PropertyInquiry>> GetInquiriesByOwnerId(int ownerId);
        Task<List<PropertyInquiry>> GetInquiriesByUserId(int userId);
        Task<List<PropertyInquiry>> GetAllInquiries();
        Task<PropertyInquiry> UpdateInquiryStatus(int id, string status);
        Task DeleteInquiry(int id);
    }
}
