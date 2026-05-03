using DTOs;
using Entities;

namespace Repository
{
    public interface IUsersRepository
    {
        Task DeleteUser(int id);
        Task<List<User>> GetAllUsers();
        Task<User> GetUserById(int id);
        Task<User> LoginUser(string email, string password);
        Task<User> RegisterUser(User user);
        Task<User> UpdateUser(User userToUpdate, int id);
    }
}