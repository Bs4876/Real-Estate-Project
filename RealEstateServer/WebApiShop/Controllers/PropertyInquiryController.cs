using DTOs;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebApiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyInquiryController : ControllerBase
    {
        private readonly IPropertyInquiryService _service;
        private readonly ILogger<PropertyInquiryController> _logger;

        public PropertyInquiryController(IPropertyInquiryService service, ILogger<PropertyInquiryController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyInquiryDTO>> GetInquiryById(int id)
        {
            _logger.LogInformation("Getting inquiry with ID: {Id}", id);
            PropertyInquiryDTO inquiry = await _service.GetInquiryById(id);
            if (inquiry == null)
            {
                _logger.LogWarning("Inquiry with ID {Id} was not found", id);
                return NotFound();
            }
            return Ok(inquiry);
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<List<PropertyInquiryDTO>>> GetInquiriesByOwnerId(int ownerId)
        {
            _logger.LogInformation("Getting inquiries for owner ID: {OwnerId}", ownerId);
            List<PropertyInquiryDTO> inquiries = await _service.GetInquiriesByOwnerId(ownerId);
            return Ok(inquiries);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<PropertyInquiryDTO>>> GetInquiriesByUserId(int userId)
        {
            _logger.LogInformation("Getting inquiries for user ID: {UserId}", userId);
            List<PropertyInquiryDTO> inquiries = await _service.GetInquiriesByUserId(userId);
            return Ok(inquiries);
        }

        [HttpGet]
        public async Task<ActionResult<List<PropertyInquiryDTO>>> GetAllInquiries()
        {
            _logger.LogInformation("Getting all inquiries");
            List<PropertyInquiryDTO> inquiries = await _service.GetAllInquiries();
            return Ok(inquiries);
        }

        [HttpPost]
        public async Task<ActionResult<PropertyInquiryDTO>> AddInquiry(PropertyInquiryCreateDTO createDto)
        {
            try
            {
                _logger.LogInformation("Adding new inquiry for product ID: {ProductId}", createDto.ProductId);
                PropertyInquiryDTO inquiry = await _service.AddInquiry(createDto);
                _logger.LogInformation("Inquiry added successfully with ID: {Id}", inquiry.InquiryId);
                return CreatedAtAction(nameof(GetInquiryById), new { id = inquiry.InquiryId }, inquiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding inquiry");
                return BadRequest(new { Message = "שגיאה ביצירת הפנייה", Details = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<PropertyInquiryDTO>> UpdateInquiryStatus(int id, PropertyInquiryStatusUpdateDTO statusDto)
        {
            _logger.LogInformation("Updating status for inquiry ID: {Id}", id);
            PropertyInquiryDTO updatedInquiry = await _service.UpdateInquiryStatus(id, statusDto);
            if (updatedInquiry == null)
            {
                _logger.LogWarning("Update failed: Inquiry with ID {Id} not found", id);
                return NotFound();
            }
            _logger.LogInformation("Inquiry with ID {Id} status updated successfully", id);
            return Ok(updatedInquiry);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteInquiry(int id)
        {
            try
            {
                _logger.LogInformation("Deleting inquiry with ID: {Id}", id);
                await _service.DeleteInquiry(id);
                _logger.LogInformation("Inquiry with ID {Id} deleted successfully", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting inquiry with ID: {Id}", id);
                return BadRequest(new { Message = "שגיאה במחיקת הפנייה", Details = ex.Message });
            }
        }
    }
}
