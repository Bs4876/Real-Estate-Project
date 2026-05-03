using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class PropertyInquiryRepository : IPropertyInquiryRepository
    {
        private readonly ShopContext _shopContext;

        public PropertyInquiryRepository(ShopContext shopContext)
        {
            _shopContext = shopContext;
        }

        public async Task<PropertyInquiry> AddInquiry(PropertyInquiry inquiry)
        {
            await _shopContext.PropertyInquiries.AddAsync(inquiry);
            await _shopContext.SaveChangesAsync();
            return inquiry;
        }

        public async Task<PropertyInquiry> GetInquiryById(int id)
        {
            return await _shopContext.PropertyInquiries
                .Include(i => i.Product)
                .Include(i => i.User)
                .Include(i => i.Owner)
                .FirstOrDefaultAsync(i => i.InquiryId == id);
        }

        public async Task<List<PropertyInquiry>> GetInquiriesByOwnerId(int ownerId)
        {
            return await _shopContext.PropertyInquiries
                .Where(i => i.OwnerId == ownerId)
                .Include(i => i.Product)
                .Include(i => i.User)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<PropertyInquiry>> GetInquiriesByUserId(int userId)
        {
            return await _shopContext.PropertyInquiries
                .Where(i => i.UserId == userId)
                .Include(i => i.Product)
                .Include(i => i.Owner)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<PropertyInquiry>> GetAllInquiries()
        {
            return await _shopContext.PropertyInquiries
                .Include(i => i.Product)
                .Include(i => i.User)
                .Include(i => i.Owner)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<PropertyInquiry> UpdateInquiryStatus(int id, string status)
        {
            PropertyInquiry inquiry = await _shopContext.PropertyInquiries.FirstOrDefaultAsync(i => i.InquiryId == id);
            if (inquiry == null)
                return null;

            inquiry.Status = status;
            await _shopContext.SaveChangesAsync();
            return inquiry;
        }

        public async Task DeleteInquiry(int id)
        {
            PropertyInquiry inquiry = await _shopContext.PropertyInquiries.FindAsync(id);
            if (inquiry != null)
            {
                _shopContext.PropertyInquiries.Remove(inquiry);
                await _shopContext.SaveChangesAsync();
            }
        }
    }
}
