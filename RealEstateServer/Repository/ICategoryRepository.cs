using Entities;

namespace Repository
{
    public interface ICategoryRepository
    {
        Task<Category> AddCategory(Category category);
        Task DeleteCategory(Category category);
        Task<List<Category>> GetAllCategories();
        Task<Category> GetCategoryById(int id);
        Task<Category> UpdateCategory(Category category);
    }
}