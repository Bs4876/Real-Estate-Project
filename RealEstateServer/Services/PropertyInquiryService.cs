using AutoMapper;
using DTOs;
using Entities;
using Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class PropertyInquiryService : IPropertyInquiryService
    {
        private readonly IPropertyInquiryRepository _repository;
        private readonly IMapper _mapper;

        public PropertyInquiryService(IPropertyInquiryRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PropertyInquiryDTO> AddInquiry(PropertyInquiryCreateDTO createDto)
        {
            PropertyInquiry inquiry = new PropertyInquiry
            {
                ProductId = createDto.ProductId,
                UserId = createDto.UserId,
                OwnerId = createDto.OwnerId,
                Name = createDto.Name,
                Phone = createDto.Phone,
                Email = createDto.Email,
                Message = createDto.Message,
                CreatedAt = DateTime.Now,
                Status = "New"
            };

            PropertyInquiry addedInquiry = await _repository.AddInquiry(inquiry);
            PropertyInquiry fullInquiry = await _repository.GetInquiryById(addedInquiry.InquiryId);
            
            return new PropertyInquiryDTO(
                fullInquiry.InquiryId,
                fullInquiry.ProductId,
                fullInquiry.Product?.Title ?? "",
                fullInquiry.UserId,
                fullInquiry.User?.FullName ?? "",
                fullInquiry.OwnerId,
                fullInquiry.Owner?.FullName ?? "",
                fullInquiry.Name,
                fullInquiry.Phone,
                fullInquiry.Email,
                fullInquiry.Message,
                fullInquiry.CreatedAt,
                fullInquiry.Status
            );
        }

        public async Task<PropertyInquiryDTO> GetInquiryById(int id)
        {
            PropertyInquiry inquiry = await _repository.GetInquiryById(id);
            if (inquiry == null)
                return null;

            return new PropertyInquiryDTO(
                inquiry.InquiryId,
                inquiry.ProductId,
                inquiry.Product?.Title ?? "",
                inquiry.UserId,
                inquiry.User?.FullName ?? "",
                inquiry.OwnerId,
                inquiry.Owner?.FullName ?? "",
                inquiry.Name,
                inquiry.Phone,
                inquiry.Email,
                inquiry.Message,
                inquiry.CreatedAt,
                inquiry.Status
            );
        }

        public async Task<List<PropertyInquiryDTO>> GetInquiriesByOwnerId(int ownerId)
        {
            List<PropertyInquiry> inquiries = await _repository.GetInquiriesByOwnerId(ownerId);
            return inquiries.Select(i => new PropertyInquiryDTO(
                i.InquiryId,
                i.ProductId,
                i.Product?.Title ?? "",
                i.UserId,
                i.User?.FullName ?? "",
                i.OwnerId,
                i.Owner?.FullName ?? "",
                i.Name,
                i.Phone,
                i.Email,
                i.Message,
                i.CreatedAt,
                i.Status
            )).ToList();
        }

        public async Task<List<PropertyInquiryDTO>> GetInquiriesByUserId(int userId)
        {
            List<PropertyInquiry> inquiries = await _repository.GetInquiriesByUserId(userId);
            return inquiries.Select(i => new PropertyInquiryDTO(
                i.InquiryId,
                i.ProductId,
                i.Product?.Title ?? "",
                i.UserId,
                i.User?.FullName ?? "",
                i.OwnerId,
                i.Owner?.FullName ?? "",
                i.Name,
                i.Phone,
                i.Email,
                i.Message,
                i.CreatedAt,
                i.Status
            )).ToList();
        }

        public async Task<List<PropertyInquiryDTO>> GetAllInquiries()
        {
            List<PropertyInquiry> inquiries = await _repository.GetAllInquiries();
            return inquiries.Select(i => new PropertyInquiryDTO(
                i.InquiryId,
                i.ProductId,
                i.Product?.Title ?? "",
                i.UserId,
                i.User?.FullName ?? "",
                i.OwnerId,
                i.Owner?.FullName ?? "",
                i.Name,
                i.Phone,
                i.Email,
                i.Message,
                i.CreatedAt,
                i.Status
            )).ToList();
        }

        public async Task<PropertyInquiryDTO> UpdateInquiryStatus(int id, PropertyInquiryStatusUpdateDTO dto)
        {
            PropertyInquiry updatedInquiry = await _repository.UpdateInquiryStatus(id, dto.Status);
            if (updatedInquiry == null)
                return null;

            PropertyInquiry fullInquiry = await _repository.GetInquiryById(id);
            return new PropertyInquiryDTO(
                fullInquiry.InquiryId,
                fullInquiry.ProductId,
                fullInquiry.Product?.Title ?? "",
                fullInquiry.UserId,
                fullInquiry.User?.FullName ?? "",
                fullInquiry.OwnerId,
                fullInquiry.Owner?.FullName ?? "",
                fullInquiry.Name,
                fullInquiry.Phone,
                fullInquiry.Email,
                fullInquiry.Message,
                fullInquiry.CreatedAt,
                fullInquiry.Status
            );
        }

        public async Task DeleteInquiry(int id)
        {
            await _repository.DeleteInquiry(id);
        }
    }
}
