using DTOs;

namespace Services
{
    public interface IUsersServices
    {
        Task DeleteUser(int id);
        Task<List<UserProfileDTO>> GetAllUsers();
        Task<UserProfileDTO> GetUserById(int id);
        Task<UserProfileDTO> LoginUser(UserLoginDTO userToLog);
        Task<UserProfileDTO> RegisterUser(UserRegisterDTO userToRegister);
        Task<UserProfileDTO> UpdateUser(UserUpdateDTO userToUpdate, int id);
    }
}