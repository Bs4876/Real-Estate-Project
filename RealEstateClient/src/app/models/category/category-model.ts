export class CategoryModel {
  categoryId: number = 0;
  categoryName: string = '';
  description: string = '';
}

// תואם ל-CategoryDTO.cs - משמש להצגת קטגוריה (למשל ברשימות או דרופ-דאון)
export class CategoryDTOModel {
    categoryId: number = 0;
    categoryName: string = '';
    description: string = '';
}

// תואם ל-CategoryCreateDTO.cs - משמש ליצירת קטגוריה חדשה ב-POST
export class CategoryCreateDTOModel {
    categoryName: string = '';
    description: string = '';
}

// תואם ל-CategoryUpdateDTO.cs - משמש לעדכון קטגוריה קיימת ב-PUT
export class CategoryUpdateDTOModel {
    categoryName: string = '';
    description: string = '';
}