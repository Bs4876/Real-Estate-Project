using Entities;

namespace Repository
{
    public interface IAdminInquiryRepository
    {
        Task<AdminInquiry> AddInquiry(AdminInquiry inquiry);
        Task<AdminInquiry> GetInquiryById(int id);
        Task<List<AdminInquiry>> GetAllInquiries();
        Task<AdminInquiry> UpdateInquiryStatus(int id, string status);
        Task DeleteInquiry(int id);
    }
}
