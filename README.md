# Giác Ngộ - Không Gian Thực Hành Tâm Linh AI

**Giác Ngộ** là một nền tảng ứng dụng web toàn diện, kết hợp giữa thực hành tâm linh truyền thống và công nghệ Trí tuệ Nhân tạo (AI) tiên tiến. Ứng dụng cung cấp các không gian tu tập chuyên biệt, nơi người dùng có thể tiếp cận pháp thoại, thiền dẫn, kinh sách và đặc biệt là sự hỗ trợ từ các Trợ lý AI được huấn luyện chuyên sâu theo từng chủ đề.

---

## 🚀 Tính Năng Chi Tiết (Dành Cho Người Dùng)

### 1. 🧘 Không Gian Thực Hành (Practice Spaces)
Mỗi "Không gian" (Space) là một khu vực độc lập dành cho một pháp môn, một vị thầy hoặc một cộng đồng cụ thể (ví dụ: "Giác Ngộ", "Làng Mai").
*   **Giao diện tùy biến**: Mỗi không gian có thể có giao diện, logo và chủ đề màu sắc riêng biệt.
*   **Chế độ xem đa dạng**: Người dùng có thể chuyển đổi giữa các chế độ: Trò chuyện (Chat), Thư viện (Library), Cộng đồng (Community).

### 2. 🤖 Trợ Lý AI (AI Companion)
Trái tim của ứng dụng là các AI Agent thông minh:
*   **Trò chuyện theo ngữ cảnh (Contextual Chat)**: AI hiểu và trả lời dựa trên kho dữ liệu (Kinh sách, bài giảng) riêng của từng Không gian.
*   **Đa phương thức (Multimodal)**:
    *   **Nhận dạng giọng nói (STT)**: Hỗ trợ nhập liệu bằng giọng nói tiếng Việt và tiếng Anh trực tiếp qua trình duyệt.
    *   **Đọc văn bản (TTS)**: AI có thể đọc câu trả lời bằng giọng đọc tự nhiên.
    *   **Xử lý hình ảnh & OCR**: Người dùng có thể gửi ảnh để AI phân tích, trích xuất văn bản và giải đáp.
    *   **Xử lý tài liệu**: Upload file (PDF, Docx) để AI tóm tắt hoặc trích xuất nội dung vào kho RAG.
*   **Lịch sử hội thoại**: Lưu trữ và quản lý các đoạn chat cũ, cho phép xem lại bất cứ lúc nào.

### 3. 📚 Thư Viện Pháp Bảo (Digital Library)
Kho tàng tri thức số hóa:
*   **Pháp Thoại (Dharma Talks)**: Trình phát audio/video các bài giảng pháp, hỗ trợ phân loại theo tác giả, chủ đề.
*   **Thiền Dẫn (Guided Meditations)**: Công cụ hỗ trợ hành thiền với các bài dẫn thiền được tích hợp sẵn, hỗ trợ bộ đếm giờ và nhạc nền.
*   **Kinh Sách & Tài Liệu**: Trình đọc tài liệu (Reader) tích hợp, hỗ trợ Mục lục tự động, tìm kiếm nội dung trong sách.
*   **Cộng đồng (Social Feed)**: Không gian chia sẻ, thảo luận và tương tác giữa các hành giả trong từng Không gian.

### 4.  Hệ Thống Merit & Marketplace
Hệ thống kinh tế nội tại hỗ trợ vận hành:
*   **Merit Token**: Đơn vị dùng để sử dụng các tính năng AI cao cấp.
*   **AI Marketplace**: Nơi người dùng khám phá và "Kích hoạt" (mua hoặc nhận miễn phí) các trợ lý AI chuyên biệt.
*   **Cúng Dường (Donation)**: Tích hợp cổng thanh toán Stripe và Crypto (Koii Network). Hệ thống hỗ trợ theo dõi dòng tiền cúng dường chi tiết theo từng Không gian (Space-based tracking).

---

## 🛠 Tính Năng Quản Trị (Admin System)

Hệ thống quản trị mạnh mẽ dành cho Admin và Chủ sở hữu Không gian (Space Owners).

### 1. 📊 Dashboard & Thống Kê
*   Tổng quan về số lượng người dùng, doanh thu, và mức độ sử dụng AI.
*   Biểu đồ theo dõi hoạt động theo thời gian thực.

### 2. 🧠 Quản Lý AI (AI Management)
*   **Cấu hình Model**: Tùy chỉnh LLM (Google Gemini, OpenAI GPT), nhiệt độ (temperature), system prompt.
*   **Training Data (RAG)**:
    *   Upload và quản lý các tập dữ liệu huấn luyện.
    *   Liên kết tài liệu từ Thư viện vào bộ nhớ của AI.
    *   Fine-tune dữ liệu để tăng độ chính xác.
*   **Phân quyền truy cập**: Cài đặt AI công khai (Public), riêng tư (Private) hoặc yêu cầu liên hệ (Contact for Access).

### 🔬 Quản Lý AI Chuyên Sâu (Advanced Config)
Dành cho người dùng muốn tùy chỉnh sâu hành vi của AI Agent.
*   **Data Sources (Nguồn Dữ Liệu)**:
    *   **System Prompt**: Chỉ thị cốt lõi định hình tính cách và kiến thức nền tảng của AI.
*   **Q&A Pairs**: Dữ liệu Hỏi-Đáp thủ công giúp AI học cách trả lời các câu hỏi cụ thể (Few-shot prompting). Hỗ trợ nhập liệu "Thought" để rèn luyện tư duy cho AI.
    *   **Documents (RAG)**:
        *   **File Upload**: Tải lên trực tiếp các file (PDF, DOCX, TXT...). Hệ thống tự động tóm tắt (Summarize) để tối ưu context.
        *   **Library Parsing**: Liên kết trực tiếp với sách/kinh từ Thư viện số.
    *   **Koii Network**: Gửi tác vụ huấn luyện lên mạng lưới phi tập trung Koii (Tính năng thử nghiệm).
*   **Fine-tuning (Tinh Chỉnh Model)**:
    *   Tạo các "Job" fine-tune để huấn luyện lại model gốc (Gemini/GPT) dựa trên dữ liệu Q&A đã chuẩn bị.
    *   Quản lý các phiên bản Model ID sau khi fine-tune.
*   **Tham Số Nâng Cao**:
    *   **Max Output Tokens**: Giới hạn độ dài câu trả lời.
    *   **Thinking Budget**: (Đối với các model có khả năng suy luận) Cấp hạn mức token cho quá trình "suy nghĩ" trước khi trả lời.
*   **Công Cụ Kiểm Thử (Test Chat)**:
    *   Khung chat nội bộ để Admin kiểm tra phản hồi của AI trước khi public.
    *   Tính năng "Add to Training": Chuyển đổi ngay đoạn chat thử nghiệm thành dữ liệu huấn luyện (Q&A) nếu AI trả lời đúng/sai để sửa lỗi.

### 3. 📂 Quản Lý Nội Dung (Content CMS)
Hệ thống CMS mạnh mẽ hỗ trợ đa ngôn ngữ (Việt/Anh) và đa phương tiện.
*   **Không Gian (Space Management)**:
    *   **Tùy biến sâu**: Quản lý Tên, Slug (URL), Màu sắc thương hiệu, Ảnh bìa.
    *   **Phân loại & Vị trí**: Gán loại hình không gian (Chùa, Thiền viện...) và địa điểm thực tế.
    *   **Thống kê & Sở hữu**: Theo dõi lượt xem, thành viên, và gán "Chủ sở hữu" (Space Owner) để chia sẻ doanh thu.
*   **Tài Liệu (Files & Documents)**:
    *   **Trình soạn thảo Rich Text**: Hỗ trợ định dạng văn bản chi tiết (Đậm, Nghiêng, Danh sách...).
    *   **Công cụ AI tích hợp**:
        *   **Auto-Translate**: Dịch tự động nội dung song ngữ (Việt <-> Anh) dùng Gemini/GPT.
        *   **Text-to-Speech (TTS)**: Tạo file âm thanh đọc truyện/kinh tự động với nhiều giọng đọc (Kore, Puck, Allo, Echo...).
        *   **OCR & Extraction**: Trích xuất văn bản từ file PDF/Ảnh scan ngay trong trình soạn thảo.
    *   **Phân loại chi tiết**: Quản lý theo Tác giả, Thể loại, Chủ đề và Thẻ (Tags).
*   **Pháp Thoại (Dharma Talks)**:
    *   Hỗ trợ đa nguồn: Upload file âm thanh trực tiếp hoặc nhúng link YouTube.
    *   Quản lý Tác giả/Diễn giả và Ảnh đại diện.
    *   Trình phát Audio tích hợp sẵn (Lưu lại tiến độ nghe).

### 4. 👥 Quản Lý Người Dùng & Phân Quyền (RBAC)
*   **User Management**:
    *   Xem danh sách, tìm kiếm, lọc theo trạng thái/quyền.
    *   Chỉnh sửa thông tin cá nhân, Merits (xu), và trạng thái hoạt động.
    *   Quản lý mật khẩu: Admin có thể reset hoặc thay đổi mật khẩu trực tiếp cho người dùng.
    *   Tạo người dùng mới thủ công.
*   **Role Management (Phân Quyền Chi Tiết)**:
    *   Tạo các nhóm quyền tùy chỉnh (Ví dụ: Editor, Moderator, Support).
    *   **Granular Permissions**: Cấp quyền truy cập chi tiết từng module (Dashboard, Files, AI, Finance, Settings...).
    *   Đảm bảo bảo mật và giới hạn truy cập đúng chức năng.

### 5. 💰 Tài Chính & Billing
*   **Lịch sử Giao dịch (Global Transactions)**:
    *   Theo dõi toàn bộ dòng tiền: Nạp Crypto, Stripe, Mua gói (Subscription), Cúng dường (Offering).
    *   Phân loại rõ ràng nguồn tiền và người thực hiện.
*   **Yêu cầu Rút tiền (Withdrawals)**:
    *   Quy trình xét duyệt rút tiền minh bạch dành cho các Space Owner.
    *   Hỗ trợ trạng thái xử lý: Chờ duyệt (Pending) -> Đã duyệt (Approved) / Từ chối (Rejected).
*   **Space Owner Dashboard**: Giao diện tài chính chuyên biệt cho chủ sở hữu không gian để quản lý doanh thu và số dư riêng biệt.
*   **Cấu hình Gói cước**: Quản lý các gói đăng ký (Pricing Plans) và quyền lợi đi kèm.

### 6. ⚙️ Hệ Thống & Cài Đặt (System Settings)
*   **Guest Control**: Giới hạn số tin nhắn cho người dùng vãng lai (Guest) để tránh spam.
*   **API Keys Cá Nhân**:
    *   Quản lý key riêng cho từng model (Gemini, Vertex, GPT, Grok) để tách biệt chi phí hoặc tăng limit.
    *   Tạo **Personal Access Token** để tích hợp với các ứng dụng bên thứ 3.
*   **Cấu hình Giao diện**: Tùy chỉnh Logo, tên hiển thị cho các template khác nhau.
## 💻 Công nghệ Sử dụng (Tech Stack)

### Frontend
*   **React.js (Vite)** + **TypeScript**
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)

### Backend
*   **Node.js (Express)**: Server điều phối chính.
*   **PostgreSQL**: Cơ sở dữ liệu quan hệ chính.
*   **Supabase**: Quản lý database và xác thực.
*   **Weaviate**: Vector Database phục vụ tìm kiếm ngữ cảnh (RAG).

### AI & APIs
*   **LLMs**: Google Gemini (Flash/Pro), OpenAI GPT-4o, Grok.
*   **Payment**: Stripe API.
*   **Blockchain**: Koii Network (Decentralized AI tasks).

---

## 📡 Tài Liệu API (API Docs)

### 🔐 Xác Thực (Authentication - `/auth`)
*   `POST /login`: Đăng nhập hệ thống.
*   `POST /register`: Đăng ký tài khoản mới.
*   `POST /forgot-password`: Yêu cầu đặt lại mật khẩu.
*   `POST /reset-password`: Thực hiện đặt lại mật khẩu với token.
*   `GET /auth/google`: Bắt đầu đăng nhập Google OAuth.

### 👤 Người Dùng (`/users`)
*   `GET /`: Lấy danh sách người dùng (Cần quyền Admin).
*   `GET /space-owners`: Lấy danh sách chủ sở hữu không gian.
*   `PUT /:id`: Cập nhật thông tin profile người dùng.
*   `POST /change-password`: Đổi mật khẩu cá nhân.
*   `POST /:id/regenerate-token`: Tạo lại API token cho người dùng.

### 🌏 Không Gian (`/spaces`)
*   `GET /`: Lấy danh sách tất cả không gian.
*   `GET /:slug`: Lấy thông tin chi tiết một không gian theo đường dẫn (slug).
*   `POST /`: Tạo không gian mới (Admin).
*   `PUT /:id`: Cập nhật thông tin không gian.
*   `POST /:id/view`: Tăng lượt xem cho không gian.
*   `POST /:id/offer`: Thực hiện cúng dường/ủng hộ cho không gian.

### 📚 Thư Viện & Tài Liệu
#### Library View (`/library`)
*   `GET /sidebar`: Lấy cấu trúc danh mục cho sidebar thư viện.
*   `GET /documents`: Lấy danh sách tài liệu hiển thị trong thư viện.
*   `GET /documents/:id`: Lấy nội dung chi tiết của tài liệu.

#### Quản Lý Tài Liệu (`/documents`)
*   `POST /`: Upload tài liệu mới.
*   `POST /extract-text`: API trích xuất văn bản (OCR) từ file upload.
*   `PUT /:id`: Cập nhật metadata tài liệu.
*   `DELETE /:id`: Xóa tài liệu.
*   **Danh mụ**: `/authors` (Tác giả), `/types` (Thể loại), `/topics` (Chủ đề).

### 🧘 Nội Dung Tu Tập
#### Pháp Thoại (`/dharma-talks`)
*   `GET /`: Lấy danh sách pháp thoại.
*   `POST /`: Tạo mới pháp thoại (Upload Audio/Avatar).
*   `POST /:id/view`: Ghi nhận lượt nghe.

#### Thiền (`/meditations`)
*   `GET /space/:spaceId`: Lấy danh sách bài thiền của một không gian.
*   `POST /`: Tạo bài dẫn thiền mới.

### 💬 AI & Trò Chuyện
#### Conversations (`/conversations`)
*   `POST /chat/stream`: Gửi tin nhắn và nhận phản hồi dạng stream (từng chữ).
*   `GET /`: Lấy danh sách hội thoại của người dùng.
*   `POST /:conversationId/messages/:messageId/feedback`: Gửi phản hồi (Like/Dislike) cho tin nhắn của AI.
*   `PUT /:id/rename`: Đổi tên cuộc trò chuyện.

#### AI Configuration (`/ai-configs`)
*   `POST /`: Lấy danh sách AI khả dụng cho người dùng.
*   `POST /create`: Tạo cấu hình AI mới (New Persona).
*   `POST /:id/training-data`: Link dữ liệu training cho AI.
*   `POST /:id/documents`: Gán tài liệu RAG cho AI.
*   `POST /:id/purchase`: Mua quyền truy cập AI.

### ⚙️ Hệ Thống & Tiện Ích (`/`)
*   `GET /system-config`: Lấy cấu hình toàn hệ thống.
*   `POST /upload`: Upload file chung (ảnh, đính kèm).
*   `POST /translate`: Dịch thuật văn bản.
*   `POST /tts/generate`: Tạo file âm thanh từ văn bản (Text-to-Speech).

### 💳 Thanh Toán (`/`)
*   `GET /pricing-plans`: Lấy bảng giá gói cước.
*   `POST /subscriptions/purchase`: Mua gói đăng ký.
*   `POST /stripe/create-checkout-session`: Tạo phiên thanh toán Stripe.
*   `POST /crypto/initiate-merit-purchase`: Bắt đầu giao dịch mua Merit bằng Crypto.
*   `POST /withdrawals`: Tạo yêu cầu rút tiền.
