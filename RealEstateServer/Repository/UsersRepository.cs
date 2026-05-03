using Entities;
using Microsoft.EntityFrameworkCore;
using DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository
{
    public class UsersRepository : IUsersRepository
    {
        private readonly ShopContext _ShopContext;

        public UsersRepository(ShopContext shopContext)
        {
            this._ShopContext = shopContext;
        }

        public async Task<List<User>> GetAllUsers()
        {
            return await _ShopContext.Users.ToListAsync();
        }

        public async Task<User> GetUserById(int id)
        {
            return await _ShopContext.Users.FirstOrDefaultAsync(x => x.UserId == id);
        }

        public async Task<User> RegisterUser(User user)
        {
            await _ShopContext.Users.AddAsync(user);
            await _ShopContext.SaveChangesAsync();
            return user;
        }

        public async Task<User> LoginUser(string email, string password)
        {
            return await _ShopContext.Users.FirstOrDefaultAsync(x =>
                x.Email == email && x.Password == password);
        }

        public async Task<User> UpdateUser(User userToUpdate, int id)
        {
            User existingUser = await _ShopContext.Users.FirstOrDefaultAsync(u => u.UserId == id);

            if (existingUser == null)
                return null;

            if (userToUpdate.FullName != null && userToUpdate.FullName != "")
                existingUser.FullName = userToUpdate.FullName;

            if (userToUpdate.Email != null && userToUpdate.Email != "")
                existingUser.Email = userToUpdate.Email;

            if (userToUpdate.Password != null && userToUpdate.Password != "")
                existingUser.Password = userToUpdate.Password;

            if (userToUpdate.Phone != null && userToUpdate.Phone != "")
                existingUser.Phone = userToUpdate.Phone;

            if (userToUpdate.Address != null && userToUpdate.Address != "")
                existingUser.Address = userToUpdate.Address;

            await _ShopContext.SaveChangesAsync();
            return existingUser;
        }


        public async Task DeleteUser(int id)
        {
            var user = await _ShopContext.Users.FindAsync(id);
            if (user != null)
            {
                _ShopContext.Users.Remove(user);
                await _ShopContext.SaveChangesAsync();
            }
        }
    }
}