using AutoMapper;
using DTOs;
using Entities;
using Microsoft.Extensions.Configuration;
using Repository;

namespace Services
{
    public class AdminService : IAdminService
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IUsersServices _usersServices;
        private readonly IProductRepository _productRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IAdminInquiryRepository _adminInquiryRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AdminService(IUsersRepository usersRepository, IUsersServices usersServices, IProductRepository productRepository, IOrderRepository orderRepository, IAdminInquiryRepository adminInquiryRepository, IEmailService emailService, IConfiguration configuration, IMapper mapper)
        {
            _usersRepository = usersRepository;
            _usersServices = usersServices;
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _adminInquiryRepository = adminInquiryRepository;
            _emailService = emailService;
            _configuration = configuration;
            _mapper = mapper;
        }

        public async Task<List<UserProfileDTO>> GetAllUsers()
        {
            List<User> users = await _usersRepository.GetAllUsers();
            return _mapper.Map<List<User>, List<UserProfileDTO>>(users);
        }

        public async Task<List<ProductDetailsDTO>> GetAllProducts()
        {
            List<Product> products = await _productRepository.GetAllProductsForAdmin();
            return _mapper.Map<List<Product>, List<ProductDetailsDTO>>(products);
        }

        public async Task<List<OrderAdminDTO>> GetAllOrders()
        {
            List<Order> orders = await _orderRepository.GetAllOrders();
            return orders.Select(o => new OrderAdminDTO(
                o.OrderId,
                o.UserId,
                o.User?.FullName ?? "לא ידוע",
                o.OrderDate,
                o.TotalAmount,
                o.Status ?? "לא ידוע"
            )).ToList();
        }

        public async Task<bool> DeleteUser(int id)
        {
            User user = await _usersRepository.GetUserById(id);
            if (user == null)
                return false;
            await _usersServices.DeleteUser(id);
            return true;
        }

        public async Task<bool> DeleteProduct(int id)
        {
            return await _productRepository.DeleteProduct(id);
        }

        public async Task<bool> DeleteOrder(int id)
        {
            Order order = await _orderRepository.GetOrderById(id);
            if (order == null)
                return false;
            await _orderRepository.DeleteOrder(id);
            return true;
        }

        public async Task<AdminStatisticsDTO> GetStatistics()
        {
            List<User> users = await _usersRepository.GetAllUsers();
            List<Product> products = await _productRepository.GetAllProductsForAdmin();
            List<Order> orders = await _orderRepository.GetAllOrders();

            return new AdminStatisticsDTO(users.Count, products.Count, orders.Count);
        }

        public async Task<AdminInquiryDTO> AddAdminInquiry(AdminInquiryCreateDTO createDto)
        {
            AdminInquiry inquiry = new AdminInquiry
            {
                UserId = createDto.UserId,
                Name = createDto.Name,
                Email = createDto.Email,
                Phone = string.IsNullOrEmpty(createDto.Phone) ? "לא צוין" : createDto.Phone,
                Subject = createDto.Subject,
                Message = createDto.Message,
                CreatedAt = DateTime.Now,
                Status = "New"
            };

            AdminInquiry addedInquiry = await _adminInquiryRepository.AddInquiry(inquiry);
            
            // שליחת מייל למנהל
            try
            {
                string recipientEmail = _configuration["EmailSettings:RecipientEmail"] ?? "admin@realestate.com";
                
                string emailBody = $@"
                    <h2>פנייה חדשה למנהל</h2>
                    <p><strong>שם:</strong> {createDto.Name}</p>
                    <p><strong>אימייל:</strong> {createDto.Email}</p>
                    <p><strong>טלפון:</strong> {createDto.Phone}</p>
                    <p><strong>נושא:</strong> {createDto.Subject}</p>
                    <p><strong>הודעה:</strong></p>
                    <p>{createDto.Message}</p>
                ";
                
                await _emailService.SendEmailAsync(recipientEmail, $"פנייה חדשה: {createDto.Subject}", emailBody);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email: {ex.Message}");
            }

            AdminInquiry fullInquiry = await _adminInquiryRepository.GetInquiryById(addedInquiry.InquiryId);
            return new AdminInquiryDTO(
                fullInquiry.InquiryId,
                fullInquiry.UserId,
                fullInquiry.User?.FullName ?? "",
                fullInquiry.Name,
                fullInquiry.Email,
                fullInquiry.Phone,
                fullInquiry.Subject,
                fullInquiry.Message,
                fullInquiry.CreatedAt,
                fullInquiry.Status
            );
        }

        public async Task<List<AdminInquiryDTO>> GetAllAdminInquiries()
        {
            List<AdminInquiry> inquiries = await _adminInquiryRepository.GetAllInquiries();
            return inquiries.Select(i => new AdminInquiryDTO(
                i.InquiryId,
                i.UserId,
                i.User?.FullName ?? "",
                i.Name,
                i.Email,
                i.Phone,
                i.Subject,
                i.Message,
                i.CreatedAt,
                i.Status
            )).ToList();
        }

        public async Task<AdminInquiryDTO> GetAdminInquiryById(int id)
        {
            AdminInquiry inquiry = await _adminInquiryRepository.GetInquiryById(id);
            if (inquiry == null)
                return null;

            return new AdminInquiryDTO(
                inquiry.InquiryId,
                inquiry.UserId,
                inquiry.User?.FullName ?? "",
                inquiry.Name,
                inquiry.Email,
                inquiry.Phone,
                inquiry.Subject,
                inquiry.Message,
                inquiry.CreatedAt,
                inquiry.Status
            );
        }

        public async Task<AdminInquiryDTO> UpdateAdminInquiryStatus(int id, AdminInquiryStatusUpdateDTO dto)
        {
            AdminInquiry updatedInquiry = await _adminInquiryRepository.UpdateInquiryStatus(id, dto.Status);
            if (updatedInquiry == null)
                return null;

            AdminInquiry fullInquiry = await _adminInquiryRepository.GetInquiryById(id);
            return new AdminInquiryDTO(
                fullInquiry.InquiryId,
                fullInquiry.UserId,
                fullInquiry.User?.FullName ?? "",
                fullInquiry.Name,
                fullInquiry.Email,
                fullInquiry.Phone,
                fullInquiry.Subject,
                fullInquiry.Message,
                fullInquiry.CreatedAt,
                fullInquiry.Status
            );
        }

        public async Task DeleteAdminInquiry(int id)
        {
            await _adminInquiryRepository.DeleteInquiry(id);
        }
    }
}
