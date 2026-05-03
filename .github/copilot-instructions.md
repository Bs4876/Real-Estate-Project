# Real Estate Platform - הנחיות כלליות לקופיילוט

## מה המערכת עושה

פלטפורמת נדל"ן מלאה המאפשרת:
- **לבעלי נכסים**: פרסום נכסים למכירה, השכרה או נופש עם ניהול תמונות, מחירים ופרטים
- **ללקוחות**: חיפוש וסינון נכסים, הוספה למועדפים, הזמנות ותשלומים, דירוגים ופניות
- **למנהלים**: ניהול משתמשים, נכסים, הזמנות, סטטיסטיקות ופניות דרך דשבורד ייעודי
- **תכונות נוספות**: צ'אטבוט, מערכת עגלת קניות, התראות במייל, ניהול תאריכים תפוסים לנופש

## טכנולוגיות

### Backend
- **Framework**: ASP.NET Core Web API (.NET 8.0)
- **Database**: SQL Server
- **ORM**: Entity Framework Core
- **Logging**: NLog עם תמיכה במייל
- **Email**: MailKit (Gmail SMTP)
- **Mapping**: AutoMapper
- **API Documentation**: Swagger UI
- **Architecture**: Layered Architecture (Controllers → Services → Repository → Entities)

### Frontend
- **Framework**: Angular 21.1.4
- **Language**: TypeScript 5.9
- **UI Library**: PrimeNG 21.1.1 + PrimeFlex
- **State Management**: RxJS 7.8
- **Testing**: Vitest 4.0.8, Jasmine
- **Styling**: SCSS עם ערכת עיצוב גרדיאנט סגול
- **Package Manager**: npm 11.8.0

## ארכיטקטורה

### Backend - Layered Architecture
```
Controllers (API Layer)
    ↓
Services (Business Logic)
    ↓
Repository (Data Access)
    ↓
Entities (Domain Models)
    ↓
Database (SQL Server)
```

**עקרונות:**
- הפרדה ברורה בין שכבות
- Dependency Injection לכל השירותים
- Repository Pattern לגישה לנתונים
- DTO Pattern להעברת נתונים בין שכבות
- Middleware מותאם אישית לטיפול בשגיאות והרשאות

### Frontend - Component-Based Architecture
```
App Component (Root)
    ↓
Feature Components (Pages)
    ↓
Services (API Communication)
    ↓
Models (TypeScript Interfaces)
```

**עקרונות:**
- Component-based architecture
- Reactive programming עם RxJS
- Lazy loading למודולים
- Route guards להגנה על נתיבים
- Shared services למצב גלובלי

## איך מריצים את הפרויקט

### Frontend Setup
```bash
cd RealEstateClient
npm install
ng serve                    # רץ על http://localhost:4200
ng build                    # בניית production ל-dist/
ng test                     # הרצת בדיקות Vitest
```

### Backend Setup
1. **Database**: וודא ש-SQL Server רץ. מחרוזת חיבור ב-`appsettings.json`
2. **Build & Run**:
   ```bash
   cd RealEstateServer
   dotnet build
   dotnet run --project WebApiShop/WebApiShop.csproj
   ```
3. **API Access**: Swagger UI זמין ב-`https://localhost:44305/swagger`

### הגדרות חשובות
- **Frontend API Base**: מוגדר ב-services (בדרך כלל `https://localhost:44305`)
- **CORS**: Backend מאפשר רק `http://localhost:4200`
- **Email**: הגדרות Gmail SMTP ב-`appsettings.json`
- **Database Connection**: `appsettings.json` מכיל שם שרת

## חוקים ועקרונות חשובים בקוד

### Backend (.NET/C#)

1. **Async/Await תמיד**
   - כל מתודות Service ו-Repository משתמשות ב-`async Task`/`async Task<T>`
   - אין קריאות סינכרוניות למסד נתונים

2. **Exception Handling**
   - Middleware מרכזי (`ErrorHandlingMiddleware`) מטפל בכל החריגים
   - אל תעטוף try-catch בקונטרולרים - תן ל-middleware לטפל

3. **Dependency Injection**
   - כל השירותים נרשמים ב-`Program.cs` עם `AddScoped`
   - השתמש ב-constructor injection בלבד

4. **DTOs תמיד**
   - אף פעם אל תחזיר Entities ישירות מה-API
   - השתמש ב-AutoMapper למיפוי Entity ↔ DTO

5. **Repository Pattern**
   - כל גישה למסד נתונים דרך Repository
   - Services לא מדברים ישירות עם DbContext

6. **Logging**
   - השתמש ב-NLog לכל הלוגים
   - רמות: Debug, Info, Warning, Error

### Frontend (Angular/TypeScript)

1. **Component Structure**
   - כל קומפוננטה בתיקייה משלה עם `.ts`, `.html`, `.scss`
   - שמות קבצים: `component-name.component.ts`

2. **Services**
   - כל קריאות API דרך Services בלבד
   - השתמש ב-RxJS Observables (לא Promises)
   - Inject services דרך constructor

3. **Reactive Programming**
   - השתמש ב-RxJS operators: `map`, `switchMap`, `catchError`
   - Subscribe רק בקומפוננטות, לא ב-services
   - Unsubscribe ב-`ngOnDestroy`

4. **Styling**
   - עקוב אחרי `DESIGN_SYSTEM.md`
   - השתמש ב-CSS variables (לא צבעים קשיחים)
   - ערכת צבעים: גרדיאנט סגול `#667eea → #764ba2`

5. **Type Safety**
   - הגדר interfaces לכל המודלים
   - אל תשתמש ב-`any` (אלא אם אין ברירה)
   - השתמש ב-strict mode של TypeScript

6. **Error Handling**
   - טפל בשגיאות HTTP בכל subscribe
   - הצג הודעות משתמש ידידותיות
   - השתמש ב-PrimeNG MessageService

### עקרונות כלליים

1. **Clean Code**
   - שמות משתנים ופונקציות תיאוריים
   - פונקציות קצרות וממוקדות (Single Responsibility)
   - הימנע מקוד כפול (DRY)

2. **Security**
   - אל תשמור סיסמאות בטקסט פשוט
   - Validate כל קלט משתמש
   - השתמש ב-HTTPS בלבד בפרודקשן

3. **Performance**
   - Lazy loading לקומפוננטות גדולות
   - Pagination לרשימות ארוכות
   - Caching לנתונים סטטיים

4. **Testing**
   - כתוב unit tests לכל service חדש
   - Integration tests לזרימות קריטיות
   - E2E tests לתרחישים עיקריים

## Entities עיקריים

- **User**: משתמשים רשומים (בעלים ולקוחות) עם אימות
- **Product**: נכסי נדל"ן עם כל הפרטים (מחיר, מיקום, חדרים)
- **Category**: סוגי נכסים
- **Order**: הזמנות לקוחות עם מעקב סטטוס
- **OrderItem**: פריטים בהזמנה
- **ProductImage**: תמיכה במספר תמונות לנכס
- **Rating**: דירוגי משתמשים לנכסים
- **PropertyInquiry**: פניות לקוחות על נכסים
- **AdminInquiry**: פניות למנהלים

## כלים וספריות חשובים

### Backend
- **AutoMapper**: מיפוי אוטומטי בין DTOs ל-Entities
- **NLog**: לוגים עם שליחת מיילים בשגיאות
- **MailKit**: שליחת מיילים (Gmail SMTP)
- **Swagger**: תיעוד API אוטומטי

### Frontend
- **PrimeNG**: קומפוננטות UI מוכנות (buttons, dialogs, tables, calendar)
- **PrimeFlex**: מערכת Grid רספונסיבית
- **RxJS**: תכנות ריאקטיבי
- **Vitest**: בדיקות יחידה

## נקודות תשומת לב

1. **Connection Strings**: עדכן את שם ה-SQL Server ב-`appsettings.json` לפי המכונה שלך
2. **CORS**: Frontend חייב לרוץ על port 4200
3. **Email Config**: הגדר משתני סביבה בפרודקשן (לא hardcode)
4. **Middleware Order**: סדר חשוב ב-`Program.cs`
5. **Port Conflicts**: וודא שפורטים 4200 ו-44305 פנויים

---

**עודכן לאחרונה**: 2025 | **גרסה**: 1.0
