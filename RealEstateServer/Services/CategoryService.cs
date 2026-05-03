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
    public class CategoriesServies : ICategoriesServies
    {
        private readonly ICategoryRepository _iCategoryRepository;
        private readonly IMapper _mapper;

        public CategoriesServies(ICategoryRepository iCategoryRepository, IMapper mapper)
        {
            this._iCategoryRepository = iCategoryRepository;
            this._mapper = mapper;
        }

        public async Task<List<CategoryDTO>> GetAllCategories()
        {
            List<Category> categories = await _iCategoryRepository.GetAllCategories();
            return _mapper.Map<List<Category>, List<CategoryDTO>>(categories);
        }

        public async Task<CategoryDTO> GetCategoryById(int id)
        {
            Category category = await _iCategoryRepository.GetCategoryById(id);
            return _mapper.Map<Category, CategoryDTO>(category);

        }

        public async Task<CategoryDTO> AddCategory(CategoryCreateDTO categoryCreate)
        {
            Category category = _mapper.Map<CategoryCreateDTO, Category>(categoryCreate);
            category = await _iCategoryRepository.AddCategory(category);
            return _mapper.Map<Category, CategoryDTO>(category);
        }

        public async Task<CategoryDTO> UpdateCategory(int id, CategoryUpdateDTO categoryUpdate)
        {
            Category existingCategory = await _iCategoryRepository.GetCategoryById(id);

            if (existingCategory == null)
                return null;

            _mapper.Map(categoryUpdate, existingCategory);
            Category category = await _iCategoryRepository.UpdateCategory(existingCategory);

            return _mapper.Map<Category, CategoryDTO>(category);
        }

        public async Task<bool> DeleteCategory(int id)
        {
            Category category = await _iCategoryRepository.GetCategoryById(id);

            if (category == null) return false;
            await _iCategoryRepository.DeleteCategory(category);
            return true;
        }


    }
}
