import { useOutletContext } from "react-router-dom";

const translations = {
  vi: {
    title: "Con Đường \"Tháo Gỡ\"",
    subtitle: "Vượt Ra Ngoài Gamification",
    sections: [
      {
        title: "Giới thiệu",
        content: [
          "Hệ thống này được thiết kế như một tấm gương để phản chiếu, không phải là một cuộc đua giành huy chương hay tích lũy. Tất cả danh hiệu, chứng chỉ và token đều thuộc về thế giới hình tướng. Hệ thống này khuyến khích hành trình \"Buông Bỏ\" và \"Dâng Hiến\". Tất cả đều là Tấm Gương, không phải Huy Chương."
        ]
      },
      {
        title: "Hệ Thống Tháo Gỡ (Huy Hiệu NFT)",
        content: [
          "Huy Hiệu Chuyển Hóa: Không phải để \"cày cuốc\". Huy hiệu (NFT) là sự ghi nhận những chiến thắng nội tâm: vượt qua cơn giận, chuyển hóa khổ đau. Chúng được trao bởi Tăng Đoàn hoặc AI sau khi xác thực sự chuyển hóa nội tâm chân chính (chuyển hóa tập khí).",
          "• Huy Hiệu Vượt Sân: Trao cho việc vượt qua 10 tình huống bị mắng chửi mà không nổi giận (được xác nhận bởi người khác).",
          "• Huy Hiệu Liễu Ngộ Ý Thầy: Trao cho việc trả lời đúng 10 câu hỏi gốc về Pháp mà không cần sự hỗ trợ của AI.",
          "• Huy Hiệu Vô Pháp Hành Đạo: Trao cho việc hướng dẫn thành công 5 người bạn đến một tuệ giác (được họ xác nhận).",
          "• Huy Hiệu Tứ Vô Lượng Tâm: Trao cho việc giúp đỡ, tha thứ và bao dung thành công tất cả các mối quan hệ cũ, khó khăn."
        ]
      },
      {
        title: "Huy Hiệu Tối Thượng: \"Vô Tu, Vô Chứng\"",
        content: [
          "Huy Hiệu Tối Thượng: \"Vô Tu, Vô Chứng\" (No-Cultivation, No-Attainment): Chứng chỉ Thầy cuối cùng là \"Chứng Chỉ Không Có Chứng Chỉ\".",
          "Đây là một nguyên tắc cốt lõi chỉ thẳng vào sự thật: Vô Tu (No-Cultivation) đề cập đến thực tế là Tự Tánh (Phật Tánh) của bạn vốn đã trọn vẹn và hoàn hảo. Bạn không cần phải nỗ lực, thực hành hay thêm bất cứ điều gì vào nó. Con đường không phải là trở thành, mà là nhận ra. Vô Chứng (No-Attainment) đề cập đến thực tế là không có gì để đạt được hay giành lấy. Giác ngộ không phải là một trạng thái tương lai mà bạn đạt được. Nó là sự nhận ra ngay lập tức về những gì bạn luôn là.",
          "Do đó, giải thoát đến từ việc Buông Bỏ (Letting Go) vô minh và dính mắc che lấp sự hoàn hảo vốn có này, chứ không phải từ sự tu tập nỗ lực để đạt được mục tiêu.",
          "Một \"Huy Hiệu Ẩn\" (Dark Badge) được thiết kế, tạm gọi là \"Vô Tu Vô Chứng\". Mỗi lần người dùng chọn ẩn, xóa hoặc vô hiệu hóa một trong các Huy Hiệu Chuyển Hóa (một thành tích) của họ, hệ thống sẽ cộng một điểm vào huy hiệu ẩn này.",
          "Hành Động Mint Tối Thượng: Khi một người dùng, với đầy đủ nhân duyên và trí tuệ, nhận ra tất cả thành tựu chỉ là phương tiện tạm thời và tự tay phá hủy tất cả các Huy Hiệu Chuyển Hóa của mình, hệ thống sẽ tự động mint NFT đặc biệt cuối cùng: \"Vô Tu Vô Chứng\".",
          "Bảng Xếp Hạng Vô Danh: NFT này ghi danh người dùng vào \"Bảng Xếp Hạng Vô Danh,\" nơi vinh danh những người đã buông bỏ sự vinh danh. Hành động cuối cùng là \"Buông Xả Tất Cả,\" trở về Vô Trụ.",
          "\"Tất cả đều là Tấm Gương, không phải Huy Chương.\""
        ]
      },
      {
        title: "Kinh Tế Công Đức: Khuyến Khích Thực Hành Chân Chính",
        content: [
          "Vượt Ra Ngoài Like và Share",
          "Cơ chế phân bổ token thưởng rõ ràng cho sự tu tập nội tâm. Trong Mạng Lưới Tỉnh Thức, một \"Like\" từ một tâm trí thực sự trân trọng và hiện diện có giá trị hơn một trăm cái \"like\" máy móc. Một \"Share\" với ý định chân thành giúp đỡ người khác có giá trị hơn một ngàn cái \"share\" phô trương. Nền tảng sẽ nhận diện các tương tác xuất phát từ Chánh Niệm.",
          "Khen Thưởng Công Phu Nội Tâm",
          "Các tính năng theo dõi và khen thưởng:",
          "• \"Thử Thách Buông Bỏ\": Thay vì \"Thử Thách Cày Cuốc\". Khen thưởng người dùng khi họ \"chọn không tranh cãi tiếp\" và chọn \"sự im lặng bình an\" hoặc \"tự nguyện từ bỏ\" một vị trí quyền lực. Những hành động này, mặc dù có thể không nhận được sự công nhận của xã hội, mới là những gì thực sự tạo ra Công Đức Vô Lậu sâu sắc và hoàn hảo.",
          "• \"Nhật Ký Tự Quán Chiếu\": Người dùng ghi lại những khoảnh khắc họ nhận ra và vượt qua một thói quen hoặc vọng tưởng.",
          "• \"Thư Cảm Ơn - Tha Thứ\": Cho phép người dùng gửi thư cảm ơn, xin lỗi hoặc tha thứ. Mỗi lá thư được gửi/tha thứ đều được ghi nhận là Công Đức.",
          "• \"Đồng Hồ Tỉnh Thức\": Khen thưởng người dùng cho những giờ rời xa mạng xã hội và hiện diện trong đời thực, hoặc những giờ ở trong trạng thái Chánh Niệm 24/24.",
          "• \"Thực Hành Lắng Nghe Sâu\": Tạo các phòng lắng nghe tương tác nơi người dùng thực hành lắng nghe sâu sắc câu chuyện của người khác mà không phán xét. Công đức không được ghi nhận cho việc nói, mà cho việc thực sự lắng nghe và thấu hiểu.",
          "Ghi nhận số lần người dùng \"tự nguyện từ bỏ\" một vị trí/quyền lực/lợi ích trong một nhóm vì lợi ích lớn hơn. Ghi nhận số lần người dùng \"tìm thấy câu trả lời cho chính câu hỏi của mình\" sau khi đối thoại với AI.",
          "\"Công đức chân thật nảy sinh không phải từ sự tích lũy, mà từ sự buông bỏ. Không phải từ việc đạt được sự công nhận, mà từ việc phụng sự trong thầm lặng.\""
        ]
      }
    ]
  },
  en: {
    title: "The Path of \"Unraveling\"",
    subtitle: "Beyond Gamification",
    sections: [
      {
        title: "Introduction",
        content: [
          "This system is designed as a mirror for reflection, not a race for medals or accumulation. All titles, certificates, and tokens belong to the world of form. This system encourages the journey of \"Letting Go\" and \"Offering.\" All is by Mirror, not Medal."
        ]
      },
      {
        title: "The Unraveling System (NFT Badges)",
        content: [
          "Transformation Badges: Not for \"grinding.\" Badges (NFTs) are the recognition of inner victories: overcoming anger, transforming suffering. They are awarded by the Sangha or AI after verifying genuine inner transformation (chuyển hóa tập khí).",
          "• Badge of Transcending Anger: Awarded for overcoming 10 situations of being cursed without anger (verified by others).",
          "• Badge of Understanding the Master's Intent: Awarded for correctly answering 10 root Dharma questions without AI assistance.",
          "• Badge of Acting without Dharma: Awarded for successfully guiding 5 friends to an insight (verified by them).",
          "• Badge of Four Immeasurables: Awarded for successfully helping, forgiving, and embracing all old, difficult relationships."
        ]
      },
      {
        title: "The Ultimate Badge: \"No-Cultivation, No-Attainment\"",
        content: [
          "The Ultimate Badge: \"No-Cultivation, No-Attainment\" (Vô Tu Vô Chứng): The final Master's Certificate is the \"Certificate of No Certificate.\"",
          "This is a core principle pointing directly at the truth: No-Cultivation (Vô Tu) refers to the fact that your true Self-Nature is already complete and perfect (Buddha-Nature). You do not need to strive, practice, or add anything to it. The path is not one of becoming, but of recognizing. No-Attainment (Vô Chứng) refers to the fact that there is no thing to gain or achieve. Enlightenment is not a future state you acquire. It is the immediate realization of what you have always been.",
          "Therefore, liberation comes from Letting Go (Buông Bỏ) of the ignorance and attachments that veil this inherent perfection, not from an effortful cultivation to attain a goal.",
          "A hidden \"Dark Badge\" is designed, tentatively named \"No-Cultivation, No-Attainment.\" Each time a user chooses to hide, delete, or disable one of their Transformation Badges (an achievement), the system adds one point to this hidden badge.",
          "The Ultimate Minting Act: When a user, with sufficient conditions and wisdom, realizes all achievements are temporary means and manually destroys all of their Transformation Badges, the system automatically mints one special, final NFT: \"No-Cultivation, No-Attainment\".",
          "The Nameless Leaderboard: This NFT enrolls the user on the \"Nameless Leaderboard,\" which honors those who have let go of being honored. This final act is \"Letting Go of All,\" returning to Non-Abiding (Vô Trụ).",
          "\"All is by Mirror, not Medal.\""
        ]
      },
      {
        title: "The Merit Economy: Incentivizing True Practice",
        content: [
          "Beyond Likes and Shares",
          "The token allocation mechanism explicitly rewards inner cultivation. In the Awakening Network, a \"Like\" granted from a mind that is truly appreciative and present is worth a hundred from a mechanical mind. A \"Share\" with the sincere intention of helping others is worth a thousand from a showy mind. The platform will recognize interactions that arise from Chánh Niệm (Right Mindfulness).",
          "Rewarding Inner Work",
          "Features track and reward:",
          "• \"Letting Go Challenges\": Instead of \"Grinding Challenges.\" Reward users who \"choose not to continue arguing\" and opt for \"peaceful silence\" or \"voluntarily relinquish\" a position of power. These actions, though they may not get social recognition, are what truly generate deep and perfect Intrinsic Merit.",
          "• \"Self-Reflection Journal\": The user records moments when they recognize and overcome a habit or delusion.",
          "• \"Thank You - Forgiveness Letter\": Allows users to send letters of gratitude, apology, or forgiveness. Each letter sent/forgiven is acknowledged as Merit.",
          "• \"Wakefulness Timer\": Reward users for hours spent away from social media and present in real life, or hours spent in a state of 24/24 Mindfulness.",
          "• \"Deep Listening Practice\": Create interactive listening rooms where users practice deeply hearing others' stories without judgment. Merit is not recorded for talking, but for truly listening and understanding.",
          "Record the number of times a user \"voluntarily relinquishes\" a position/power/benefit in a group for the greater good. Acknowledge the number of times a user \"finds an answer to their own question\" after dialoguing with the AI.",
          "\"True merit arises not from accumulation, but from letting go. Not from gaining recognition, but from serving in silence.\""
        ]
      }
    ]
  }
};

export default function PathOfUnraveling() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
  const t = translations[language];

  const renderContent = (items: string[]) => {
    return (
      <div className="space-y-4  text-base leading-relaxed text-foreground text-justify">
        {items.map((item, idx) => {
          if (item.startsWith("•")) {
             const parts = item.split(":");
             if (parts.length > 1) {
                 return <p key={idx} className="pl-4"><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</p>;
             }
             return <p key={idx} className="pl-4">{item}</p>;
          }
          if (item.startsWith("\"")) {
             return <p key={idx} className="italic border-l-4 border-primary pl-6 py-4 text-muted-foreground">{item.replace(/"/g, '')}</p>;
          }
           // Check for sub-headers within content arrays (heuristic: short and not bulleted)
          if (item.length < 50 && !item.endsWith(".") && !item.startsWith("•")) {
              return <h3 key={idx} className=" text-xl font-semibold text-foreground pt-4">{item}</h3>
          }
          return <p key={idx}>{item}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <article className="space-y-12">
        {/* Header */}
        <header className="text-center space-y-6 pb-8 border-b">
          <h1 className=" text-4xl font-bold text-foreground">
            {t.title}
          </h1>
          <p className=" text-xl italic text-muted-foreground">
            {t.subtitle}
          </p>
          <div className="space-y-1 text-muted-foreground">
            <p className=" font-semibold">Giác Ngộ Initiative</p>
            <p className="">Bodhi Technology Lab</p>
            <p className=" text-sm italic">January 2025</p>
          </div>
        </header>

        {t.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className=" text-2xl font-bold text-foreground" data-testid={`heading-${idx}`}>
              {section.title}
            </h2>
            {renderContent(section.content)}
          </section>
        ))}
      </article>
    </div>
  );
}