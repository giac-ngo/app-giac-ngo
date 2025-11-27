import { useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";

const translations = {
  vi: {
    title: "Kiến trúc Công nghệ Tỉnh thức",
    subtitle: "Giác Ngộ Tech Stack",
    sections: [
      {
        id: "vision", // Fixed ID to match DocsNav
        title: "Tầm nhìn & Sứ mệnh",
        content: [
          "Tầm nhìn: Trở thành cộng đồng kỹ thuật số đầu tiên, sâu sắc nhất thế giới, nơi tâm linh gặp gỡ công nghệ; nơi mọi tương tác, mọi tuệ giác được chia sẻ, đều là cơ hội để tạo ra Công Đức Vô Lậu và thúc đẩy sự tỉnh thức tập thể.",
          "Sứ mệnh: Cung cấp các công cụ, lời dạy, và một cộng đồng nuôi dưỡng để hỗ trợ các cá nhân và Tăng Đoàn (cộng đồng tâm linh) trên hành trình giác ngộ. Làm sáng tỏ Công Đức Vô Lậu (Công Đức) và biến nó thành thước đo trung tâm của một nền văn minh mới, ý thức hơn. Xây dựng liên minh với tất cả các truyền thống tôn vinh cùng một Chân Lý Bất Nhị."
        ]
      },
      {
        id: "compute", // Fixed ID to match DocsNav
        title: "Nền tảng: Mandala Tính toán Tập thể",
        content: [
          "Hệ sinh thái Giác Ngộ được xây dựng trên một mạng lưới toàn cầu gồm các nút tính toán phi tập trung off-chain, hoạt động như một siêu máy tính tập thể.",
          "Triết lý của chúng tôi bắt đầu bằng việc từ chối các nền tảng tập trung. \"Căn bệnh của Thời đại số\" được thúc đẩy bởi các trang trại GPU tập trung (AWS, Google Cloud), được thiết kế để \"khai thác tâm trí con người\" như một hàng hóa. Để xây dựng một \"con thuyền kỹ thuật số thiêng liêng\", chúng ta phải xây dựng trên một nền tảng không có một thực thể cai trị duy nhất. Cơ sở hạ tầng phi tập trung này cung cấp nền tảng kỹ thuật hoàn hảo, song song với triết lý của chúng tôi:",
          "• Phá Chấp Ngã (Breaking Centralization): Bằng cách tận dụng khả năng tính toán gộp của các nút do người dùng độc lập vận hành, chúng tôi phá vỡ sự phụ thuộc vào các máy chủ trung tâm, giống như Giác Ngộ phá vỡ sự phụ thuộc vào \"cái tôi thế tục\".",
          "• Pháp Thân Biến Mãn (Elastic Scalability): Nền tảng có tính đàn hồi theo mặc định. Nó có thể bùng nổ ngay lập tức trên hàng ngàn nút cho các công việc nặng (như đào tạo AI) và quan trọng là, thu nhỏ về không khi nhàn rỗi. Điều này phản ánh bản chất của Tâm: hiện diện mạnh mẽ khi cần thiết, hoàn toàn tĩnh lặng khi không.",
          "• Tận Dụng Duyên Lành (Sustainable Primitives): Mạng lưới tận dụng sức mạnh tính toán nhàn rỗi, sử dụng các nguồn lực hiện có, thường không được sử dụng hết. Nguyên tắc không lãng phí này làm giảm tổng năng lượng trên mỗi tác vụ hữu ích và phù hợp với Chánh Pháp, biến tiềm năng (duyên) tiềm ẩn của thế giới thành một công cụ để tỉnh thức."
        ]
      },
      {
        id: "ledger", // Fixed ID to match DocsNav
        title: "Lớp Giao thức 1: Sổ cái Mandala",
        subtitle: "Tận dụng Sổ cái Off-Chain có thể xác minh",
        content: [
          "Dòng chảy Tỉnh thức, Thư viện Pháp và hồ sơ công đức của mỗi hành giả tạo ra một lượng dữ liệu khổng lồ không thể lưu trữ hoàn toàn on-chain.",
          "Chúng tôi tận dụng các sổ cái off-chain có thể xác minh. Toàn bộ lịch sử của trí tuệ được chia sẻ, pháp thoại và các hành động tạo công đức được tổ chức dưới dạng cấu trúc Dữ liệu Acyclic (DAG). Các cấu trúc này sau đó được neo một cách đáng tin cậy vào blockchain, tạo ra các đường ray có thể xác minh cho hệ sinh thái của chúng tôi.",
          "Điều này cho phép Giác Ngộ duy trì một bản ghi bất biến về trí tuệ tập thể và lịch sử công đức—Sổ cái Mandala của chúng tôi—mà không hy sinh tốc độ hoặc chi phí."
        ]
      },
      {
        id: "protocol", // Fixed ID to match DocsNav
        title: "Lớp Giao thức 2: Giao thức Ghi nhận Công đức",
        subtitle: "Sự mở rộng tâm linh của Tính toán có thể xác minh",
        content: [
          "Nền kinh tế của mạng lưới được xây dựng trên một giao thức ghi nhận tính toán và uy tín—một tiêu chuẩn phổ quát để thưởng cho các nút dựa trên bằng chứng tính toán có thể xác minh.",
          "Hệ sinh thái Giác Ngộ mở rộng triết lý này lên một lớp cao hơn, tạo ra Giao thức Ghi nhận Công đức:",
          "• Giao thức Tính toán (Lớp Kỹ thuật): Xác minh các hành động kỹ thuật. Ví dụ: \"Nút này có thực sự lưu trữ và phục vụ bài pháp thoại này không?\"",
          "• Giao thức Công đức (Lớp Tâm linh): Xác minh ý định và chất lượng của một hành động. Ví dụ: \"Hành động 'Thích' này có chánh niệm không?\" \"Hành động 'Tháo gỡ' Huy hiệu NFT này có phải là một hành động buông bỏ thực sự không?\"",
          "Giao thức của mạng lưới cung cấp sự không cần tin cậy (trustlessness) cho phần cứng. Giao thức Công đức của chúng tôi cung cấp sự minh bạch cho Tâm. Tokenomics Mandala của chúng tôi không thể bị đầu cơ vì nó được neo vào cả bằng chứng tính toán có thể xác minh và sự chuyển hóa tâm linh có thể xác minh (chứng thực)."
        ]
      },
      {
        id: "primitives", // Fixed ID to match DocsNav
        title: "Các Thành phần Cơ bản: Xây dựng trên Siêu máy tính Tập thể",
        content: [
          "Chúng tôi không xây dựng các chức năng cốt lõi của mình từ đầu. Chúng tôi xây dựng các trụ cột của mình bằng cách triển khai các tác vụ lên các Thành phần Cơ bản (Primitives) của mạng lưới.",
          "• Tam Thừa AI (Decentralized AI): Các Trợ lý Giác Ngộ (Tâm An, Giác Ngộ, Đốn Ngộ) không phải là các mô hình độc quyền trên máy chủ trung tâm. Chúng được triển khai như các vi dịch vụ suy luận đàn hồi có thể thu nhỏ về không. Trí tuệ của chúng được tinh chỉnh (ví dụ: LoRA / tinh chỉnh phân tán) dựa trên giáo lý Chánh Pháp sử dụng các nút gộp. Điều này thân thiện với mô hình mở (hỗ trợ HF, PyTorch, v.v.) và làm cho Chánh Pháp không bị kiểm duyệt.",
          "• Đài Quan Sát Pháp (Verifiable Storage): Toàn bộ Thư viện Trí tuệ được lưu trữ bằng các thành phần lưu trữ phi tập trung. Chúng tôi sử dụng các đường ống media của mạng lưới (để phiên âm, dịch thuật và thị giác) và RAG ở quy mô lớn (thu thập, nhúng, lập chỉ mục) để làm cho tất cả các bài pháp thoại có thể tìm kiếm và truy cập được đối với các Trợ lý AI, đảm bảo những lời dạy vượt thời gian được bảo tồn vĩnh viễn.",
          "• DAO Giác Ngộ (Trustless Reputation): Hệ thống quản trị của chúng tôi được neo vào các đường ống có thể xác minh của mạng lưới. Khi người dùng thực hiện một hành động tạo công đức (được xác minh bởi Giao thức Công đức của chúng tôi), hành động đó được ghi lại qua Sổ cái Mandala và nhận được một chứng thực có thể xác minh. Điều này tạo ra một hệ thống quản trị thực sự không cần tin cậy, nơi Dao Token là một bản ghi minh bạch về công đức, không phải là một tài sản tài chính có thể giao dịch."
        ]
      },
      {
        id: "privacy", // Fixed ID to match DocsNav
        title: "Quyền Riêng Tư Thuận Pháp",
        subtitle: "Tận dụng mô hình Dữ liệu Ưu tiên Sự đồng thuận",
        content: [
          "Nền tảng của chúng tôi tuân thủ nguyên tắc \"Quyền Riêng Tư Thuận Pháp\". Vì chúng tôi không dựa vào máy chủ trung tâm, nên không có việc khai thác dữ liệu. Chúng tôi tận dụng mô hình truy cập dữ liệu ưu tiên sự đồng thuận của mạng lưới.",
          "Chúng tôi sẽ không bao giờ vượt qua tường lửa trả phí hoặc vi phạm quyền riêng tư. Đối với các đối tác Tăng Đoàn của chúng tôi, việc xử lý nhận thức về quyền riêng tư và khu vực đảm bảo rằng dữ liệu nhạy cảm (ví dụ: PII hoặc dữ liệu chỉ dành cho EU) vẫn nằm trong phạm vi quyền hạn cho phép của nó, chạy các chuyển đổi cục bộ và chỉ xuất các hiện vật ẩn danh. Dữ liệu người dùng là chủ quyền. Thực hành chân chính không thể cùng tồn tại với chủ nghĩa tư bản giám sát."
        ]
      }
    ]
  },
  en: {
    title: "The Architecture of Awakened Technology",
    subtitle: "The Giác Ngộ Tech Stack",
    sections: [
      {
        id: "vision",
        title: "Vision & Mission",
        content: [
          "Vision: To become the world's first, most profound digital community where spirituality meets technology; where every interaction, every shared insight, is an opportunity to generate Intrinsic Merit and accelerate collective awakening.",
          "Mission: To provide tools, teachings, and a nurturing community that supports individuals and Sanghas (spiritual communities) on their journey to awakening. To demystify Intrinsic Merit (Công Đức) and make it the central currency of a new, more conscious civilization. To build alliances with all traditions that honor the same non-dual Truth."
        ]
      },
      {
        id: "compute",
        title: "Foundation: The Collective Compute Mandala",
        content: [
          "The Giác Ngộ Ecosystem is built upon a global network of decentralized off-chain computation nodes, acting as a collective supercomputer.",
          "Our philosophy begins with the rejection of centralized platforms. The \"Sickness of the Digital Age\" is fueled by centralized GPU farms (AWS, Google Cloud) which are designed to \"harvest the human mind\" as a commodity. To build a \"sacred digital vessel,\" we must build on a foundation that has no single ruling entity. This decentralized infrastructure provides the perfect technical foundation, in parallel with our philosophy:",
          "• Breaking Centralization (Phá Chấp Ngã): By leveraging the pooled computational capabilities of independent user-run nodes, we break the dependency on central servers, just as Giác Ngộ breaks the dependency on the \"worldly ego.\"",
          "• Elastic Scalability (Pháp Thân Biến Mãn): The platform is elastic by default. It can burst instantly across thousands of nodes for heavy jobs (like AI training) and, crucially, scale to zero when idle. This reflects the nature of the Mind: powerfully present when needed, perfectly still when not.",
          "• Sustainable Primitives (Tận Dụng Duyên Lành): The network capitalizes on idle computing power, utilizing existing, often-underutilized resources. This principle of non-waste reduces total energy per useful task and aligns with the Dharma, turning the world's latent potential (duyên) into a tool for awakening."
        ]
      },
      {
        id: "ledger",
        title: "Protocol Layer 1: The Mandala Ledger",
        subtitle: "Leveraging Verifiable Off-Chain Ledgers",
        content: [
          "The Flow of Awakening, the Dharma Library, and the merit profile of each practitioner create an immense amount of data that cannot be stored entirely on-chain.",
          "We leverage verifiable off-chain ledgers. The entire history of shared wisdom, Dharma talks, and merit-generating actions is organized as Acyclic Data (DAG) structures. These structures are then reliably anchored to the blockchain, creating verifiable rails for our ecosystem.",
          "This allows Giác Ngộ to maintain an immutable record of collective wisdom and merit history—our Mandala Ledger—without sacrificing speed or cost."
        ]
      },
      {
        id: "protocol",
        title: "Protocol Layer 2: Merit Attribution Protocol",
        subtitle: "A Spiritual Extension of Verifiable Compute",
        content: [
          "The network's economy is built on a protocol for compute attribution and reputation—a universal standard for rewarding nodes based on verifiable computational proof.",
          "The Giác Ngộ Ecosystem extends this philosophy to a higher layer, creating the Merit Attribution Protocol:",
          "• Compute Protocol (Technical Layer): Verifies technical actions. Example: \"Did this node truly store and serve this Dharma talk?\"",
          "• Merit Protocol (Spiritual Layer): Verifies the intent and quality of an action. Example: \"Was this 'Like' action mindful?\" \"Was this 'Unraveling' of an NFT Badge a true act of letting go?\"",
          "The network's protocol provides trustlessness for the hardware. Our Merit Protocol provides transparency for the Mind (Tâm). Our Mandala Tokenomic cannot be speculated upon because it is anchored to both verifiable computational proof and verifiable spiritual transformation (attestations)."
        ]
      },
      {
        id: "primitives",
        title: "Universal Primitives: Building on the Collective Supercomputer",
        content: [
          "We do not build our core functions from scratch. We construct our pillars by deploying tasks to the network's Universal Primitives.",
          "• Decentralized AI: The Threefold AI Vehicle (Tam Thừa AI): The Giác Ngộ Assistants (Tâm An, Giác Ngộ, Đốn Ngộ) are not proprietary models on a central server. They are deployed as elastic inference micro-services that scale to zero. Their wisdom is fine-tuned (e.g., LoRA / distributed fine-tuning) on the Dharma teachings using the pooled nodes. This is open-model friendly (supporting HF, PyTorch, etc.) and makes the Dharma uncensorable.",
          "• Verifiable Storage: The Dharma Observatory (Đài Quan Sát Pháp): The entire Library of Wisdom is stored using decentralized storage primitives. We use the network's media pipelines (for transcription, translation, and vision) and RAG at scale (crawl, embed, index) to make all Dharma talks searchable and accessible to the AI Assistants, ensuring the timeless teachings are preserved perpetually.",
          "• Trustless Reputation: The Awakened DAO (DAO Giác Ngộ): Our governance system is anchored to the verifiable pipelines of the network. When a user performs a merit-generating action (verified by our Merit Protocol), that action is recorded via the Mandala Ledger and receives a verifiable attestation. This creates a truly trustless governance system, where the Dao Token is a transparent record of merit, not a tradable financial asset."
        ]
      },
      {
        id: "privacy",
        title: "Privacy by Dharma",
        subtitle: "Leveraging Consent-First Data",
        content: [
          "Our platform adheres to the \"Privacy by Dharma\" principle. Because we do not rely on central servers, there is no data mining. We leverage the network's consent-first data access model.",
          "We will never bypass paywalls or violate privacy. For our Sangha partners, privacy- and region-aware processing ensures that sensitive data (e.g., PII or EU-only data) remains within its allowed jurisdiction, running transforms locally and exporting only anonymized artifacts. User data is sovereign. True practice cannot coexist with surveillance capitalism."
        ]
      }
    ]
  }
};

export default function TechStack() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
  const t = translations[language];
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
            // Account for header height
            const headerOffset = 80; 
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
      }, 100);
    } else {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash, language]);

  const renderContent = (items: string[]) => {
    return (
      <div className="space-y-4 text-base leading-relaxed text-foreground text-justify">
        {items.map((item, idx) => {
           if (item.startsWith("•")) {
             const parts = item.split(":");
             if (parts.length > 1) {
                 return <p key={idx} className="pl-4"><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</p>;
             }
             return <p key={idx} className="pl-4">{item}</p>;
          }
          if (item.startsWith("Vision:") || item.startsWith("Mission:") || item.startsWith("Tầm nhìn:") || item.startsWith("Sứ mệnh:")) {
              const parts = item.split(":");
              return <p key={idx}><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</p>
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
        <header className="text-center space-y-6 pb-8 border-b border-border">
          <h1 className="text-4xl font-bold text-foreground">
            {t.title}
          </h1>
          <p className="text-xl italic text-muted-foreground">
            {t.subtitle}
          </p>
          <div className="space-y-1 text-muted-foreground">
            <p className="font-semibold">Giác Ngộ Initiative</p>
            <p className="font-serif">Bodhi Technology Lab</p>
            <p className="text-sm italic">January 2025</p>
          </div>
        </header>

        {t.sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-4 scroll-mt-24">
            <h2 className="text-2xl font-bold text-foreground" data-testid={`heading-${section.id}`}>
              {section.title}
            </h2>
            {section.subtitle && (
                <p className="italic text-muted-foreground">
                  {section.subtitle}
                </p>
            )}
            {renderContent(section.content)}
          </section>
        ))}
      </article>
    </div>
  );
}