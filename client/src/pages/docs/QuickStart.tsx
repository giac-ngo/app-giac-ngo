// client/src/pages/docs/QuickStart.tsx
import { Card, Badge } from "@/components/ui";
import { Key, User, Settings, Zap } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function QuickStart() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();

  const content = {
    vi: {
      title: "Hướng Dẫn Nhanh",
      subtitle: "Bắt đầu với Hệ Thống API Key. Tìm hiểu cách cấu hình và sử dụng Key Hệ Thống và Key Cá Nhân để tích hợp AI một cách liền mạch.",
      understanding: {
        title: "Hiểu về Hệ Thống Key",
        description: "Nền tảng sử dụng hệ thống API key hai cấp để đảm bảo tính linh hoạt, kiểm soát chi phí và trải nghiệm người dùng liền mạch. Có hai loại key hoạt động cùng nhau để vận hành nền tảng."
      },
      systemKey: {
        title: "Key Hệ Thống",
        description: "Key Hệ Thống là các API key do Quản trị viên cấu hình để đảm bảo hệ thống hoạt động cho tất cả người dùng, ngay cả những người không có key riêng.",
        features: "Tính năng chính",
        adminOnly: {
          badge: "Chỉ Admin",
          title: "Cấu hình",
          description: "Chỉ có Quản trị viên với quyền settings mới có thể cấu hình Key Hệ Thống trong Admin → Cài đặt → Cài đặt Hệ thống"
        },
        default: {
          badge: "Mặc định",
          title: "Dự phòng cho mọi người",
          description: "Cho phép người dùng khách và người dùng mới đăng ký có thể bắt đầu chat ngay lập tức mà không cần cấu hình"
        },
        cost: {
          badge: "Chi phí",
          title: "Nền tảng trả",
          description: "Tất cả chi phí từ việc sử dụng Key Hệ Thống được tính vào tài khoản Google AI Studio hoặc OpenAI của chủ nền tảng"
        }
      },
      personalKey: {
        title: "Key Cá Nhân",
        description: "Key Cá Nhân là các API key mà từng người dùng cấu hình cho tài khoản của riêng họ, cho họ toàn quyền kiểm soát việc sử dụng API và chi phí.",
        features: "Tính năng chính",
        anyUser: {
          badge: "Mọi người dùng",
          title: "Tự cấu hình",
          description: "Bất kỳ người dùng nào cũng có thể thiết lập key riêng của họ trong Admin → Cài đặt → Cài đặt cá nhân"
        },
        quota: {
          badge: "Quota riêng",
          title: "Sử dụng Quota API của bạn",
          description: "Truy cập các model beta, tránh giới hạn nền tảng và sử dụng quota Google/OpenAI cá nhân của bạn"
        },
        cost: {
          badge: "Chi phí",
          title: "Người dùng trả",
          description: "Chi phí được tính trực tiếp vào tài khoản Google/OpenAI của người dùng, giảm chi phí nền tảng"
        }
      },
      priority: {
        title: "Luồng Ưu Tiên",
        description: "Khi một yêu cầu cần gọi API, hệ thống chọn key để sử dụng theo thứ tự ưu tiên này:",
        level1: {
          title: "Key Cá Nhân của Người dùng hiện tại",
          description: "Nếu người dùng đã đăng nhập có cấu hình Key Cá Nhân cho nhà cung cấp yêu cầu (ví dụ: Gemini, GPT), hệ thống sử dụng nó trước tiên. Đây là ưu tiên tuyệt đối."
        },
        level2: {
          title: "Key Cá Nhân của Chủ sở hữu AI",
          description: "Nếu người dùng hiện tại không có key, kiểm tra xem người tạo AI có cấu hình Key Cá Nhân không. Điều này đặc biệt quan trọng cho các tác vụ đồng bộ vector."
        },
        level3: {
          title: "Key Hệ Thống",
          description: "Nếu cả người dùng và chủ sở hữu AI đều không có key, sử dụng Key Hệ Thống do admin cấu hình. Đây là phương án dự phòng cuối cùng."
        },
        error: {
          title: "Lỗi: Không có Key khả dụng",
          description: "Nếu không tìm thấy key ở bất kỳ cấp độ nào, hệ thống trả về lỗi: \"API Key chưa được cấu hình\""
        }
      },
      features: {
        title: "Các tính năng sử dụng Hệ thống này",
        chat: {
          title: "Tương tác Chat thông thường",
          description: "Khi người dùng gửi tin nhắn trong ChatPage hoặc Test Chat, hệ thống tuân theo luồng ưu tiên 3 cấp để xác định key nào sẽ sử dụng.",
          badges: ["Người dùng Khách", "Người dùng Đã đăng ký", "Power Users"]
        },
        weaviate: {
          title: "Đồng bộ Vector Weaviate (Koii Task)",
          description: "Khi gửi dữ liệu để huấn luyện, hệ thống sử dụng Key Cá Nhân của chủ sở hữu AI để đảm bảo chi phí vector hóa được tính đúng.",
          badges: ["Key Chủ sở hữu AI", "Dữ liệu Huấn luyện", "Lưu trữ Vector"]
        },
        models: {
          title: "Tải danh sách Model",
          description: "Khi quản lý AI và chọn nhà cung cấp như GPT, hệ thống gọi API để lấy các model khả dụng sử dụng Key Cá Nhân của admin.",
          badges: ["Chỉ Admin", "Yêu cầu Key Cá Nhân"]
        },
        liveChat: {
          title: "Trò chuyện Trực tiếp (Gemini)",
          description: "Tính năng streaming âm thanh hai chiều yêu cầu người dùng phải có Key Gemini Cá Nhân của riêng họ. Không có dự phòng vào Key Hệ Thống hoặc key chủ sở hữu AI do chi phí streaming cao.",
          badges: ["Bắt buộc Key Cá Nhân", "Không Dự phòng", "Streaming"]
        }
      },
      comparison: {
        title: "So sánh Nhanh",
        headers: ["Khía cạnh", "Key Hệ Thống", "Key Cá Nhân"],
        rows: [
          ["Ai cấu hình", "Chỉ Admin", "Bất kỳ người dùng nào"],
          ["Vị trí cấu hình", "Cài đặt Hệ thống", "Cài đặt Cá nhân"],
          ["Ai trả phí", "Chủ nền tảng", "Người dùng cá nhân"],
          ["Phạm vi", "Tất cả người dùng không có key cá nhân", "Chỉ người dùng đó"],
          ["Ưu tiên", "Thấp nhất (dự phòng)", "Cao nhất"]
        ]
      }
    },
    en: {
      title: "Quick Start",
      subtitle: "Get started with the API Key System. Learn how to configure and use System Keys and Personal Keys for seamless AI integration.",
      understanding: {
        title: "Understanding the Key System",
        description: "The platform uses a two-tier API key system to ensure flexibility, cost control, and seamless user experience. There are two types of keys that work together to power the platform."
      },
      systemKey: {
        title: "System Keys",
        description: "System Keys are API keys configured by platform administrators to ensure the system works for all users, even those without their own keys.",
        features: "Key Features",
        adminOnly: {
          badge: "Admin Only",
          title: "Configuration",
          description: "Only administrators with settings permission can configure System Keys in Admin → Settings → System Settings"
        },
        default: {
          badge: "Default",
          title: "Fallback for All Users",
          description: "Enables guest users and new registered users to start chatting immediately without configuration"
        },
        cost: {
          badge: "Cost",
          title: "Platform Pays",
          description: "All costs from System Key usage are billed to the platform owner's Google AI Studio or OpenAI account"
        }
      },
      personalKey: {
        title: "Personal Keys",
        description: "Personal Keys are API keys that individual users configure for their own accounts, giving them full control over their API usage and costs.",
        features: "Key Features",
        anyUser: {
          badge: "Any User",
          title: "Self-Configuration",
          description: "Any user can set up their own keys in Admin → Settings → Personal Settings"
        },
        quota: {
          badge: "Your Quota",
          title: "Use Your Own API Quota",
          description: "Access beta models, avoid platform limits, and use your personal Google/OpenAI quota"
        },
        cost: {
          badge: "Cost",
          title: "User Pays",
          description: "Costs are billed directly to the user's Google/OpenAI account, reducing platform expenses"
        }
      },
      priority: {
        title: "Priority Flow",
        description: "When a request requires an API call, the system selects which key to use based on this priority order:",
        level1: {
          title: "Current User's Personal Key",
          description: "If the logged-in user has configured a Personal Key for the required provider (e.g., Gemini, GPT), the system uses it first. This takes absolute priority."
        },
        level2: {
          title: "AI Owner's Personal Key",
          description: "If the current user doesn't have a key, check if the AI creator has configured a Personal Key. This is especially important for vector synchronization tasks."
        },
        level3: {
          title: "System Key",
          description: "If neither the user nor the AI owner has a key, fall back to the System Key configured by the admin. This is the final fallback."
        },
        error: {
          title: "Error: No Key Available",
          description: "If no key is found at any level, the system returns an error: \"API Key not configured\""
        }
      },
      features: {
        title: "Key Features Using This System",
        chat: {
          title: "Regular Chat Interactions",
          description: "When users send messages in ChatPage or Test Chat, the system follows the 3-tier priority flow to determine which key to use.",
          badges: ["Guest Users", "Registered Users", "Power Users"]
        },
        weaviate: {
          title: "Weaviate Vector Sync (Koii Task)",
          description: "When submitting data for training, the system uses the AI owner's Personal Key to ensure vectorization costs are attributed correctly.",
          badges: ["AI Owner Key", "Training Data", "Vector Storage"]
        },
        models: {
          title: "Model List Loading",
          description: "When managing AI and selecting providers like GPT, the system calls the API to fetch available models using the admin's Personal Key.",
          badges: ["Admin Only", "Personal Key Required"]
        },
        liveChat: {
          title: "Live Chat (Gemini)",
          description: "Two-way audio streaming feature requires users to have their own Gemini Personal Key. No fallback to System Key or AI owner key due to high streaming costs.",
          badges: ["Personal Key Mandatory", "No Fallback", "Streaming"]
        }
      },
      comparison: {
        title: "Quick Comparison",
        headers: ["Aspect", "System Key", "Personal Key"],
        rows: [
          ["Who Configures", "Admin only", "Any user"],
          ["Configuration Location", "System Settings", "Personal Settings"],
          ["Who Pays", "Platform owner", "Individual user"],
          ["Scope", "All users without personal keys", "Only that user"],
          ["Priority", "Lowest (fallback)", "Highest"]
        ]
      }
    }
  };

  const t = content[language];

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-4 flex-1">
          <h1 className=" text-4xl font-semibold text-foreground" data-testid="heading-quick-start">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {t.subtitle}
          </p>
        </div>
     
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <h2 className=" text-2xl font-semibold">{t.understanding.title}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {t.understanding.description}
        </p>
      </Card>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
            <Key className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold">{t.systemKey.title}</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {t.systemKey.description}
          </p>
          
          <div>
            <h4 className="text-sm font-semibold mb-3">{t.systemKey.features}</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="mt-0.5">{t.systemKey.adminOnly.badge}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t.systemKey.adminOnly.title}</p>
                  <p className="text-sm text-muted-foreground">{t.systemKey.adminOnly.description}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="mt-0.5">{t.systemKey.default.badge}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t.systemKey.default.title}</p>
                  <p className="text-sm text-muted-foreground">{t.systemKey.default.description}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="mt-0.5">{t.systemKey.cost.badge}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t.systemKey.cost.title}</p>
                  <p className="text-sm text-muted-foreground">{t.systemKey.cost.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
            <User className="w-5 h-5 text-green-500" />
          </div>
          <h3 className=" text-xl font-semibold">{t.personalKey.title}</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {t.personalKey.description}
          </p>
          
          <div>
            <h4 className="text-sm font-semibold mb-3">{t.personalKey.features}</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="mt-0.5">{t.personalKey.anyUser.badge}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t.personalKey.anyUser.title}</p>
                  <p className="text-sm text-muted-foreground">{t.personalKey.anyUser.description}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="mt-0.5">{t.personalKey.quota.badge}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t.personalKey.quota.title}</p>
                  <p className="text-sm text-muted-foreground">{t.personalKey.quota.description}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="mt-0.5">{t.personalKey.cost.badge}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t.personalKey.cost.title}</p>
                  <p className="text-sm text-muted-foreground">{t.personalKey.cost.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className=" text-xl font-semibold">{t.priority.title}</h3>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {t.priority.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-4 p-5 rounded-lg bg-muted/50 border-l-4 border-green-500">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-semibold text-sm shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2">{t.priority.level1.title}</p>
              <p className="text-sm text-muted-foreground">
                {t.priority.level1.description}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-lg bg-muted/50 border-l-4 border-blue-500">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-sm shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2">{t.priority.level2.title}</p>
              <p className="text-sm text-muted-foreground">
                {t.priority.level2.description}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-lg bg-muted/50 border-l-4 border-orange-500">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-semibold text-sm shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2">{t.priority.level3.title}</p>
              <p className="text-sm text-muted-foreground">
                {t.priority.level3.description}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-lg bg-muted/50 border-l-4 border-red-500">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-semibold text-sm shrink-0">
              ✕
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2">{t.priority.error.title}</p>
              <p className="text-sm text-muted-foreground">
                {t.priority.error.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 space-y-6">
        <div>
          <h3 className=" text-xl font-semibold mb-4">{t.features.title}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-mono text-sm font-semibold mb-2">{t.features.chat.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t.features.chat.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.features.chat.badges.map((badge, i) => (
                  <Badge key={i} variant="outline">{badge}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-sm font-semibold mb-2">{t.features.weaviate.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t.features.weaviate.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.features.weaviate.badges.map((badge, i) => (
                  <Badge key={i} variant="outline">{badge}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-sm font-semibold mb-2">{t.features.models.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t.features.models.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.features.models.badges.map((badge, i) => (
                  <Badge key={i} variant="outline">{badge}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-sm font-semibold mb-2">{t.features.liveChat.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t.features.liveChat.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.features.liveChat.badges.map((badge, i) => (
                  <Badge key={i} variant="outline">{badge}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 space-y-6">
        <div>
          <h3 className=" text-xl font-semibold mb-4">{t.comparison.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {t.comparison.headers.map((header, i) => (
                    <th key={i} className="text-left py-3 px-4 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {t.comparison.rows.map((row, i) => (
                  <tr key={i} className="hover-elevate">
                    <td className="py-3 px-4 font-medium">{row[0]}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row[1]}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
