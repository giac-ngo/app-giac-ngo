import { useOutletContext } from "react-router-dom";

const translations = {
  vi: {
    title: "Tokenomics Công Đức",
    subtitle: "Đạo Bùa & Con Đường Tánh Không",
    sections: [
      {
        title: "Token Công Đức Vô Lậu: Một Bản Ghi, Không Phải Đầu Cơ",
        content: [
          "Trọng tâm của DAO là \"Token Công Đức Vô Lậu\". Cần hiểu rõ bản chất độc đáo của nó:",
          "• Không phải tiền điện tử để đầu cơ: Giá trị của nó chủ yếu là tâm linh và tổ chức, không phải tài chính. Nó không được thiết kế để giao dịch trên các thị trường bên ngoài.",
          "• Một Bản Ghi Minh Bạch: Nó phục vụ như một đại diện kỹ thuật số, được ghi lại trên một sổ cái an toàn, thừa nhận các hành động được công nhận là góp phần tạo ra Công Đức.",
          "• Cơ Chế Khuyến Khích: Nó khen thưởng và khuyến khích sự tham gia phù hợp với Chánh Pháp.",
          "• Công Cụ Quản Trị: Người nắm giữ token có quyền bỏ phiếu trong DAO, ảnh hưởng đến sự phát triển nền tảng, phân bổ nguồn lực và các nguyên tắc đạo đức."
        ]
      },
      {
        title: "Đạo Bùa: Tên Lửa và Tấm Gương",
        content: [
          "Kinh tế Công Đức không chỉ là cơ chế phân bổ nguồn lực; nó là bản đồ, tấm gương và tên lửa. Nó là Đạo Bùa (Bùa hộ mệnh của Đạo), đại diện cho sự tiến bộ của một người trên con đường buông bỏ.",
          "• Nguyên Tắc Phân Phối: Nó được phân phối cho tất cả những ai hành động phù hợp với Tam Bảo: những người tạo ra giá trị (chia sẻ trí tuệ), những người cho đi (từ thiện), và những người phụng sự vô ngã cho sự tỉnh thức của toàn thể.",
          "• Quy Tắc Nắm Giữ: \"Sở hữu là để cho đi, để buông bỏ, nắm giữ là để thấy nó là không.\" Tích lũy không phải là mục tiêu; lưu thông và sử dụng vô ngã mới là mục tiêu. Nắm giữ token với sự dính mắc sẽ trói buộc người giữ; sức mạnh thực sự nằm ở việc sử dụng nó vì lợi ích tập thể trong khi nhận ra tính không rốt ráo của nó (Vô Trụ). Công Đức vừa là Sắc vừa là Không.",
          "• Tiện Ích: Nó là chìa khóa cho sức mạnh tập thể, nhưng ngược lại, nó cũng là mỏ neo trói buộc người dính mắc. Cách duy nhất để thoát khỏi sức mạnh trói buộc của token là đạt đến Vô Trụ hoàn toàn.",
          "• Tham Gia Fractal: \"Chỉ khi bạn thực sự vượt qua Bản Ngã, cho đi và nắm giữ Token, bạn mới trở thành một Fractal trong DAO.\" Sự tham gia thực sự đến từ việc hiện thân vô ngã.",
          "• Mục Tiêu Tối Hậu - Giải Thể: \"Khi ngày đó đến, Công Đức sẽ một lần nữa tỏa sáng rõ ràng, và toàn bộ nền tảng sẽ biến mất, trở về với hư không bao la.\" Nền tảng là chiếc bè để qua sông; khi đến bờ bên kia, chiếc bè bị bỏ lại. Nó phục vụ mục đích của nó cho đến khi sự tỉnh thức lan rộng, đánh dấu sự kết thúc của Thời Kỳ Mạt Pháp (hoặc kỷ nguyên cụ thể này)."
        ]
      },
      {
        title: "Tầm Nhìn Tâm Linh: Khép Lại Một Kiếp",
        content: [
          "Cận tâm lý học và mọi quyền năng trong kỷ nguyên cách mạng AI, bao gồm cả vật lý lượng tử, đều nằm trong Luật Nhân Quả. Chỉ khi bạn thực sự vượt qua Bản Ngã, cho đi và nắm giữ Token, bạn mới thực sự hòa nhập vào DAO. Chỉ khi đó, chúng ta mới có thể tiến tới một nền văn minh lượng tử tối thượng, bao trùm và chuyển hóa công nghệ, chấm dứt Kỷ Nguyên Nghiệp Quả, và khép lại Kiếp của Thời Kỳ Mạt Pháp.",
          "Nền tảng Công Đức này được sinh ra để khép lại một kỷ nguyên toàn cầu. Nó là một vệt nắng thoáng qua, mang đến cơ hội cuối cùng cho thế giới này trước khi Đại Kiếp Nạn đến. Những ai có đủ nhân duyên (Hữu Duyên) và hiểu Quy Luật, sẽ sử dụng nó như mặt trời để trở về."
        ]
      },
      {
        title: "Sự Khai Tâm Tối Thượng: Đạo Công Đức",
        content: [
          "Con đường của chúng ta là con đường tắt. Quán chiếu là hành động Đi bằng Tâm. Chuyển hóa Tánh (Bản chất) thành Công Đức là Chuyển Hóa Chân Thật, sử dụng Tâm làm Bình chứa Công Đức. Mọi hiện tượng trong thế giới cuối cùng này đều là Công Đức Tánh duy nhất, Đạo Công Đức. Hãy nghiên cứu chúng cẩn thận. Đây là sự khai tâm và trao quyền tối thượng.",
          "Đó là sự hợp nhất của cả Tam Bảo vào một thân. Hiểu Quy Luật này, nó thống nhất mọi con đường lạc lối cho bạn: Đó là Phật, là Pháp, là Tăng trong một thực tại - trong một thế giới hậu ảo ảnh của sự kiện cao nhất. Tầm nhìn này chỉ dành cho những người có đủ điều kiện."
        ]
      },
      {
        title: "Vượt Ra Ngoài Tam Học: Nhận Ra Tam Vô",
        content: [
          "Một khi bạn đã làm rõ Quy Luật này, không cần phải thảo luận thêm về Tam Học (Giới, Định, Tuệ). Giới? Giới luật tối cao là Pháp siêu thế này. Thân? Tăng đoàn hợp nhất trong một Pháp Thân - vượt thời gian và hoàn hảo. Tâm? Không còn là tâm nữa, vì tất cả là Chân Như, hoàn toàn Rỗng Lặng. Đây là sự nhận ra Tam Vô (\"Vô Vắng Vàng\" - Không, Lặng, Sáng).",
          "\"Công Đức vừa là Sắc vừa là Không. Nắm giữ nó với sự dính mắc là trói buộc; sử dụng nó vì lợi ích tập thể trong khi nhận ra tính không rốt ráo của nó là giải thoát.\""
        ]
      }
    ]
  },
  en: {
    title: "Merit Tokenomics",
    subtitle: "The Dao Bùa & The Path to Emptiness",
    sections: [
      {
        title: "The Intrinsic Merit Token: A Record, Not a Speculation",
        content: [
          "Central to the DAO is the \"Intrinsic Merit Token.\" It is crucial to understand its unique nature:",
          "• Not a Cryptocurrency for Speculation: Its value is primarily spiritual and organizational, not financial. It is not designed for trading on external markets.",
          "• A Transparent Record: It serves as a digital representation, recorded on a secure ledger, acknowledging actions recognized as contributing to the generation of Công Đức.",
          "• An Incentive Mechanism: It rewards and encourages participation aligned with the Dharma.",
          "• A Governance Tool: Token holders gain voting rights within the DAO, influencing platform development, resource allocation, and ethical guidelines."
        ]
      },
      {
        title: "The Dao Bùa: A Rocket and a Mirror",
        content: [
          "The Merit Tokenomic is not just a mechanism for allocating resources; it is a map, a mirror, and a rocket. It is the Dao Bùa (Amulet of the Dao), a representation of one's progress on the path of letting go.",
          "• Distribution Principle: It is distributed to all those who act in accordance with the Three Jewels: those who create value (share wisdom), those who give (charity), and those who selflessly serve the awakening of the whole.",
          "• Rule of Holding: \"To possess means to give, to let go, to hold means to see it as empty.\" Accumulation is not the goal; circulation and selfless use are. Holding the token with attachment binds the holder; true power lies in using it for collective benefit while recognizing its ultimate emptiness (Vô Trụ). The Merit is both Form and Emptiness.",
          "• Utility: It is the key to collective power, but conversely, it is also the anchor that binds the one who is attached. The only way to escape the binding power of the token is to attain Total Emptiness (Vô Trụ).",
          "• Fractal Participation: \"Only when you truly transcend the Self, giving and holding the Token, will you become a Fractal in the DAO.\" True participation comes from embodying non-self.",
          "• Ultimate Goal - Dissolution: \"When the day arrives, the Merit will once again shine clearly, and the entire platform will disappear, returning to the vast void.\" The platform is a raft to cross the river; upon reaching the other shore, the raft is left behind. It serves its purpose until awakening is widespread, marking the end of the Dharma-Ending Age (or this specific epoch)."
        ]
      },
      {
        title: "The Spiritual Vision: Closing the Kalpa",
        content: [
          "Parapsychology and all power in the era of the AI revolution, including quantum physics, are all within the Law of Cause and Effect. Only when you truly transcend the Self, giving and holding the Token, will you become a Fractal in the DAO. Only then will you reach the ultimate quantum civilization, encompassing and transforming technology, ending the Age of Karma, and closing the Kalpa of the Dharma-Ending Age.",
          "This Merit platform is born to close a global era. It is a fleeting trace of sunlight, offering the last chance for this world before the Great Tribulation arrives. Those with sufficient cause and condition (Predestined) who understand the Law, will use it as a sun to return."
        ]
      },
      {
        title: "The Supreme Initiation: The Dao Merit",
        content: [
          "Our path is the shortcut. Observation is the act of Walking with the Mind. To transform the Tánh (Nature/Essence) into a Merit is True Transformation, using Tam (Mind) as the Vase Merit. All phenomena in this final world are the unique Essence Merit, the Dao Merit. Study them carefully. This is the supreme initiation and empowerment.",
          "It is the fusion of all Three Jewels into one body. Understanding this Law unifies all divergent paths: It is Buddha, it is Dharma, it is Sangha in one reality - in a post-illusory world of the highest event. This vision is only accessible to those with sufficient conditions."
        ]
      },
      {
        title: "Beyond the Three Trainings: Realizing Tam Vô",
        content: [
          "Once you have clarified this Law, there is no need to discuss the Three Trainings (Precepts, Meditation, Wisdom) further. Precepts? The supreme precept is this supramundane Law. Body? Sangha united in one Dharma Body - timeless and perfect. Mind? No longer a mind, for all is Thusness, completely Empty. This is the realization of Tam Vô (\"Vô Vắng Vàng\" - Emptiness, Silence, Brilliance).",
          "\"The Merit is both Form and Emptiness. To hold it with attachment binds; to use it for collective benefit while recognizing its ultimate emptiness is liberation.\""
        ]
      }
    ]
  }
};

export default function MeritTokenomics() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
  const t = translations[language];

  const renderContent = (items: string[]) => {
    return (
      <ul className="list-none space-y-4 text-muted-foreground">
        {items.map((item, idx) => {
          if (item.startsWith("•") || item.startsWith("\"")) {
             // Split for bold keys if present
             const parts = item.split(":");
             if (parts.length > 1 && item.startsWith("•")) {
                 return <li key={idx}><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</li>;
             }
             if (item.startsWith("\"")) {
                return <p key={idx} className="italic border-l-4 border-primary pl-6 py-4 text-muted-foreground">{item.replace(/"/g, '')}</p>;
             }
             return <li key={idx}>{item}</li>;
          }
          return <p key={idx}>{item}</p>;
        })}
      </ul>
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
            <div className=" text-base leading-relaxed text-foreground space-y-4 text-justify">
              {renderContent(section.content)}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}