using Entities;
using Microsoft.EntityFrameworkCore;
using Repository;
using System.Threading.Tasks;
using Xunit;

namespace TestProject
{
    public class UserIntegrationTest : IClassFixture<DatabaseFixture>
    {
        private readonly UsersRepository _usersRepository;
        private readonly DatabaseFixture _fixture;

        public UserIntegrationTest(DatabaseFixture fixture)
        {
            _fixture = fixture;
            _usersRepository = new UsersRepository(_fixture.Context);
        }

        [Fact]
        public async Task RegisterUser_SavesUserToDatabase()
        {
            // Arrange
            var user = new User
            {
                FullName = "Jane Doe",
                Email = "jane@test.com",
                Password = "SecurePassword",
                Phone = "123456789"
            };

            // Act
            var result = await _usersRepository.RegisterUser(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Email, result.Email);

            var savedUser = await _fixture.Context.Users.FirstOrDefaultAsync(x => x.UserId == result.UserId);
            Assert.NotNull(savedUser);
            Assert.Equal(user.Email, savedUser.Email);
        }

        [Fact]
        public async Task GetUserById_ReturnsUserWhenExists()
        {
            // Arrange
            var user = new User
            {
                FullName = "Existing User",
                Email = "existing@test.com",
                Password = "Password123",
                Phone = "987654321"
            };

            await _usersRepository.RegisterUser(user);

            // Act
            var fetchedUser = await _usersRepository.GetUserById(user.UserId);

            // Assert
            Assert.NotNull(fetchedUser);
            Assert.Equal(user.UserId, fetchedUser.UserId);
            Assert.Equal(user.Email, fetchedUser.Email);
        }

        [Fact]
        public async Task LoginUser_ReturnsUserWhenValidCredentials()
        {
            // Arrange
            var user = new User
            {
                FullName = "Login User",
                Email = "login@test.com",
                Password = "UserPassword",
                Phone = "555555555"
            };

            await _usersRepository.RegisterUser(user);

            // Act
            var loggedUser = await _usersRepository.LoginUser(user.Email, user.Password);

            // Assert
            Assert.NotNull(loggedUser);
            Assert.Equal(user.Email, loggedUser.Email);
        }

        [Fact]
        public async Task UpdateUser_UpdatesUserInDatabase()
        {
            // Arrange
            var user = new User { FullName = "UserToUpdate", Email = "update@test.com", Password = "OldPassword", Phone = "111111111" };
            var registeredUser = await _usersRepository.RegisterUser(user);

            registeredUser.FullName = "UpdatedName";
            registeredUser.Phone = "222222222";

            // Act
            var updatedUser = await _usersRepository.UpdateUser(registeredUser, registeredUser.UserId);

            // Assert
            Assert.NotNull(updatedUser);
            Assert.Equal("UpdatedName", updatedUser.FullName);
            Assert.Equal("222222222", updatedUser.Phone);

            var fetchedUser = await _usersRepository.GetUserById(registeredUser.UserId);
            Assert.Equal("UpdatedName", fetchedUser.FullName);
            Assert.Equal("222222222", fetchedUser.Phone);
        }
    }
}
