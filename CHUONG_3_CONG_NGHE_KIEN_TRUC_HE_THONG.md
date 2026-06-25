# CHƯƠNG 3: CÔNG NGHỆ VÀ KIẾN TRÚC HỆ THỐNG

## 3.1. Tổng quan về công nghệ sử dụng

### 3.1.1. Giới thiệu chung

Hệ thống website bán thực phẩm sạch "Thực Phẩm Sạch" được xây dựng dựa trên kiến trúc hiện đại, sử dụng các công nghệ tiên tiến nhất hiện nay để đảm bảo hiệu suất, bảo mật và khả năng mở rộng. Hệ thống được thiết kế theo mô hình Client-Server với sự phân tách rõ ràng giữa Frontend và Backend, giúp dễ dàng bảo trì và phát triển trong tương lai.

### 3.1.2. Lựa chọn công nghệ

Việc lựa chọn công nghệ cho dự án được thực hiện dựa trên các tiêu chí:
- Hiệu suất và tốc độ xử lý
- Bảo mật và an toàn dữ liệu
- Khả năng mở rộng và bảo trì
- Chi phí phát triển và triển khai
- Cộng đồng hỗ trợ và tài liệu phong phú

Dựa trên các tiêu chí trên, hệ thống đã lựa chọn stack công nghệ sau:
- **Backend**: ASP.NET Core 8.0 với C#
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: SQL Server Express
- **Authentication**: JWT (JSON Web Token)
- **API Documentation**: Swagger/OpenAPI

## 3.2. Công nghệ Backend

### 3.2.1. ASP.NET Core 8.0

#### 3.2.1.1. Giới thiệu ASP.NET Core

ASP.NET Core là một framework web cross-platform, hiệu suất cao, được phát triển bởi Microsoft. Đây là phiên bản kế thừa và cải tiến của ASP.NET, được thiết kế lại từ đầu để tối ưu hóa hiệu suất và hỗ trợ đa nền tảng.

ASP.NET Core 8.0 là phiên bản mới nhất tại thời điểm phát triển dự án, mang lại nhiều cải tiến quan trọng:
- Hiệu suất được cải thiện đáng kể so với các phiên bản trước
- Hỗ trợ tốt hơn cho các ứng dụng cloud-native
- Tích hợp sẵn các tính năng bảo mật hiện đại
- Cộng đồng lớn và tài liệu phong phú

#### 3.2.1.2. Tại sao chọn ASP.NET Core?

**Ưu điểm:**
1. **Cross-platform**: Chạy được trên Windows, Linux, macOS
2. **Hiệu suất cao**: Một trong những framework web nhanh nhất hiện nay
3. **Mã nguồn mở**: Có thể xem và đóng góp vào source code
4. **Dependency Injection**: Tích hợp sẵn DI container
5. **Configuration**: Hệ thống cấu hình linh hoạt và mạnh mẽ
6. **Logging**: Hệ thống logging tích hợp sẵn
7. **Security**: Các tính năng bảo mật tích hợp sẵn (Authentication, Authorization, CORS, etc.)

**Áp dụng trong dự án:**
- Xây dựng RESTful API endpoint
- Quản lý routing và middleware
- Xử lý authentication và authorization
- Dependency Injection cho các service
- Configuration management
- Error handling và logging

#### 3.2.1.3. Kiến trúc ASP.NET Core trong dự án

Hệ thống sử dụng kiến trúc MVC (Model-View-Controller) của ASP.NET Core với các thành phần chính:

**Controllers:**
- `AuthController`: Xử lý đăng ký, đăng nhập, reset mật khẩu
- `SanPhamController`: Quản lý sản phẩm (CRUD)
- `DanhMucController`: Quản lý danh mục sản phẩm
- `GioHangController`: Quản lý giỏ hàng
- `DonHangController`: Quản lý đơn hàng
- `KhachHangController`: Quản lý thông tin khách hàng
- `GoiYController`: Hệ thống gợi ý sản phẩm

**Models:**
- `NguoiDung`: Model cơ sở cho người dùng
- `Admin`: Model quản trị viên
- `KhachHang`: Model khách hàng
- `DanhMuc`: Model danh mục sản phẩm
- `SanPham`: Model sản phẩm
- `GioHang`: Model giỏ hàng
- `ChiTietGioHang`: Model chi tiết giỏ hàng
- `DonHang`: Model đơn hàng
- `ChiTietDonHang`: Model chi tiết đơn hàng
- `ThanhToan`: Model thanh toán
- `LichSuHanhVi`: Model lịch sử hành vi người dùng

**DTOs (Data Transfer Objects):**
- `AuthDtos`: DTO cho authentication
- `SanPhamDtos`: DTO cho sản phẩm
- `DanhMucDtos`: DTO cho danh mục
- `GioHangDtos`: DTO cho giỏ hàng
- `DonHangDtos`: DTO cho đơn hàng
- `KhachHangDtos`: DTO cho khách hàng

### 3.2.2. Entity Framework Core 8.0

#### 3.2.2.1. Giới thiệu Entity Framework Core

Entity Framework Core (EF Core) là một ORM (Object-Relational Mapper) hiện đại, cross-platform, được phát triển bởi Microsoft. EF Core cho phép các nhà phát triển làm việc với database bằng cách sử dụng các đối tượng .NET, thay vì viết SQL queries trực tiếp.

#### 3.2.2.2. Tại sao chọn Entity Framework Core?

**Ưu điểm:**
1. **Productivity**: Giảm thiểu lượng code cần viết
2. **Maintainability**: Code dễ đọc và bảo trì hơn
3. **Type Safety**: Compile-time checking giúp tránh lỗi
4. **Database Independence**: Dễ dàng chuyển đổi giữa các database khác nhau
5. **LINQ**: Hỗ trợ LINQ để query data một cách mạnh mẽ
6. **Change Tracking**: Tự động theo dõi thay đổi của entities
7. **Migrations**: Hệ thống migrations mạnh mẽ để quản lý schema database

#### 3.2.2.3. Cấu hình Entity Framework Core

Trong dự án, EF Core được cấu hình với các thành phần sau:

**DbContext:**
```csharp
public class ThucPhamSachDbContext : DbContext
{
    public DbSet<NguoiDung> NguoiDungs => Set<NguoiDung>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<KhachHang> KhachHangs => Set<KhachHang>();
    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<SanPham> SanPhams => Set<SanPham>();
    public DbSet<GioHang> GioHangs => Set<GioHang>();
    public DbSet<ChiTietGioHang> ChiTietGioHangs => Set<ChiTietGioHang>();
    public DbSet<DonHang> DonHangs => Set<DonHang>();
    public DbSet<ChiTietDonHang> ChiTietDonHangs => Set<ChiTietDonHang>();
    public DbSet<ThanhToan> ThanhToans => Set<ThanhToan>();
    public DbSet<LichSuHanhVi> LichSuHanhVis => Set<LichSuHanhVi>();
}
```

**Connection String:**
```
Server=localhost\\SQLEXPRESS;Database=DbforThucPhamSach;Trusted_Connection=True;TrustServerCertificate=True;
```

**Features sử dụng:**
- Fluent API để cấu hình relationships và constraints
- AsNoTracking() cho read-only queries để tối ưu hiệu suất
- Include() cho eager loading
- Asynchronous operations (async/await)
- Transactions cho các operations phức tạp

### 3.2.3. SQL Server Express

#### 3.2.3.1. Giới thiệu SQL Server Express

SQL Server Express là phiên bản miễn phí của SQL Server, được thiết kế cho các ứng dụng nhỏ và vừa. Nó cung cấp đầy đủ các tính năng core của SQL Server nhưng với giới hạn về resource và scale.

#### 3.2.3.2. Tại sao chọn SQL Server Express?

**Ưu điểm:**
1. **Miễn phí**: Không cần chi phí license
2. **Full-featured**: Hỗ trợ hầu hết các tính năng của SQL Server
3. **Reliable**: Độ tin cậy cao, được Microsoft hỗ trợ
4. **Scalable**: Có thể upgrade lên các phiên bản cao hơn
5. **Integration**: Tích hợp tốt với .NET ecosystem
6. **Tools**: Hỗ trợ SQL Server Management Studio (SSMS)

#### 3.2.3.3. Database Design

Database `DbforThucPhamSach` được thiết kế với 11 bảng chính:

**Bảng người dùng:**
- `NguoiDung`: Bảng cơ sở chứa thông tin đăng nhập
- `Admin`: Bảng quản trị viên (kế thừa từ NguoiDung)
- `KhachHang`: Bảng khách hàng (kế thừa từ NguoiDung)

**Bảng sản phẩm:**
- `DanhMuc`: Bảng danh mục sản phẩm
- `SanPham`: Bảng sản phẩm

**Bảng giao dịch:**
- `GioHang`: Bảng giỏ hàng
- `ChiTietGioHang`: Bảng chi tiết giỏ hàng
- `DonHang`: Bảng đơn hàng
- `ChiTietDonHang`: Bảng chi tiết đơn hàng
- `ThanhToan`: Bảng thanh toán

**Bảng analytics:**
- `LichSuHanhVi`: Bảng lịch sử hành vi người dùng

**Relationships:**
- One-to-One: NguoiDung ↔ Admin, NguoiDung ↔ KhachHang, GioHang ↔ KhachHang, DonHang ↔ ThanhToan
- One-to-Many: DanhMuc ↔ SanPham, KhachHang ↔ DonHang, GioHang ↔ ChiTietGioHang, DonHang ↔ ChiTietDonHang
- Many-to-Many: SanPham ↔ DonHang (qua ChiTietDonHang), SanPham ↔ GioHang (qua ChiTietGioHang)

### 3.2.4. JWT Authentication

#### 3.2.4.1. Giới thiệu JWT

JWT (JSON Web Token) là một standard (RFC 7519) định nghĩa một cách compact và self-contained để truyền thông tin an toàn giữa các parties dưới dạng JSON object.

#### 3.2.4.2. Cấu trúc JWT

Một JWT bao gồm 3 phần:
1. **Header**: Chứa loại token và thuật toán signing
2. **Payload**: Chứa claims (thông tin về user)
3. **Signature**: Chứa signature của header và payload

#### 3.2.4.3. Tại sao chọn JWT?

**Ưu điểm:**
1. **Stateless**: Server không cần lưu session
2. **Scalable**: Dễ dàng scale horizontally
3. **Cross-domain**: Hỗ trợ CORS
4. **Self-contained**: Chứa tất cả thông tin cần thiết
5. **Secure**: Có thể signing và encryption

#### 3.2.4.4. Cấu hình JWT trong dự án

**Configuration:**
```json
{
  "Jwt": {
    "Issuer": "ThucPhamSach_Backend",
    "Audience": "ThucPhamSach_Frontend",
    "Key": "ThucPhamSach_Development_Jwt_Key_Change_Me_2026",
    "ExpireMinutes": 120
  }
}
```

**Claims trong JWT:**
- `sub`: User ID (maNguoiDung)
- `unique_name`: Username (tenDangNhap)
- `role`: User role (vaiTro)
- `maKH`: Customer ID (nếu là khách hàng)
- `maAdmin`: Admin ID (nếu là admin)

**Package sử dụng:**
- `Microsoft.AspNetCore.Authentication.JwtBearer` version 8.0.17

### 3.2.5. Swagger/OpenAPI

#### 3.2.5.1. Giới thiệu Swagger

Swagger là một framework giúp thiết kế, xây dựng, documenting và consuming REST APIs. OpenAPI Specification là một standard để định nghĩa API.

#### 3.2.5.2. Tại sao chọn Swagger?

**Ưu điểm:**
1. **Interactive Documentation**: Tài liệu API tương tác
2. **Client Generation**: Tự động tạo client code
3. **Server Generation**: Tự động generate server stub
4. **Testing**: Dễ dàng test API trực tiếp trên UI
5. **Standard**: Tuân theo OpenAPI Specification

#### 3.2.5.3. Cấu hình Swagger trong dự án

**Package sử dụng:**
- `Swashbuckle.AspNetCore` version 6.6.2

**Configuration:**
```csharp
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Thuc Pham Sach API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhap JWT token vao day."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            []
        }
    });
});
```

## 3.3. Công nghệ Frontend

### 3.3.1. HTML5

#### 3.3.1.1. Giới thiệu HTML5

HTML5 là phiên bản mới nhất của HTML, mang lại nhiều semantic elements và APIs mới giúp xây dựng web applications hiện đại.

#### 3.3.1.2. Tại sao chọn HTML5?

**Ưu điểm:**
1. **Semantic Elements**: Các thẻ có ngữ nghĩa rõ ràng (header, nav, main, section, article, footer)
2. **Form Enhancements**: Các input types mới và validation
3. **Multimedia**: Hỗ trợ native audio và video
4. **APIs**: Geolocation, LocalStorage, Web Workers, etc.
5. **Cross-browser**: Được hỗ trợ bởi tất cả các trình duyệt hiện đại

#### 3.3.1.3. Áp dụng trong dự án

**Semantic HTML Structure:**
```html
<header class="site-header">
    <nav class="nav-shell">
        <!-- Navigation -->
    </nav>
</header>

<main class="page-shell">
    <section class="hero">
        <!-- Hero section -->
    </section>

    <section class="product-section">
        <!-- Product section -->
    </section>

    <section class="recommendation-section">
        <!-- Recommendation section -->
    </section>
</main>

<footer class="simple-footer">
    <!-- Footer -->
</footer>
```

**Accessibility Features:**
- `aria-label` cho các elements tương tác
- `role` attributes cho semantic meaning
- `alt` text cho images
- Proper heading hierarchy

### 3.3.2. CSS3

#### 3.3.2.1. Giới thiệu CSS3

CSS3 là phiên bản mới nhất của CSS, mang lại nhiều features mới giúp styling web pages một cách mạnh mẽ và linh hoạt hơn.

#### 3.3.2.2. Tại sao chọn CSS3?

**Ưu điểm:**
1. **Flexbox & Grid**: Layout systems mạnh mẽ
2. **Animations & Transitions**: Hiệu ứng mượt mà
3. **Responsive Design**: Media queries cho mobile-first
4. **Custom Properties**: CSS Variables
5. **Pseudo-elements & Pseudo-classes**: Styling nâng cao

#### 3.3.2.3. Áp dụng trong dự án

**CSS Architecture:**
- **Common CSS**: Styles chia sẻ giữa các pages
- **Page-specific CSS**: Styles cho từng page riêng biệt
- **Component CSS**: Styles cho các components tái sử dụng

**Features sử dụng:**
- CSS Grid cho product grid layout
- Flexbox cho navigation và card layouts
- CSS Variables (Custom Properties) cho theming
- Media queries cho responsive design
- Backdrop-filter cho glassmorphism effects
- Transitions và animations cho UX

**Responsive Breakpoints:**
```css
@media (max-width: 980px) {
    /* Tablet styles */
}

@media (max-width: 820px) {
    /* Mobile styles */
}

@media (max-width: 520px) {
    /* Small mobile styles */
}
```

### 3.3.3. JavaScript (Vanilla)

#### 3.3.3.1. Giới thiệu JavaScript

JavaScript là một programming language đa năng, chủ yếu được sử dụng để tạo interactive web pages. Vanilla JS là JavaScript thuần không sử dụng frameworks.

#### 3.3.3.2. Tại sao chọn Vanilla JavaScript?

**Ưu điểm:**
1. **No Dependencies**: Không cần tải external libraries
2. **Performance**: Tối ưu hiệu suất
3. **Learning Curve**: Dễ học và hiểu
4. **Browser Support**: Được hỗ trợ bởi tất cả trình duyệt
5. **Control**: Full control over code

#### 3.3.3.3. Áp dụng trong dự án

**JavaScript Architecture:**
- **Module Pattern**: Sử dụng IIFE (Immediately Invoked Function Expression) để tạo modules
- **API Client**: Centralized API communication
- **State Management**: LocalStorage cho authentication state
- **Event Handling**: Event delegation cho performance

**Key Functions:**
```javascript
// API Communication
TPS.request(path, options)
TPS.unwrap(payload)

// Authentication
TPS.getAuth()
TPS.saveAuth(auth)
TPS.clearAuth()
TPS.getToken()
TPS.getUser()

// Utilities
TPS.formatCurrency(value)
TPS.escapeHtml(value)
TPS.getField(source, ...keys)
TPS.viText(value)
TPS.getProductImage(maSp, hinhAnh)
```

**Features:**
- Async/await cho asynchronous operations
- Fetch API cho HTTP requests
- LocalStorage cho client-side persistence
- Event delegation cho event handling
- Error handling và user feedback

## 3.4. Kiến trúc hệ thống

### 3.4.1. Tổng quan kiến trúc

Hệ thống được thiết kế theo kiến trúc **3-tier** với sự phân tách rõ ràng giữa các layers:

1. **Presentation Layer (Frontend)**: HTML5, CSS3, JavaScript
2. **Application Layer (Backend)**: ASP.NET Core Web API
3. **Data Layer (Database)**: SQL Server Express

### 3.4.2. Kiến trúc chi tiết

#### 3.4.2.1. Frontend Architecture

**Component Structure:**
```
ThucPhamSach_Frontend/
├── admin/
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── cart/
│   ├── cart.html
│   ├── cart.css
│   └── cart.js
├── common/
│   ├── api.js
│   ├── common.css
│   ├── goo-button.css
│   └── goo-button.js
├── home/
│   ├── home.css
│   └── home.js
├── login/
│   ├── login.html
│   ├── login.css
│   └── login.js
├── orders/
│   ├── orders.html
│   ├── orders.css
│   └── orders.js
├── register/
│   ├── register.html
│   ├── register.css
│   └── register.js
└── index.html
```

**Design Patterns:**
- **Module Pattern**: IIFE để encapsulate code
- **Singleton Pattern**: API client instance
- **Observer Pattern**: Event handling
- **Strategy Pattern**: Multiple API base URLs fallback

#### 3.4.2.2. Backend Architecture

**Project Structure:**
```
ThucPhamSach_Backend/
├── Controllers/
│   ├── AuthController.cs
│   ├── SanPhamController.cs
│   ├── DanhMucController.cs
│   ├── GioHangController.cs
│   ├── DonHangController.cs
│   ├── KhachHangController.cs
│   └── GoiYController.cs
├── Models/
│   ├── NguoiDung.cs
│   ├── Admin.cs
│   ├── KhachHang.cs
│   ├── DanhMuc.cs
│   ├── SanPham.cs
│   ├── GioHang.cs
│   ├── ChiTietGioHang.cs
│   ├── DonHang.cs
│   ├── ChiTietDonHang.cs
│   ├── ThanhToan.cs
│   └── LichSuHanhVi.cs
├── Dtos/
│   ├── AuthDtos.cs
│   ├── SanPhamDtos.cs
│   ├── DanhMucDtos.cs
│   ├── GioHangDtos.cs
│   ├── DonHangDtos.cs
│   └── KhachHangDtos.cs
├── Data/
│   └── ThucPhamSachDbContext.cs
├── Common/
│   └── ApiResponse.cs
├── Utils/
│   └── PasswordHashHelper.cs
├── Program.cs
└── appsettings.json
```

**Design Patterns:**
- **Repository Pattern**: DbContext đóng vai trò repository
- **DTO Pattern**: Data Transfer Objects cho API responses
- **Dependency Injection**: Constructor injection
- **Middleware Pipeline**: Request processing pipeline
- **Factory Pattern**: Response object creation

#### 3.4.2.3. Database Architecture

**Schema Design:**
```
DbforThucPhamSach
├── NguoiDung (Base table)
├── Admin (extends NguoiDung)
├── KhachHang (extends NguoiDung)
├── DanhMuc
├── SanPham
├── GioHang
├── ChiTietGioHang (Composition with GioHang)
├── DonHang
├── ChiTietDonHang (Composition with DonHang)
├── ThanhToan
└── LichSuHanhVi
```

**Normalization:**
- **3NF**: Database được chuẩn hóa đến dạng 3NF
- **Foreign Keys**: Enforce referential integrity
- **Indexes**: Optimized cho common queries
- **Constraints**: Check constraints cho data validation

### 3.4.3. Data Flow

#### 3.4.3.1. Authentication Flow

```
1. User → Frontend: Submit login credentials
2. Frontend → Backend: POST /api/Auth/login
3. Backend: Validate credentials
4. Backend: Generate JWT token
5. Backend → Frontend: Return token + user info
6. Frontend: Store token in LocalStorage
7. Frontend: Include token in subsequent requests
8. Backend: Validate token on each request
9. Backend: Grant/deny access based on claims
```

#### 3.4.3.2. Product Browsing Flow

```
1. User → Frontend: Navigate to home page
2. Frontend: Request products from API
3. Frontend → Backend: GET /api/SanPham
4. Backend: Query database
5. Backend → Frontend: Return product list
6. Frontend: Render products in grid
7. User → Frontend: Filter/search products
8. Frontend → Backend: GET /api/SanPham?filters
9. Backend: Apply filters and query
10. Backend → Frontend: Return filtered results
```

#### 3.4.3.3. Order Placement Flow

```
1. User → Frontend: Add products to cart
2. Frontend → Backend: POST /api/GioHang/items
3. Backend: Update cart in database
4. User → Frontend: Place order
5. Frontend → Backend: POST /api/DonHang
6. Backend: Create order from cart
7. Backend: Update inventory
8. Backend: Clear cart
9. Backend → Frontend: Return order confirmation
10. Frontend: Display success message
```

### 3.4.4. Security Architecture

#### 3.4.4.1. Authentication & Authorization

**Authentication Mechanisms:**
- JWT Bearer Token Authentication
- Password Hashing (ASP.NET Core Identity)
- Token expiration (120 minutes)
- Token refresh capability

**Authorization Mechanisms:**
- Role-based access control (RBAC)
- Claims-based authorization
- Policy-based authorization
- Resource-based authorization

**Roles:**
- `Admin`: Full access to all resources
- `KhachHang`: Limited access to customer-specific resources

#### 3.4.4.2. Data Security

**Password Security:**
- Password hashing using ASP.NET Core Identity
- Bcrypt algorithm with salt
- No plain text storage
- Minimum password length requirement (6 characters)

**API Security:**
- HTTPS in production
- CORS configuration
- Input validation
- SQL injection prevention (EF Core parameterized queries)
- XSS prevention (HTML encoding)

**Database Security:**
- SQL Server Authentication
- Trusted Connection (Windows Authentication)
- Principle of least privilege
- Regular backups

#### 3.4.4.3. CORS Configuration

**Allowed Origins:**
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "http://localhost:5502",
      "http://127.0.0.1:5502",
      "http://localhost:5503",
      "http://127.0.0.1:5503",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ]
  }
}
```

**CORS Policy:**
- Development: Allow any origin
- Production: Whitelist specific origins
- Allow any headers and methods

### 3.4.5. Performance Optimization

#### 3.4.5.1. Backend Optimization

**Database Optimization:**
- Indexes on frequently queried columns
- AsNoTracking() for read-only queries
- Eager loading with Include()
- Asynchronous operations
- Connection pooling

**API Optimization:**
- Response compression
- Caching headers
- Pagination support
- DTO projection (select only needed fields)

**Code Optimization:**
- Async/await pattern
- Dependency injection
- Lazy loading
- Memory management

#### 3.4.5.2. Frontend Optimization

**Performance Techniques:**
- Lazy loading images
- Event delegation
- CSS animations instead of JavaScript
- Minimal DOM manipulation
- Efficient selectors

**Loading Optimization:**
- Critical CSS inline
- Defer non-critical JavaScript
- Image optimization
- Font loading strategy

**User Experience:**
- Loading states
- Error handling
- Graceful degradation
- Progressive enhancement

### 3.4.6. Scalability Considerations

#### 3.4.6.1. Horizontal Scaling

**Backend Scaling:**
- Stateless design (JWT)
- Load balancing ready
- Database connection pooling
- Caching layer potential

**Frontend Scaling:**
- CDN deployment
- Static asset caching
- Client-side rendering
- Service worker potential

#### 3.4.6.2. Vertical Scaling

**Resource Optimization:**
- Memory management
- CPU optimization
- I/O optimization
- Network optimization

**Database Scaling:**
- Read replicas
- Database sharding
- Archive old data
- Optimize queries

## 3.5. API Design

### 3.5.1. RESTful API Principles

Hệ thống API được thiết kế theo RESTful principles:

1. **Resource-based**: Mỗi endpoint đại diện cho một resource
2. **HTTP Methods**: Sử dụng đúng HTTP verbs (GET, POST, PUT, DELETE)
3. **Stateless**: Mỗi request chứa tất cả thông tin cần thiết
4. **Uniform Interface**: Consistent API design
5. **Cacheable**: Responses có thể được cache
6. **Layered System**: Có thể thêm layers mà không ảnh hưởng client

### 3.5.2. API Endpoints

#### 3.5.2.1. Authentication Endpoints

```
POST /api/Auth/register
- Description: Đăng ký tài khoản mới
- Request Body: RegisterRequest
- Response: UserInfoDto
- Authentication: None

POST /api/Auth/login
- Description: Đăng nhập
- Request Body: LoginRequest
- Response: AuthResponse (token + user info)
- Authentication: None

POST /api/Auth/reset-all-passwords
- Description: Reset tất cả mật khẩu (admin only)
- Request Body: ResetPasswordRequest
- Response: Success message
- Authentication: Admin

POST /api/Auth/fix-corrupted-passwords
- Description: Sửa lỗi mật khẩu bị hỏng
- Request Body: None
- Response: Fixed passwords info
- Authentication: None
```

#### 3.5.2.2. Product Endpoints

```
GET /api/SanPham
- Description: Lấy danh sách sản phẩm với filters
- Query Parameters: tuKhoa, maDanhMuc, giaMin, giaMax
- Response: List<SanPhamDto>
- Authentication: None

GET /api/SanPham/{maSp}
- Description: Lấy chi tiết sản phẩm
- Response: SanPhamDto
- Authentication: None

POST /api/SanPham
- Description: Thêm sản phẩm mới
- Request Body: CreateSanPhamRequest
- Response: SanPhamDto
- Authentication: Admin

PUT /api/SanPham/{maSp}
- Description: Cập nhật sản phẩm
- Request Body: UpdateSanPhamRequest
- Response: SanPhamDto
- Authentication: Admin

DELETE /api/SanPham/{maSp}
- Description: Xóa sản phẩm
- Response: Success message
- Authentication: Admin
```

#### 3.5.2.3. Category Endpoints

```
GET /api/DanhMuc
- Description: Lấy danh sách danh mục
- Response: List<DanhMucDto>
- Authentication: None

GET /api/DanhMuc/{maDanhMuc}
- Description: Lấy chi tiết danh mục
- Response: DanhMucDto
- Authentication: None

POST /api/DanhMuc
- Description: Thêm danh mục mới
- Request Body: CreateDanhMucRequest
- Response: DanhMucDto
- Authentication: Admin

PUT /api/DanhMuc/{maDanhMuc}
- Description: Cập nhật danh mục
- Request Body: UpdateDanhMucRequest
- Response: DanhMucDto
- Authentication: Admin

DELETE /api/DanhMuc/{maDanhMuc}
- Description: Xóa danh mục
- Response: Success message
- Authentication: Admin
```

#### 3.5.2.4. Cart Endpoints

```
GET /api/GioHang
- Description: Lấy giỏ hàng của khách hàng
- Response: GioHangDto
- Authentication: KhachHang

POST /api/GioHang/items
- Description: Thêm sản phẩm vào giỏ hàng
- Request Body: AddToCartRequest
- Response: GioHangDto
- Authentication: KhachHang

PUT /api/GioHang/items
- Description: Cập nhật số lượng sản phẩm trong giỏ
- Request Body: UpdateCartItemRequest
- Response: GioHangDto
- Authentication: KhachHang

DELETE /api/GioHang/items/{maSp}
- Description: Xóa sản phẩm khỏi giỏ hàng
- Response: GioHangDto
- Authentication: KhachHang

DELETE /api/GioHang
- Description: Xóa toàn bộ giỏ hàng
- Response: Success message
- Authentication: KhachHang
```

#### 3.5.2.5. Order Endpoints

```
GET /api/DonHang
- Description: Lấy danh sách đơn hàng của khách hàng
- Response: List<DonHangDto>
- Authentication: KhachHang

GET /api/DonHang/{maDonHang}
- Description: Lấy chi tiết đơn hàng
- Response: DonHangDto
- Authentication: KhachHang

POST /api/DonHang
- Description: Tạo đơn hàng từ giỏ hàng
- Request Body: CreateDonHangRequest
- Response: DonHangDto
- Authentication: KhachHang

PUT /api/DonHang/{maDonHang}/trang-thai
- Description: Cập nhật trạng thái đơn hàng
- Request Body: UpdateOrderStatusRequest
- Response: DonHangDto
- Authentication: Admin
```

#### 3.5.2.6. Recommendation Endpoints

```
GET /api/GoiY/khach-hang
- Description: Lấy gợi ý sản phẩm cho khách hàng
- Response: List<SanPhamDto>
- Authentication: KhachHang

GET /api/GoiY/khach-hang/{maKH}
- Description: Lấy gợi ý sản phẩm cho khách hàng cụ thể
- Response: List<SanPhamDto>
- Authentication: Admin
```

### 3.5.3. Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

**HTTP Status Codes:**
- 200 OK: Request successful
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict
- 500 Internal Server Error: Server error

## 3.6. Hệ thống gợi ý sản phẩm

### 3.6.1. Giới thiệu hệ thống gợi ý

Hệ thống gợi ý sản phẩm được xây dựng để cung cấp các đề xuất cá nhân hóa cho khách hàng dựa trên lịch sử mua hàng, hành vi mua sắm và sở thích danh mục. Hệ thống giúp tăng trải nghiệm người dùng và tăng doanh số bán hàng.

### 3.6.2. Thuật toán gợi ý

#### 3.6.2.1. Gợi ý theo lịch sử mua hàng

**Logic:**
1. Lấy danh sách danh mục của các sản phẩm khách hàng đã mua
2. Tìm các sản phẩm cùng danh mục nhưng chưa mua
3. Sắp xếp ngẫu nhiên để đa dạng hóa
4. Lấy tối đa 4 sản phẩm

**Implementation:**
```csharp
private async Task<List<SanPhamDto>> GetRecommendationsByPurchaseHistory(string maKH)
{
    var purchasedCategories = await _context.ChiTietDonHangs
        .Join(_context.DonHangs, ct => ct.MaDonHang, dh => dh.MaDonHang, (ct, dh) => new { ct, dh })
        .Join(_context.SanPhams, x => x.ct.MaSp, sp => sp.MaSp, (x, sp) => new { x.dh, sp })
        .Where(x => x.dh.MaKh == maKH)
        .Select(x => x.sp.MaDanhMuc)
        .Distinct()
        .ToListAsync();

    var purchasedProductIds = await _context.ChiTietDonHangs
        .Join(_context.DonHangs, ct => ct.MaDonHang, dh => dh.MaDonHang, (ct, dh) => new { ct, dh })
        .Where(x => x.dh.MaKh == maKH)
        .Select(x => x.ct.MaSp)
        .Distinct()
        .ToListAsync();

    var recommendations = await _context.SanPhams
        .AsNoTracking()
        .Include(x => x.DanhMuc)
        .Where(x => purchasedCategories.Contains(x.MaDanhMuc) 
            && !purchasedProductIds.Contains(x.MaSp)
            && x.SoLuongTon > 0)
        .OrderBy(x => Guid.NewGuid())
        .Take(4)
        .Select(x => ToDto(x))
        .ToListAsync();

    return recommendations;
}
```

#### 3.6.2.2. Gợi ý theo hành vi mua sắm

**Logic:**
1. Lấy danh sách sản phẩm khách hàng đã xem, tìm kiếm, thêm giỏ
2. Tìm danh mục của các sản phẩm đã tương tác
3. Gợi ý sản phẩm cùng danh mục nhưng chưa tương tác
4. Sắp xếp ngẫu nhiên
5. Lấy tối đa 3 sản phẩm

**Implementation:**
```csharp
private async Task<List<SanPhamDto>> GetRecommendationsByBehavior(string maKH)
{
    var behaviorProductIds = await _context.LichSuHanhVis
        .Where(x => x.MaKh == maKH 
            && (x.LoaiHanhVi == "XemSanPham" || x.LoaiHanhVi == "TimKiem" || x.LoaiHanhVi == "ThemGioHang")
            && x.MaSp != null)
        .Select(x => x.MaSp!)
        .Distinct()
        .ToListAsync();

    var behaviorCategories = await _context.SanPhams
        .Where(x => behaviorProductIds.Contains(x.MaSp))
        .Select(x => x.MaDanhMuc)
        .Distinct()
        .ToListAsync();

    var recommendations = await _context.SanPhams
        .AsNoTracking()
        .Include(x => x.DanhMuc)
        .Where(x => behaviorCategories.Contains(x.MaDanhMuc) 
            && !behaviorProductIds.Contains(x.MaSp)
            && x.SoLuongTon > 0)
        .OrderBy(x => Guid.NewGuid())
        .Take(3)
        .Select(x => ToDto(x))
        .ToListAsync();

    return recommendations;
}
```

#### 3.6.2.3. Gợi ý theo danh mục

**Logic:**
1. Lấy danh mục khách hàng quan tâm nhất (dựa trên số lượng tương tác)
2. Gợi ý sản phẩm từ danh mục đó
3. Sắp xếp theo số lượng tồn kho
4. Lấy tối đa 3 sản phẩm

**Implementation:**
```csharp
private async Task<List<SanPhamDto>> GetRecommendationsByCategory(string maKH)
{
    var favoriteCategory = await _context.LichSuHanhVis
        .Join(_context.SanPhams, lshv => lshv.MaSp, sp => sp.MaSp, (lshv, sp) => new { lshv, sp })
        .Where(x => x.lshv.MaKh == maKH && x.lshv.MaSp != null)
        .GroupBy(x => x.sp.MaDanhMuc)
        .OrderByDescending(g => g.Count())
        .Select(g => g.Key)
        .FirstOrDefaultAsync();

    var recommendations = await _context.SanPhams
        .AsNoTracking()
        .Include(x => x.DanhMuc)
        .Where(x => x.MaDanhMuc == favoriteCategory && x.SoLuongTon > 0)
        .OrderByDescending(x => x.SoLuongTon)
        .Take(3)
        .Select(x => ToDto(x))
        .ToListAsync();

    return recommendations;
}
```

#### 3.6.2.4. Fallback cho người dùng mới

**Logic:**
- Nếu không có gợi ý nào từ 3 nguồn trên, gợi ý sản phẩm bán chạy
- Sắp xếp theo số lượng tồn kho và giá
- Lấy tối đa 8 sản phẩm

### 3.6.3. Kết hợp các nguồn gợi ý

**Algorithm:**
1. Lấy gợi ý từ 3 nguồn khác nhau
2. Kết hợp tất cả vào một danh sách
3. Loại bỏ trùng lặp
4. Lấy 8 sản phẩm đầu tiên
5. Nếu không có gợi ý, sử dụng fallback

**Implementation:**
```csharp
private async Task<List<SanPhamDto>> GetRecommendationsAsync(string maKH)
{
    var allRecommendations = new List<SanPhamDto>();

    var purchaseHistoryRecommendations = await GetRecommendationsByPurchaseHistory(maKH);
    allRecommendations.AddRange(purchaseHistoryRecommendations);

    var behaviorRecommendations = await GetRecommendationsByBehavior(maKH);
    allRecommendations.AddRange(behaviorRecommendations);

    var categoryRecommendations = await GetRecommendationsByCategory(maKH);
    allRecommendations.AddRange(categoryRecommendations);

    if (!allRecommendations.Any())
    {
        var fallbackRecommendations = await GetFallbackRecommendations();
        allRecommendations.AddRange(fallbackRecommendations);
    }

    var uniqueRecommendations = allRecommendations
        .GroupBy(x => x.MaSp)
        .Select(g => g.First())
        .Take(8)
        .ToList();

    return uniqueRecommendations;
}
```

## 3.7. Kết luận

Chương 3 đã trình bày chi tiết về các công nghệ và kiến trúc hệ thống được sử dụng trong dự án website bán thực phẩm sạch "Thực Phẩm Sạch". Hệ thống được xây dựng dựa trên các công nghệ hiện đại và best practices, đảm bảo:

- **Hiệu suất cao**: ASP.NET Core 8.0 và EF Core 8.0 mang lại hiệu suất tối ưu
- **Bảo mật**: JWT authentication và role-based authorization đảm bảo an toàn
- **Khả năng mở rộng**: Kiến trúc modular và stateless design cho phép scaling
- **Trải nghiệm người dùng**: Frontend responsive và hệ thống gợi ý thông minh
- **Bảo trì dễ dàng**: Code structure rõ ràng và separation of concerns

Việc lựa chọn công nghệ phù hợp và thiết kế kiến trúc tốt là nền tảng quan trọng để xây dựng một hệ thống chất lượng cao, đáp ứng được các yêu cầu của khách hàng và có thể phát triển trong tương lai.
