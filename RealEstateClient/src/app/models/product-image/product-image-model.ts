export class ProductImageModel {
  imageId: number = 0;
  productId: number = 0;
  additionalImageUrl: string = '';
}

export class ProductImageUrlDTOModel {
  additionalImageUrl: string = '';
}

export class ProductImageCreateDTOModel {
  productId: number = 0;
  additionalImageUrl: string = '';
}
