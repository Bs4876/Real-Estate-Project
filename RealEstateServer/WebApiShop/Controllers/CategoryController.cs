using Entities;
using Microsoft.AspNetCore.Mvc;
using Services;
using DTOs;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebApiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoriesServies _iCategoryServices;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(ICategoriesServies iCategoryServices, ILogger<CategoryController> logger)
        {
            _iCategoryServices = iCategoryServices;
            _logger = logger;
        }

        // GET: api/<CategoryController>
        [HttpGet]
        public async Task<List<CategoryDTO>> GetAllCategories()
        {
            List<CategoryDTO> categories = await _iCategoryServices.GetAllCategories();
            if (categories == null)
            {
                _logger.LogWarning("Categorys were not found");
                return new List<CategoryDTO>();
            }
            _logger.LogInformation("Categorys were found");
            return categories;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDTO>> GetCategoryById(int id)
        {
            CategoryDTO category = await _iCategoryServices.GetCategoryById(id);
            if(category == null)
            {
                _logger.LogWarning("Category with ID {Id} was not found", id);
                return NotFound();
            }
            return category;
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDTO>> AddCategory(CategoryCreateDTO category)
        {
            CategoryDTO newCategory = await _iCategoryServices.AddCategory(category);
            if (newCategory == null)
            {
                _logger.LogWarning("Failed to create category with name {Name}", category.CategoryName);
                return BadRequest();
            }
            _logger.LogInformation("Category {CategoryName} created with ID: {Id}", newCategory.CategoryName, newCategory.CategoryId);
            return CreatedAtAction(nameof(GetCategoryById), new { id = newCategory.CategoryId }, newCategory);
            //return await _iOrderService.Invite(order);
        }

        // DELETE: api/<CategoryController>/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var success = await _iCategoryServices.DeleteCategory(id);
            if (!success)
            {
                _logger.LogWarning("Attempted to delete non-existent category {id}", id);
                return NotFound();
            }
            _logger.LogInformation("Category {id} was deleted from the system", id);
            return NoContent();
        }

        // PUT: api/<CategoryController>/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDTO>> UpdateCategory(int id, CategoryUpdateDTO categoryUpdate)
        {
            CategoryDTO updatedCategory = await _iCategoryServices.UpdateCategory(id, categoryUpdate);
            if (updatedCategory == null)
            {
                _logger.LogWarning("Update failed: Category {id} not found", id);
                return NotFound();
            }
            _logger.LogInformation("Category {id} updated successfully", id);
            return Ok(updatedCategory);
        }


    }
}
