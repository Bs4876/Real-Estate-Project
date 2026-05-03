using DTOs;
using AutoMapper;
using DTOs;
using Entities;
using Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public interface ICategoriesServies
    {
        Task<CategoryDTO> AddCategory(CategoryCreateDTO categoryCreate);
        Task<bool> DeleteCategory(int id);
        Task<List<CategoryDTO>> GetAllCategories();
        Task<CategoryDTO> GetCategoryById(int id);
        Task<CategoryDTO> UpdateCategory(int id, CategoryUpdateDTO categoryUpdate);
    }
}