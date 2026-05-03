using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class AdminInquiryRepository : IAdminInquiryRepository
    {
        private readonly ShopContext _shopContext;

        public AdminInquiryRepository(ShopContext shopContext)
        {
            _shopContext = shopContext;
        }

        public async Task<AdminInquiry> AddInquiry(AdminInquiry inquiry)
        {
            await _shopContext.AdminInquiries.AddAsync(inquiry);
            await _shopContext.SaveChangesAsync();
            return inquiry;
        }

        public async Task<AdminInquiry> GetInquiryById(int id)
        {
            return await _shopContext.AdminInquiries
                .Include(i => i.User)
                .FirstOrDefaultAsync(i => i.InquiryId == id);
        }

        public async Task<List<AdminInquiry>> GetAllInquiries()
        {
            return await _shopContext.AdminInquiries
                .Include(i => i.User)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<AdminInquiry> UpdateInquiryStatus(int id, string status)
        {
            AdminInquiry inquiry = await _shopContext.AdminInquiries.FirstOrDefaultAsync(i => i.InquiryId == id);
            if (inquiry == null)
                return null;

            inquiry.Status = status;
            await _shopContext.SaveChangesAsync();
            return inquiry;
        }

        public async Task DeleteInquiry(int id)
        {
            AdminInquiry inquiry = await _shopContext.AdminInquiries.FindAsync(id);
            if (inquiry != null)
            {
                _shopContext.AdminInquiries.Remove(inquiry);
                await _shopContext.SaveChangesAsync();
            }
        }
    }
}
