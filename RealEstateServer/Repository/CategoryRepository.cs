using Entities;
using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ShopContext _ShopContext;

        public CategoryRepository(ShopContext shopContext)
        {
            this._ShopContext = shopContext;
        }

        public async Task<List<Category>> GetAllCategories()
        {
            return await _ShopContext.Categories.ToListAsync();
        }

        public async Task<Category> GetCategoryById(int id)
        {
            return await _ShopContext.Categories.FirstOrDefaultAsync(c => c.CategoryId == id);
        }

        public async Task<Category> AddCategory(Category category)
        {
            await _ShopContext.Categories.AddAsync(category);
            await _ShopContext.SaveChangesAsync();
            return category;
        }

        public async Task<Category> UpdateCategory(Category category)
        {
            _ShopContext.Categories.Update(category);
            await _ShopContext.SaveChangesAsync();
            return category;
        }

        public async Task DeleteCategory(Category category)
        {
            _ShopContext.Categories.Remove(category);
            await _ShopContext.SaveChangesAsync();
        }
    }
}
