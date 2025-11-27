import { useOutletContext } from "react-router-dom";
import { Card } from "@/components/ui";
import { Sparkles, Code2, Zap } from "lucide-react";

const translations = {
  vi: {
    title: "AI Agent Phật Giáo",
    intro: "Các trợ lý AI chuyên biệt dựa trên trí tuệ Phật giáo, mỗi trợ lý được thiết kế cho các khía cạnh cụ thể của thực hành tâm linh—từ chữa lành nhẹ nhàng đến giác ngộ trực chỉ.",
    cards: {
      agents: {
        title: "12 Agent Chuyên Biệt",
        desc: "Mỗi agent đại diện cho một phương pháp hướng dẫn tâm linh độc đáo, được tổ chức theo các cấp độ thừa phật giáo từ thực hành nền tảng đến chứng ngộ tối hậu."
      },
      models: {
        title: "Mô hình Tiên tiến",
        desc: "Được vận hành bởi GPT-4o và GPT-5, kết hợp AI tiên tiến với những lời dạy dharma vượt thời gian từ các tu viện Phật giáo khác nhau."
      },
      economics: {
        title: "Kinh Tế Thiêng Liêng",
        desc: "Định giá dựa trên công đức, tôn trọng cả thực tế tính toán và ý định tâm linh."
      }
    },
    vehicles: "Bốn Cấp Độ Thừa (Vehicles)",
    vehicleList: [
      {
        name: "Tiểu Thừa (Nền tảng)",
        desc: "Giải thoát cá nhân thông qua chánh niệm cơ bản, giới luật và thiền định. Hoàn hảo cho người mới bắt đầu tìm kiếm sự bình an và giảm căng thẳng."
      },
      {
        name: "Trung Thừa (Tuệ giác)",
        desc: "Làm sâu sắc sự hiểu biết thông qua tự vấn và quán chiếu. Khám phá lý duyên khởi và bản chất của thực tại."
      },
      {
        name: "Đại Thừa (Bồ Tát)",
        desc: "Kết hợp trí tuệ và từ bi. Chỉ thẳng vào Phật tánh trong khi nuôi dưỡng tâm nguyện cứu độ tất cả chúng sinh."
      },
      {
        name: "Phật Thừa (Tối hậu)",
        desc: "Vượt qua mọi khái niệm và phương pháp. Đốn ngộ và giác ngộ viên mãn—giáo lý Nhất Thừa."
      }
    ]
  },
  en: {
    title: "Buddhist AI Agents",
    intro: "Specialized AI assistants grounded in Buddhist wisdom, each designed for specific aspects of spiritual practice—from gentle healing to direct awakening.",
    cards: {
      agents: {
        title: "12 Specialized Agents",
        desc: "Each agent embodies a unique approach to spiritual guidance, organized by Buddhist vehicle levels from foundational practice to ultimate realization."
      },
      models: {
        title: "Advanced Models",
        desc: "Powered by GPT-4o and GPT-5, combining cutting-edge AI with timeless dharma teachings from various Buddhist monasteries."
      },
      economics: {
        title: "Sacred Economics",
        desc: "Merit-based pricing that honors both computational reality and spiritual intention."
      }
    },
    vehicles: "Four Vehicle Levels",
    vehicleList: [
      {
        name: "Tiểu Thừa (Foundation)",
        desc: "Personal liberation through basic mindfulness, ethical conduct, and meditation. Perfect for beginners seeking peace and stress reduction."
      },
      {
        name: "Trung Thừa (Insight)",
        desc: "Deepening understanding through self-inquiry and contemplation. Exploring dependent origination and the nature of reality."
      },
      {
        name: "Đại Thừa (Bodhisattva)",
        desc: "Combining wisdom and compassion. Direct pointing to Buddha nature while cultivating the intention to help all beings."
      },
      {
        name: "Phật Thừa (Ultimate)",
        desc: "Beyond all concepts and methods. Sudden awakening and complete perfect enlightenment—the One Vehicle teaching."
      }
    ]
  }
};

export default function Overview() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
  const t = translations[language];

  const colors = ["#7bb89b", "#71b7e6", "#5f6cf1", "#f05d5e"];

  return (
      <div className="space-y-12  text-foreground">
        <div className="space-y-6 text-center border-b border-border pb-8">
            <h1 className="text-4xl font-bold">{t.title}</h1>
            <p className="text-xl italic text-muted-foreground max-w-2xl mx-auto">
            {t.intro}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 text-center hover-elevate bg-[#fdfbf7]">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">{t.cards.agents.title}</h3>
            <p className="text-muted-foreground">{t.cards.agents.desc}</p>
          </Card>

          <Card className="p-6 space-y-4 text-center hover-elevate bg-[#fdfbf7]">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">{t.cards.models.title}</h3>
            <p className="text-muted-foreground">{t.cards.models.desc}</p>
          </Card>

          <Card className="p-6 space-y-4 text-center hover-elevate bg-[#fdfbf7]">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">{t.cards.economics.title}</h3>
            <p className="text-muted-foreground">{t.cards.economics.desc}</p>
          </Card>
        </div>

        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">{t.vehicles}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.vehicleList.map((vehicle, index) => (
                <Card className="p-6 space-y-3 hover-elevate bg-[#fdfbf7]" key={index}>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors[index]}}></div>
                    <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{vehicle.desc}</p>
                </Card>
            ))}
            </div>
        </div>
      </div>
  );
}