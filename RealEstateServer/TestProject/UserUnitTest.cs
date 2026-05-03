using Entities;
using Moq;
using Repository;
using Services;
using DTOs;
using AutoMapper;
using System.Threading.Tasks;
using System.Collections.Generic;
using Xunit;

namespace TestProject
{
    public class UserUnitTest
    {
        private readonly Mock<IUsersRepository> _mockRepository;
        private readonly Mock<IPasswordService> _mockPasswordService;
        private readonly Mock<IProductRepository> _mockProductRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly UsersServices _usersService;

        public UserUnitTest()
        {
            _mockRepository = new Mock<IUsersRepository>();
            _mockPasswordService = new Mock<IPasswordService>();
            _mockProductRepository = new Mock<IProductRepository>();
            _mockMapper = new Mock<IMapper>();

            _usersService = new UsersServices(
                _mockRepository.Object,
                _mockPasswordService.Object,
                _mockProductRepository.Object,
                _mockMapper.Object
            );
        }

        [Fact]
        public async Task GetUserById_ReturnsDto_WhenUserExists()
        {
            var user = new User { UserId = 1, FullName = "Test" };
            var userDto = new UserProfileDTO(1, "Test", "test@test.com", "123456789", false);

            _mockRepository.Setup(repo => repo.GetUserById(1)).ReturnsAsync(user);
            _mockMapper.Setup(m => m.Map<User, UserProfileDTO>(user)).Returns(userDto);

            var result = await _usersService.GetUserById(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.UserId);
        }

        [Fact]
        public async Task RegisterUser_ReturnsNull_WhenPasswordIsWeak()
        {
            var userRegisterDto = new UserRegisterDTO("Test", "test@test.com", "123456789", "Test Address", "123");

            _mockPasswordService.Setup(ps => ps.checkStrengthPassword(It.IsAny<string>()))
                .Returns(new CheckPassword { strength = 1, password = "Weak" });

            await Assert.ThrowsAsync<Exception>(async () => await _usersService.RegisterUser(userRegisterDto));
        }

        [Fact]
        public async Task LoginUser_ReturnsNull_WhenCredentialsInvalid()
        {
            var loginDto = new UserLoginDTO("wrong@test.com", "123");
            _mockRepository.Setup(repo => repo.LoginUser(loginDto.Email, loginDto.Password)).ReturnsAsync((User)null);

            var result = await _usersService.LoginUser(loginDto);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetAllUsers_ReturnsListOfDtos()
        {
            var users = new List<User> { new User { UserId = 1 }, new User { UserId = 2 } };
            var userDtos = new List<UserProfileDTO> { 
                new UserProfileDTO(1, "User1", "user1@test.com", "123", false), 
                new UserProfileDTO(2, "User2", "user2@test.com", "456", false) 
            };

            _mockRepository.Setup(repo => repo.GetAllUsers()).ReturnsAsync(users);
            _mockMapper.Setup(m => m.Map<IEnumerable<User>, IEnumerable<UserProfileDTO>>(users)).Returns(userDtos);

            var result = await _usersService.GetAllUsers();

            Assert.NotNull(result);
            Assert.Equal(2, ((List<UserProfileDTO>)result).Count);
        }

        [Fact]
        public async Task DeleteUser_CallsRepository()
        {
            _mockProductRepository.Setup(repo => repo.GetProductsByOwnerId(1)).ReturnsAsync(new List<Product>());
            
            await _usersService.DeleteUser(1);

            _mockRepository.Verify(repo => repo.DeleteUser(1), Times.Once);
        }
    }
}
