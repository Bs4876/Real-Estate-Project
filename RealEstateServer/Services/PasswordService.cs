using Entities;
using Repository;

namespace Services
{
    public class PasswordService : IPasswordService
    {
        public CheckPassword checkStrengthPassword(string password)
        {
            var result = Zxcvbn.Core.EvaluatePassword(password);
            int strength = result.Score;
            CheckPassword pass = new CheckPassword();
            pass.password = password;
            pass.strength = strength;
            return pass;
        }
    }
}