import { useOutletContext } from "react-router-dom";

const translations = {
  vi: {
    title: "Mandala Công Đức",
    subtitle: "Hướng tới một DAO Tỉnh Thức",
    intro: [
      "Tầm nhìn tối hậu là dần dần buông bỏ mọi sự kiểm soát tập trung và trao quyền hệ sinh thái cho trí tuệ tập thể của một cộng đồng tỉnh thức. Mọi hành động – một bài viết sâu sắc, một câu trả lời hữu ích, một hành động Bố thí (Dana) vô ngã – đều được ghi nhận là công đức, không phải là \"sức ảnh hưởng\".",
      "Quyền lực và quản trị được quyết định không phải bởi sự đầu cơ, mà bởi đức hạnh thực sự của mỗi linh hồn. Các bản ghi về hành động, công đức và sự tự vượt thắng bản thân sẽ dẫn dắt cộng đồng. \"Phi tập trung\" thực sự không chỉ là kỹ thuật: đó là sự nhận ra rằng mỗi người là Trung tâm và mỗi người là Toàn thể. Sự lãnh đạo xuất hiện, tan biến và được tái hình thành theo dòng chảy của công đức."
    ],
    token: {
      title: "Token Công Đức Vô Lậu",
      content: [
        "\"Token Công Đức Vô Lậu\" được giới thiệu không phải là một loại tiền điện tử để đầu cơ, mà là một token kỹ thuật số ghi lại minh bạch và khuyến khích các hành động tạo ra công đức: bài viết sâu sắc, hành động từ thiện, giờ phụng sự. Người nắm giữ token có quyền bỏ phiếu trong các quyết định cộng đồng, ngân sách và định hướng dự án, đảm bảo rằng nền tảng luôn phục vụ Chánh Pháp và Tăng Đoàn, không phải lợi ích cá nhân. Mục tiêu là sự tin cậy và minh bạch hoàn toàn.",
        "Quyền kiểm soát và ra quyết định hoàn toàn được trao cho DAO, nơi ghi lại kỹ thuật số mọi Nghiệp Lành để loại bỏ sự phụ thuộc tiền tệ của Tăng Đoàn mãi mãi và củng cố sức mạnh của Tăng Đoàn để đồng lòng. Token Đạo Công Đức độc đáo này được chuyển giao cho di sản của các bậc Thánh, một nơi để phụng sự vô lượng Chư Phật và phục hồi Pháp Thân cho các thế hệ mai sau."
      ]
    },
    governance: {
      title: "Nguyên Tắc Quản Trị",
      meritBased: {
        title: "Ra Quyết Định Dựa Trên Công Đức",
        text: "Trong DAO Tỉnh Thức, quyền quản trị đến từ sự đóng góp tâm linh chân chính, không phải đầu cơ tài chính. Mỗi token đại diện cho một bản ghi có thể xác minh về các hành động tạo công đức – giảng dạy, cho đi, phụng sự, chuyển hóa khổ đau. Điều này tạo ra một cấu trúc khuyến khích phù hợp với Chánh Pháp."
      },
      transparency: {
        title: "Vận Hành Minh Bạch",
        text: "Mọi quyết định của nền tảng, phân bổ nguồn lực và phân phối công đức đều được ghi lại trên một sổ cái bất biến. Các thành viên cộng đồng có thể kiểm toán mọi giao dịch, đảm bảo hệ sinh thái luôn trung thành với sứ mệnh tâm linh của nó. Không có chương trình nghị sự ẩn, không có thỏa thuận ngầm – chỉ có ánh sáng rõ ràng của sự minh bạch."
      },
      wisdom: {
        title: "Trí Tuệ Tập Thể",
        text: "DAO nhận ra rằng trí tuệ nảy sinh từ tập thể, không phải từ một thẩm quyền đơn lẻ. Các quyết định lớn được đưa ra thông qua sự đồng thuận của cộng đồng, được trọng số bởi sự đóng góp công đức. Điều này đảm bảo rằng những người đã chứng minh cam kết với sự tỉnh thức có tiếng nói trong việc hướng dẫn sự phát triển của nền tảng."
      }
    },
    path: {
      title: "Con Đường Phía Trước",
      text: [
        "DAO Tỉnh Thức không phải là trạng thái cuối cùng mà là một quá trình sống động. Khi cộng đồng trưởng thành trong thực hành và hiểu biết, các cấu trúc quản trị sẽ phát triển. Những gì bắt đầu như sự quản lý có hướng dẫn sẽ dần dần tan biến thành sự tự tổ chức tập thể thực sự.",
        "Đây là nghịch lý lớn: chúng ta xây dựng các thể chế được thiết kế để tự giải thể. DAO thành công nhất là DAO tự làm cho mình trở nên lỗi thời, sau khi đã hoàn thành mục đích đánh thức tập thể. Khi ngày đó đến, Mandala sẽ tỏa sáng rõ ràng, và nền tảng sẽ trở về với tánh không bao la nơi nó sinh ra."
      ],
      quote: "\"Phi tập trung thực sự không chỉ là kỹ thuật: đó là sự nhận ra rằng mỗi người là Trung tâm và mỗi người là Toàn thể.\""
    }
  },
  en: {
    title: "The Mandala of Merit",
    subtitle: "Towards a DAO of Awakening",
    intro: [
      "The ultimate vision is to gradually dissolve all centralized control and surrender the ecosystem to the collective wisdom of an awakened community. Every action – a wise post, a helpful answer, a selfless act of Dana – is recorded as merit, not as \"influence.\"",
      "Power and governance are decided not by speculation, but by the true virtue of each soul. Records of actions, merit, and self-transcendence guide the community. True \"decentralization\" is not just technical: it is the realization that each is the Center and Each is the Whole. Leadership emerges, dissolves, and is re-formed as the flow of merit dictates."
    ],
    token: {
      title: "The Intrinsic Merit Token",
      content: [
        "The \"Intrinsic Merit Token\" is introduced not as a cryptocurrency for speculation, but as a digital token that transparently records and incentivizes merit-generating actions: insightful posts, acts of charity, hours of service. Token holders gain voting rights in community decisions, budgeting, and project direction, ensuring that the platform always serves the Dharma and the Sangha, not private interests. Complete trustlessness and transparency is the goal.",
        "Total control and decision making is powered by DAO, which digitally records all Good Karma to forever eliminate Tăng Đoàn's (Sangha's) monetary dependence and consolidate the power of Tăng Đoàn to unite with one heart. This unique Dao Token Merit is passed on to the legacy of the Sainthood, a place to serve infinite Buddhas and regain the Dharma Body for generations to come."
      ]
    },
    governance: {
      title: "Governance Principles",
      meritBased: {
        title: "Merit-Based Decision Making",
        text: "In the Awakened DAO, governance power flows from genuine spiritual contribution, not financial speculation. Each token represents a verifiable record of merit-generating actions – teaching, giving, serving, transforming suffering. This creates an incentive structure aligned with the Dharma itself."
      },
      transparency: {
        title: "Transparent Operations",
        text: "All platform decisions, resource allocations, and merit distributions are recorded on an immutable ledger. Community members can audit every transaction, ensuring that the ecosystem remains true to its spiritual mission. There are no hidden agendas, no backroom deals – only the clear light of transparency."
      },
      wisdom: {
        title: "Collective Wisdom",
        text: "The DAO recognizes that wisdom emerges from the collective, not from any single authority. Major decisions are made through community consensus, weighted by merit contribution. This ensures that those who have demonstrated commitment to awakening have a voice in guiding the platform's evolution."
      }
    },
    path: {
      title: "The Path Forward",
      text: [
        "The Awakened DAO is not an end state but a living process. As the community matures in practice and understanding, governance structures will evolve. What begins as guided stewardship will gradually dissolve into true collective self-organization.",
        "This is the great paradox: we build institutions designed to dissolve themselves. The most successful DAO is one that makes itself obsolete, having fulfilled its purpose of awakening the collective. When that day comes, the Mandala will shine clearly, and the platform will return to the vast void from which it arose."
      ],
      quote: "\"True decentralization is not just technical: it is the realization that each is the Center and Each is the Whole.\""
    }
  }
};

export default function MandalaMerit() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
  const t = translations[language];

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

        {/* Introduction */}
        <section className="space-y-4">
          <div className=" text-base leading-relaxed text-foreground space-y-4 text-justify">
            {t.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>

        {/* The Intrinsic Merit Token */}
        <section className="space-y-4">
          <h2 className=" text-2xl font-bold text-foreground" data-testid="heading-merit-token">
            {t.token.title}
          </h2>
          <div className=" text-base leading-relaxed text-foreground space-y-4 text-justify">
            {t.token.content.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>

        {/* Governance Principles */}
        <section className="space-y-4">
          <h2 className=" text-2xl font-bold text-foreground" data-testid="heading-governance">
            {t.governance.title}
          </h2>
          <div className=" text-base leading-relaxed text-foreground space-y-4 text-justify">
            <h3 className=" text-xl font-semibold text-foreground pt-4">
              {t.governance.meritBased.title}
            </h3>
            <p>{t.governance.meritBased.text}</p>

            <h3 className=" text-xl font-semibold text-foreground pt-4">
              {t.governance.transparency.title}
            </h3>
            <p>{t.governance.transparency.text}</p>

            <h3 className=" text-xl font-semibold text-foreground pt-4">
              {t.governance.wisdom.title}
            </h3>
            <p>{t.governance.wisdom.text}</p>
          </div>
        </section>

        {/* The Path Forward */}
        <section className="space-y-4">
          <h2 className=" text-2xl font-bold text-foreground" data-testid="heading-path-forward">
            {t.path.title}
          </h2>
          <div className=" text-base leading-relaxed text-foreground space-y-4 text-justify">
            {t.path.text.map((p, i) => <p key={i}>{p}</p>)}
            <p className="italic border-l-4 border-primary pl-6 py-4 text-muted-foreground">
              {t.path.quote}
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}