using Entities;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebApiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<Rating>>> GetAllRatings()
        {
            List<Rating> ratings = await _ratingService.GetAllRatings();
            return Ok(ratings);
        }
    }
}
