using AutoMapper;
using DTOs;
using Entities;
using Microsoft.AspNetCore.Http;
using Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class ProductImageService : IProductImageService
    {
        private readonly IProductImageRepository _iProductImageRepository;
        private readonly IMapper _mapper;
        public ProductImageService(IProductImageRepository iProductImageRepository, IMapper mapper)
        {
            this._iProductImageRepository = iProductImageRepository;
            this._mapper = mapper;
        }

        public async Task<ProductImageDTO> getProductImageById(int id)
        {
            ProductImage productImage = await _iProductImageRepository.getProductImageById(id);
            ProductImageDTO imageDTO = _mapper.Map<ProductImage, ProductImageDTO>(productImage);
            return imageDTO;
        }

        public async Task<List<ProductImageDTO>> GetProductImagesByProductId(int productId)
        {
            List<ProductImage> images = await _iProductImageRepository.GetProductImagesByProductId(productId);
            return _mapper.Map<List<ProductImage>, List<ProductImageDTO>>(images);
        }

        public async Task<ProductImageDTO> AddProductImage(ProductImageCreateDTO createImage)
        {
            ProductImage image = _mapper.Map<ProductImageCreateDTO, ProductImage>(createImage);
            image = await _iProductImageRepository.AddProductImage(image);
            return _mapper.Map<ProductImage, ProductImageDTO>(image);
        }

        public async Task<ProductImageDTO> UpdateProductImage(int imageId, ProductImageUpdateDTO updateImage)
        {
            ProductImage image1 = _mapper.Map<ProductImageUpdateDTO, ProductImage>(updateImage);
            ProductImage image = await _iProductImageRepository.UpdateProductImage(imageId, image1);
            return _mapper.Map<ProductImage, ProductImageDTO>(image);
        }

        public async Task<bool> DeleteImage(int id)
        {
            ProductImage image = await _iProductImageRepository.getProductImageById(id);

            if (image == null) return false;
            await _iProductImageRepository.DeleteImage(image);
            return true;
        }

        public async Task<string> UploadImage(IFormFile file)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return $"/images/{uniqueFileName}";
        }
    }
}
