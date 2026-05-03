using Entities;

namespace Services
{
    public interface IPasswordService
    {
        CheckPassword checkStrengthPassword(string password);
    }
}