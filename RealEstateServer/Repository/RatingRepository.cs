using Entities;
using Repository;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Repositories
{
    public class RatingRepository : IRatingRepository
    {
        private readonly ShopContext _apiDbContext;

        public RatingRepository(ShopContext apiDbContext)
        {
            _apiDbContext = apiDbContext;
        }

        public async Task<Rating> AddRating(Rating newRating)
        {
            await _apiDbContext.Ratings.AddAsync(newRating);
            await _apiDbContext.SaveChangesAsync();
            return newRating;
        }

        public async Task<List<Rating>> GetAllRatings()
        {
            return await _apiDbContext.Ratings.ToListAsync();
        }
    }
}
