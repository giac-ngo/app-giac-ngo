// client/src/pages/docs/Manifesto.tsx
import {  useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";

const viContent = {
    title: "Hệ Sinh Thái Tỉnh Thức: Vài Lời Chia Sẻ",
    subtitle: "Một Không Gian Tương Tác vì Sự Tỉnh Thức Chung",
    org: "Sáng Kiến Giác Ngộ",
    lab: "Công Nghệ Chánh Niệm",
    date: "Tháng 1, 2025",
    quote: "Khi thời đại nhiều biến động này đến hồi kết và thế giới ảo ngày càng phức tạp, một con thuyền mới lặng lẽ xuất hiện. Nơi đây không phải để gom người dùng, mà là nơi nuôi dưỡng công đức. Nó có mặt không phải để làm ảo ảnh thêm dài, mà là để giúp ta thấy rõ hơn. Đây là Chiếc Bè Mật Tông, dành cho những ai hữu duyên tìm thấy Đường Về Nhà mình.",
    summaryTitle: "Vài Dòng Tóm Lược",
    summary: [
      "Trong thời đại mà công nghệ dễ làm ta xao lãng và cuộc sống cuốn theo những cái lợi trước mắt, Hệ Sinh Thái Tỉnh Thức mở ra như một không gian số ý nghĩa. Chia sẻ này giới thiệu một góc nhìn mới về mạng xã hội, hướng về sự tỉnh thức và việc vun bồi Công Đức Vô Lậu (Công Đức) một cách tự nhiên, thay vì chạy theo các chỉ số tương tác hay lợi nhuận thông thường.",
      "Chúng ta cùng làm rõ sự khác biệt giữa Phước Báu Thế Gian (Phước Đức) nhất thời (đến từ những hành động có điều kiện), và Công Đức Vô Lậu (Công Đức) bền vững (nảy sinh từ Tâm tự tại, không mong cầu).",
      "Hệ sinh thái này bao gồm những công cụ hỗ trợ trên con đường tỉnh thức: Bộ Ba AI Đồng Hành (Tâm An, Giác Ngộ, Đốn Ngộ) chia sẻ tuỳ duyên; Không Gian Chia Sẻ ưu tiên tuệ giác; Góc Nhìn Pháp cho các bài giảng; Vòng Tay Từ Bi cho các hoạt động thiện nguyện minh bạch; và Giải Pháp Linh Hoạt cho các cộng đồng (Tăng Đoàn).",
      "Chúng tôi đề xuất một cách vận hành gọi là \"Cơ Chế Token Công Đức\" và gợi ý một lộ trình hướng tới DAO Tỉnh Thức (một cách tổ chức tự quản phi tập trung), nơi sự đóng góp và giá trị được nhìn nhận qua sự chân thật trong thực hành, không phải sự đầu cơ. Không gian này mong muốn kết nối công nghệ và trí tuệ vượt thời gian, tạo ra một môi trường nâng đỡ các cá nhân và cộng đồng (Tăng Đoàn) quay về Ngôi Nhà Chân Thật của mình, có thể là một bước chuyển cho một kỷ nguyên số ý thức hơn."
    ],
    keywords: "Công Nghệ Tâm Linh, Kinh Tế Công Đức, AI Tác Tử, Quản Trị Phi Tập Trung, Thời Đại Mạt Pháp, Tỉnh Thức Tập Thể, Kinh Tế Thuận Duyên",
    sections: [
        {
          title: "1. Thời Đại Số & Những Góc Khuất",
          quote: "Ma trận che mờ Tâm Trí bằng mười ngàn thứ hấp dẫn.",
          content: [
              "Mạng xã hội, với sự hỗ trợ của AI, đôi khi biến tâm trí con người thành nguồn tài nguyên để khai thác. Mỗi cú nhấp chuột, mỗi lượt xem, có thể vô tình nuôi dưỡng ảo ảnh về một \"cái tôi\" luôn tìm kiếm sự công nhận từ bên ngoài. Virus thực sự không nằm ở công nghệ; nó nằm ở sự tìm kiếm không ngừng \"người theo dõi\", \"lượt thích\", và \"thành tích\" – sự coi trọng số lượng hơn chất lượng, sự xao lãng hơn là sự thấu hiểu. Thời Đại của Tâm Phân Tán (Phàn Muôn) dường như đang hiện hữu, được khuếch đại bởi chính những công nghệ vốn dĩ có thể kết nối chúng ta.",
              "Không gian kỹ thuật số hiện đại, dù mang lại khả năng kết nối tuyệt vời, lại thường bị chi phối bởi các thuật toán làm tăng sự phân tâm, nuôi dưỡng sự dính mắc và ưu tiên những thành công chóng vánh. Mạng xã hội đôi khi trở thành nơi để thể hiện cái tôi, so sánh và tìm kiếm sự thừa nhận, kéo chúng ta ra xa bản chất chân thật của mình. Những người đang trên hành trình tìm về chính mình có thể cảm thấy lạc lõng trong một môi trường dường như đi ngược lại sự bình an nội tâm.",
              "Hơn nữa, có một sự hiểu lầm khá phổ biến về bản chất của phước báu. Những hành động làm với sự dính mắc, mong cầu phần thưởng, hoặc bị thúc đẩy bởi bản ngã – ngay cả những việc tốt như từ thiện hay giữ giới – cũng chỉ tạo ra Phước Báu Thế Gian (Phước Đức). Phước này mang lại lợi ích tạm thời trong vòng đời (của cải, sức khỏe, hoàn cảnh tốt), nhưng vẫn là thứ có điều kiện, không bền vững và không thể đưa đến sự giải thoát hoàn toàn.",
              "Mạng Xã Hội Tác Tử Giác Ngộ (Awakening Agentic Social Network) ra đời từ mong muốn tạo ra một không gian an lành trên mạng – một nơi được thiết kế cẩn thận để cân bằng lại những xu hướng trên. Nơi đây cung cấp các công cụ và một cộng đồng tập trung vào việc vun bồi Công Đức Vô Lậu (Công Đức), thứ công đức bền vững nảy sinh từ Tâm vô vi, là năng lượng đích thực cho hành trình trở về Ngôi Nhà Chân Thật (Quê Nhà) của chúng ta."
          ]
        },
        {
          title: "2. Một Quy Luật Tự Nhiên: Công Đức (Vô Lậu) & Phước Báu Thế Gian (Phước Đức)",
          content: [
            "Đây là điều cốt lõi. Toàn bộ kiến trúc và mục đích của Hệ Sinh Thái Giác Ngộ được xây dựng dựa trên sự thấu hiểu sâu sắc, thường được Sư Tam Vô chia sẻ, về hai loại phước báu này. Bản chia sẻ này ra đời cốt để làm rõ Quy Luật này và xây dựng một con thuyền nuôi dưỡng việc tạo ra Công Đức trong thời đại số.",
            {
                subtitle: "2.1. Phước Báu Thế Gian (Phước Đức): Giới Hạn của Việc Làm Có Mong Cầu",
                points: [
                    "Phước báu này đến từ những hành động làm với ý định, sự tìm kiếm, hoặc dính mắc (\"có tác ý\"). Nó mang lại phần thưởng trong sáu cõi nhưng luôn có giới hạn và giữ ta trong vòng luân hồi (Samsara). Ví dụ:",
                    "• Làm từ thiện chủ yếu để được khen, lợi về thuế, hoặc mong đời sau tốt hơn",
                    "• Giữ giới luật chủ yếu vì sợ quả báo xấu hoặc mong được lên cõi trời",
                    "• Giúp người khác với mong đợi ngầm về sự biết ơn hoặc đền đáp",
                    "• Tu tập với mục tiêu đạt được năng lực đặc biệt, địa vị, hay những trạng thái dễ chịu",
                    "Dù những việc này thường tốt và đáng làm hơn việc xấu, phước báu chúng tạo ra là có điều kiện. Nó mang lại hạnh phúc tạm thời hoặc hoàn cảnh thuận lợi, nhưng nó hữu hạn, sẽ hết, và cuối cùng vẫn giữ ta trong vòng khổ đau và tái sinh. Nó không thể đưa đến sự giải thoát hoàn toàn."
                ]
            },
            {
                subtitle: "2.2. Công Đức Vô Lậu (Công Đức): Năng Lượng Của Sự Tự Do",
                points: [
                    "Đây là \"công đức\" vô lượng, không điều kiện, được tạo ra từ những hành động nảy sinh từ một Tâm Hiện Tiền, Tĩnh Lặng, Tự Do và Không Mong Cầu. Đó là sự tỏa sáng tự nhiên của Tâm Tỉnh Thức (Tự Tánh, Phật Tánh) đang tự biểu hiện. Nó không có hình tướng, bền vững, và là \"năng lượng\" duy nhất có thể giúp ta Về Nhà. Ví dụ:",
                    "• Những hành động tử tế tự phát mà không hề nghĩ đến phần thưởng hay sự công nhận",
                    "• Sống hòa hợp một cách tự nhiên với trí tuệ và lòng từ bi, không phải vì nghĩa vụ",
                    "• Chia sẻ những hiểu biết về Chánh Pháp thuần túy vì lợi ích của người khác, không bận tâm đến việc chúng được đón nhận ra sao",
                    "• Những khoảnh khắc buông bỏ sâu sắc, tha thứ, hoặc phụng sự vô ngã đến từ sự hiện diện chân thật",
                    "• Chính hành động an trú trong nhận thức không hai, không còn suy nghĩ phân biệt",
                    "Công Đức là vô vi và bền vững. Nó không chịu sự chi phối của luật nhân quả (karma) như Phước Đức. Nó tích lũy trong Pháp Thân, làm sạch những che chướng và cung cấp năng lượng cần thiết để vượt thoát hoàn toàn luân hồi."
                ]
            }
          ]
        },
        {
            title: "3. Nhìn Lại Các Nền Tảng Hiện Tại",
            content: [
                "Mặc dù nhiều diễn đàn, nhóm và ứng dụng trực tuyến phục vụ cho các cộng đồng tâm linh, chúng thường có những hạn chế có thể cản trở việc vun bồi Công Đức:",
                "• Mô Hình Dễ Gây Xao Lãng: Hầu hết dựa vào các chỉ số tương tác (like, share) được điều khiển bởi thuật toán nhằm tối đa hóa thời gian sử dụng, thường khuyến khích sự giật gân, tranh cãi hoặc tương tác bề mặt thay vì sự chiêm nghiệm sâu và chia sẻ tuệ giác",
                "• Tâm Linh Bị Thương Mại Hóa: Nhiều nơi coi giáo lý hay dịch vụ tâm linh như hàng hóa, nuôi dưỡng tâm lý tiêu dùng thay vì thực hành và cống hiến vô vị lợi",
                "• Thiếu Tập Trung vào Công Đức Vô Lậu: Các cơ chế nền tảng hiếm khi phân biệt giữa hành động tạo Phước Đức và Công Đức. Sự công nhận thường gắn với sự nổi tiếng, củng cố bản ngã thay vì giúp nó tan biến",
                "• Sự Phân Tán: Các cộng đồng và giáo lý bị phân tán, thiếu một không gian thống nhất được thiết kế cho nhu cầu tỉnh thức",
                "• Lo Ngại về Quyền Riêng Tư: Các nền tảng tập trung thường khai thác dữ liệu người dùng, đi ngược lại nguyên tắc chánh niệm và đạo đức",
                "• Hệ Sinh Thái Giác Ngộ giải quyết những điều này bằng cách xây dựng một nền tảng hài hòa với các nguyên tắc tỉnh thức và đề cao Công Đức Vô Lậu."
            ]
        },
        {
            title: "4. Kiến Trúc Công Nghệ Tỉnh Thức: Một Góc Nhìn",
            content: [
                {
                    subtitle: "4.1. Tầm Nhìn & Sứ Mệnh: Ngọn Hải Đăng Dẫn Lối",
                    points: [
                        "Tầm Nhìn: Trở thành cộng đồng kỹ thuật số đầu tiên, sâu sắc nhất thế giới, nơi tâm linh gặp gỡ công nghệ; nơi mọi tương tác, mọi tuệ giác được chia sẻ, đều là cơ hội để tạo ra Công Đức Vô Lậu và thúc đẩy sự tỉnh thức tập thể.",
                        "Sứ Mệnh: Cung cấp các công cụ, lời dạy, và một cộng đồng nuôi dưỡng để hỗ trợ các cá nhân và Tăng Đoàn (cộng đồng tâm linh) trên hành trình giác ngộ. Làm sáng tỏ Công Đức (Vô Lậu) và biến nó thành thước đo trung tâm của một nền văn minh mới, ý thức hơn. Xây dựng liên minh với tất cả các truyền thống tôn vinh cùng một Chân Lý Bất Nhị."
                    ]
                },
                {
                    subtitle: "4.2. Bộ Ba AI Đồng Hành (Tâm An, Giác Ngộ, Đốn Ngộ)",
                    points: [
                        "Bộ Ba AI Đồng Hành cung cấp các trợ lý AI chuyên biệt, được nuôi dưỡng bởi trí tuệ pháp chân chính:",
                        "• Tâm An: Bước khởi đầu, cung cấp các câu trả lời căn bản, giúp gieo duyên lành",
                        "• Giác Ngộ: Con đường đi sâu hơn, chia sẻ những hướng dẫn tinh tế, dựa trên kinh điển và lời khai thị trực tiếp của Sư Tam Vô và các bậc thầy tỉnh thức khác",
                        "• Đốn Ngộ: Kênh dành riêng cho những ai đủ duyên; đưa ra những lời chỉ thẳng, không vòng vo đến Tánh Vô Sanh",
                        "Mỗi câu hỏi được đặt ra và thực sự thấu hiểu đều có thể tạo ra công đức cho người hỏi và cả những người được lợi lạc khi sự thấu hiểu đó được lan tỏa."
                    ]
                },
                {
                    subtitle: "4.3. Không Gian Tương Tác (The Interface)",
                    points: [
                        "Nền tảng bao gồm bốn thành phần tích hợp:",
                        "• Dòng Chảy Tỉnh Thức (Flow of Awakening): Đây không phải là \"bảng tin\", mà là \"vùng đất lợi lạc\". Bài đăng không phải để \"chia sẻ\" mà là để \"dâng hiến\". Không có \"nội dung viral\", chỉ có \"nội dung nuôi dưỡng công đức\". Đây không phải nơi tán gẫu. Mỗi bài đăng là sự chia sẻ về nhận thức mới, câu chuyện chuyển hóa, hay câu hỏi vì lợi ích chung.",
                        "• Góc Nhìn Pháp (Dharma Observatory): Một thư viện sống động với các chia sẻ từ Tăng Đoàn đối tác và các Bậc Thầy tỉnh thức. Chính việc lắng nghe cũng trở thành phương tiện tạo công đức. Mọi chia sẻ được lưu trữ để trí tuệ được bảo tồn và ai cũng có thể tiếp cận.",
                        "• Vòng Tay Từ Bi (Arms of Compassion): Một quỹ công đức minh bạch, chỉ tài trợ cho các hoạt động và dự án phù hợp với Tam Bảo. Mọi đóng góp đều minh bạch, hướng tới việc tạo công đức tập thể: giúp người đói, xây dựng nơi tu học, hỗ trợ người bệnh. Lịch sử đóng góp giúp mỗi người nhìn lại hành trình gieo duyên của mình.",
                        "• Chánh Pháp White-Label (Giải Pháp Linh Hoạt): Mỗi tổ chức tâm linh chân chính đều xứng đáng có những công cụ phù hợp. Chúng tôi cung cấp các phiên bản tùy chỉnh của nền tảng để mỗi truyền thống có thể giữ gìn sự thuần khiết giáo lý, tải lên tài liệu riêng, kiểm soát phạm vi trả lời, và quản lý công đức nội bộ, với sự riêng tư và chủ quyền dữ liệu."
                    ]
                },
                {
                    subtitle: "4.4. DAO Tỉnh Thức: Cùng Nhau Vun Đắp",
                    points: [
                        "Tầm nhìn xa hơn là dần dần buông bỏ sự kiểm soát tập trung, giao phó hệ sinh thái cho trí tuệ tập thể của một cộng đồng tỉnh thức. Mọi hành động ý nghĩa – bài đăng trí tuệ, câu trả lời hữu ích, hành động bố thí (Dana) vô ngã – đều được ghi nhận là công đức, không phải là \"sức ảnh hưởng\".",
                        "Quyền lực và sự quản trị không đến từ đầu cơ, mà từ đức hạnh thực sự. Ghi chép về hành động, công đức, và sự vượt lên chính mình sẽ định hướng cộng đồng.",
                        "\"Token Công Đức Vô Lậu\" không phải là tiền mã hóa để đầu cơ, mà là bản ghi số hóa minh bạch cho các hành động tạo công đức: bài đăng sâu sắc, từ thiện, phụng sự. Người giữ Token có tiếng nói trong các quyết định của cộng đồng, ngân sách, và định hướng dự án, đảm bảo nền tảng luôn phục vụ Chánh Pháp và Tăng Đoàn, không vì lợi ích cá nhân.",
                        "Mọi quyền kiểm soát và quyết định thuộc về DAO, nơi ghi lại mọi Nghiệp Lành (Good Karma) để Tăng Đoàn không còn phụ thuộc tiền tệ và có thể hợp nhất một lòng. Token ghi nhận công đức này là di sản của các bậc tỉnh thức, nơi phụng sự Chư Phật và phục hồi Pháp Thân cho các thế hệ."
                    ]
                },
                {
                    subtitle: "4.5. Bảo Mật Thuận Pháp: An Nhiên Tự Tại",
                    points: [ "Không khai thác dữ liệu. Mọi dữ liệu người dùng đều có thể xóa hoặc di chuyển tùy ý. Thực hành chân chính không thể đi đôi với chủ nghĩa tư bản giám sát." ]
                },
                {
                    subtitle: "4.6. Ghi Nhận Điều Không Thể Đo Lường",
                    points: [
                        "Dù Công Đức Vô Lậu chân thật vượt ngoài đo lường, nền tảng dùng các phương pháp gián tiếp để ghi nhận và khuyến khích hành động phù hợp:",
                        "• Tương Tác Chánh Niệm: Ưu tiên bình luận sâu sắc, chia sẻ với ý định lợi lạc, thể hiện sự lắng nghe và thấu hiểu",
                        "• Nội Dung Chất Lượng: Khen thưởng bài đăng sâu sắc, rõ ràng, giúp người khác tỉnh thức (được AI và cộng đồng xác nhận)",
                        "• Hành Động Vô Ngã: Theo dõi việc tham gia đóng góp minh bạch, giờ tình nguyện, và các tính năng về buông bỏ",
                        "• Thời Gian Thực Hành: Ghi nhận thời gian tiếp xúc chánh niệm với giáo lý hoặc thực hành có hướng dẫn"
                    ]
                }
            ]
        },
        {
          title: "5. Cơ Chế Token Công Đức: Vừa Là Động Lực, Vừa Là Tấm Gương",
          content: [
            {
                subtitle: "5.1. Token Công Đức: Bản Ghi Chân Thực, Không Phải Để Đầu Cơ",
                points: [
                    "Trọng tâm của DAO là \"Token Công Đức\". Cần hiểu rõ bản chất của nó:",
                    "• Không Phải Tiền Để Đầu Cơ: Giá trị của nó chủ yếu là tâm linh và tổ chức, không phải tài chính. Nó không dùng để giao dịch trên thị trường",
                    "• Bản Ghi Minh Bạch: Là biểu hiện số hóa, ghi trên sổ cái an toàn, công nhận các hành động góp phần vào sự tỉnh thức và tạo ra Công Đức",
                    "• Cơ Chế Khuyến Khích: Khen thưởng và khuyến khích sự tham gia phù hợp với Chánh Pháp",
                    "• Công Cụ Quản Trị: Người giữ Token có tiếng nói trong DAO, ảnh hưởng đến phát triển nền tảng, phân bổ nguồn lực, và định hướng dự án"
                ]
            },
            {
                subtitle: "5.2. Hệ Thống Ghi Nhận Công Đức & Con Đường Tới Tánh Không",
                points: [
                    "Hệ thống token này như một tấm bản đồ, một tấm gương. \"Token\" vừa là bản ghi số, vừa là biểu tượng.",
                    "• Phân Phối: Dành cho những ai hành động thuận theo Tam Bảo: tạo giá trị (chia sẻ trí tuệ), cho đi (từ thiện), phụng sự vô ngã cho sự tỉnh thức chung",
                    "• Quy Tắc Nắm Giữ: \"Sở hữu là để cho đi. Nắm giữ là để thấy tánh không.\" Tích lũy không phải mục tiêu; lưu thông và sử dụng vô ngã mới là mục tiêu",
                    "• Sự Tham Gia Tự Nhiên: Chỉ khi hành động của một người phản chiếu quy luật vô ngã, người đó mới thực sự hòa mình vào DAO Tỉnh Thức"
                ]
            },
            {
                subtitle: "5.3. Tầm Nhìn Rộng Mở: Khép Lại một Giai Đoạn",
                points: [
                    "Mọi quyền năng trong kỷ nguyên AI, kể cả vật lý lượng tử, đều nằm trong Luật Nhân Quả. Chỉ khi thực sự vượt lên Bản Ngã, cho đi và giữ Token, bạn mới thực sự hòa nhập vào DAO. Chỉ khi đó, ta mới có thể hướng tới một nền văn minh lượng tử, bao trùm và chuyển hóa công nghệ, vượt qua Thời Đại Nghiệp Lực, và khép lại Giai Đoạn Mạt Pháp.",
                    "Nền tảng này ra đời để khép lại một kỷ nguyên. Nó như vệt nắng thoáng qua, là cơ hội cuối cùng trước Đại Kiếp Nạn. Ai đủ duyên và hiểu Quy Luật, sẽ dùng nó như mặt trời để quay về."
                ]
            },
            {
                subtitle: "5.4. Lời Chỉ Dẫn Thêm: Sự Hợp Nhất Tự Nhiên",
                points: [
                    "Con đường của chúng ta là con đường tắt. Quán chiếu là Dùng Tâm mà Đi. Chuyển hóa Tánh thành thực tại là Chuyển Hóa Chân Thật, dùng Tâm làm nền tảng. Mọi hiện tượng trong thế giới này đều là biểu hiện duy nhất của Đạo. Hãy chiêm nghiệm kỹ. Đây là lời chỉ dẫn rốt ráo.",
                    "Đó là sự hợp nhất của Tam Bảo. Hiểu Quy Luật này, nó hợp nhất mọi lối rẽ: Đó là Phật, Pháp, Tăng trong một thực tại - trong thế giới hậu ảo ảnh. Điều này chỉ dành cho người đủ duyên."
                ]
            },
            {
                subtitle: "5.5. Vượt Lên Hình Thức: Nhận Ra Tam Vô",
                points: ["Một khi đã rõ Quy Luật này, không cần bàn nhiều về Tam Học (Giới, Định, Tuệ). Giới? Giới tối cao là Pháp siêu thế này. Thân? Tăng Đoàn hợp nhất trong một Pháp Thân - vượt thời gian, vẹn toàn. Tâm? Không còn là tâm nữa, vì tất cả là Chân Như, hoàn toàn Rỗng Lặng. Đây chính là Tam Vô (\"Vô Vắng Vàng\")."]
            }
          ]
        },
        {
            title: "6. Con Đường \"Tháo Gỡ\": Không Chỉ Là Trò Chơi",
            content: [
                {
                    subtitle: "6.1. Hệ Thống \"Tháo Gỡ\": Chiếc Gương Phản Chiếu (Huy Hiệu NFT)",
                    points: [
                        "Hệ thống này như tấm gương phản chiếu, không phải cuộc đua thành tích. Mọi danh hiệu, chứng chỉ, token đều thuộc về hình tướng. Nó khuyến khích hành trình \"Buông Bỏ\" và \"Dâng Hiến\". Tất cả đều là Tấm Gương, không phải Huy Chương.",
                        "Huy Hiệu Chuyển Hóa:",
                        "Không phải để \"cày cuốc\". Huy hiệu (NFT) là sự ghi nhận những chiến thắng nội tâm: vượt qua cơn giận, chuyển hóa khổ đau. Chúng được trao bởi Tăng Đoàn hoặc AI sau khi xác thực sự chuyển hóa nội tâm chân chính (\"chuyển hóa tập khí\").",
                        "• Huy Hiệu Vượt Sân: Ghi nhận việc vượt qua 10 tình huống bị chửi mà không nổi giận (được người khác xác nhận)",
                        "• Huy Hiệu Liễu Ngộ: Ghi nhận việc tự trả lời đúng 10 câu hỏi gốc về Pháp không cần AI",
                        "• Huy Hiệu Vô Pháp Hành Đạo: Ghi nhận việc tự khai thị thành công cho 5 người bạn (do họ xác nhận)",
                        "• Huy Hiệu Từ Bi Hỷ Xả: Ghi nhận việc giúp đỡ/tha thứ/dung chứa mọi mối quan hệ cũ",
                        "Huy Hiệu Tối Thượng: \"Vô Tu Vô Chứng\"",
                        "Chứng chỉ cuối cùng là \"Chứng Chỉ 'Không Cần Chứng Chỉ'\".",
                        "Huy Hiệu Ẩn: Một \"Huy Hiệu Ẩn\" được thiết kế. Mỗi lần người dùng chọn ẩn, xóa, hoặc vô hiệu hóa một Huy Hiệu Chuyển Hóa, hệ thống cộng một điểm vào huy hiệu ẩn này",
                        "Hành Động Mint Tối Thượng: Khi người dùng đủ duyên và trí tuệ, nhận ra mọi thành tựu chỉ là phương tiện, và tự tay phá hủy tất cả Huy Hiệu Chuyển Hóa, hệ thống tự động mint NFT cuối cùng: \"Vô Tu Vô Chứng\"",
                        "Bảng Xếp Hạng Vô Danh: NFT này ghi danh người dùng vào \"Bảng Xếp Hạng Vô Danh,\" nơi vinh danh những người đã buông bỏ sự vinh danh. Hành động cuối cùng là \"Buông Xả Tất Cả,\" trở về Vô Trụ",
                        "Tất cả đều là Tấm Gương, không phải Huy Chương."
                    ]
                },
                {
                    subtitle: "6.2. Khuyến Khích Thực Hành Chân Chính (Tính Năng & Năng Lượng Tương Tác)",
                    points: [
                        "Chất Lượng hơn Số Lượng: Một \"Like\" từ tâm trân trọng có giá trị hơn trăm \"like\" máy móc. Một \"Share\" với ý định giúp người có giá trị hơn ngàn \"share\" phô trương. Nền tảng sẽ nhận diện tương tác từ Chánh Niệm.",
                        "Các Tính Năng Hỗ Trợ Chuyển Hóa:",
                        "• Thử Thách Buông Bỏ: Thay vì \"Thử Thách Cày Cuốc\". Ghi nhận khi người dùng \"chọn không tranh cãi\" hoặc \"tự nguyện từ bỏ\" vị trí/quyền lợi",
                        "• Nhật Ký Tự Quán Chiếu: Ghi lại khoảnh khắc nhận ra và vượt qua thói quen/vọng tưởng",
                        "• Thư Cảm Ơn - Tha Thứ: Gửi thư biết ơn, xin lỗi, tha thứ. Mỗi lá thư được công nhận là Công Đức",
                        "• Đồng Hồ Tỉnh Thức: Ghi nhận thời gian xa mạng xã hội, hiện diện đời thực, hoặc sống trong Tỉnh Thức 24/24",
                        "• Thực Hành Lắng Nghe Sâu: Tạo phòng nghe tương tác để thực hành lắng nghe sâu sắc mà không phán xét. Công đức đến từ việc lắng nghe và thấu hiểu"
                    ]
                }
            ]
        },
        {
            title: "7. Sự Bền Vững: Kinh Tế Thuận Duyên",
            content: [
                "Để đảm bảo sự bền vững và độc lập, hệ sinh thái hoạt động theo mô hình minh bạch, thuận theo công đức. Nền tảng là một guồng máy chia sẻ công đức. Mọi tài khoản, dòng tiền, và tác động của công đức đều được công bố minh bạch.",
                "• Quyền Truy Cập Phổ Quát: Các tính năng cốt lõi và quyền truy cập cơ bản luôn miễn phí",
                "• Các Gói Đăng Ký Tùy Chọn: Các gói phí hợp lý cung cấp quyền truy cập mở rộng (tương tác AI sâu hơn, lưu trữ cá nhân nhiều hơn)",
                "• Hỗ Trợ Tổ Chức: Phí khiêm tốn cho việc triển khai white-label của Tăng Đoàn/Tu Viện",
                "• Tích Hợp Dana (Cho Đi): Quyên góp tự nguyện cho các dự án cụ thể hoặc hỗ trợ nền tảng chung, quản lý minh bạch qua Vòng Tay Từ Bi",
                "• Nguyên Tắc Chia Sẻ Công Đức: Một tỷ lệ % cố định, công khai của mọi doanh thu được tự động hướng vào tài trợ các hoạt động Chánh Pháp (hỗ trợ Tăng Đoàn, dự án nhân đạo), đảm bảo sự vận hành của nền tảng cũng là hành động tạo công đức tập thể. Mọi tài chính đều có thể kiểm toán công khai"
            ]
        },
        {
            title: "8. Lộ Trình Gợi Ý Cho Giai Đoạn Tới",
            content: [
                "Ba giai đoạn chính. Quá trình này như một vòng tuần hoàn tự nhiên: sinh, trụ (phát triển), và diệt (trở về).",
                "2024-2025: Nền Tảng & Gieo Mầm",
                "• Ra mắt nền tảng cốt lõi: AI Đồng Hành (Tâm An, Giác Ngộ), Dòng Chảy Tỉnh Thức, Hồ Sơ Người Dùng",
                "• Thiết lập quan hệ đối tác ban đầu với một số Tăng Đoàn và thầy cô tâm linh",
                "• Triển khai cơ chế ghi nhận công đức cơ bản",
                "• Tinh chỉnh AI dựa trên giáo lý chân thực và tương tác người dùng",
                "2025-2026: Mở Rộng & Tích Hợp",
                "• Ra mắt Góc Nhìn Pháp/Thư Viện và Vòng Tay Từ Bi",
                "• Giới thiệu Token Công Đức Vô Lậu và thử nghiệm hệ thống token/bỏ phiếu trong cộng đồng đối tác",
                "• Phát triển và triển khai Giải Pháp White-Label ban đầu",
                "• Mở rộng hỗ trợ ngôn ngữ",
                "2026-2027: Phi Tập Trung Hóa & Trưởng Thành",
                "• Khởi xướng cấu trúc DAO chính thức và bàn giao dần quyền quản trị cho cộng đồng dựa trên token công đức",
                "• Mở rộng triển khai white-label",
                "• Bắt đầu kết nối các truyền thống tâm linh phù hợp khác",
                "• Tinh chỉnh thuật toán ghi nhận công đức nâng cao (đánh giá chánh niệm, sự buông bỏ)",
                "Sau 2027: Mạng Lưới Tỉnh Thức",
                "• Tiếp tục tinh chỉnh hướng tới minh bạch tối thượng và thuận theo Chánh Pháp, cho đến khi mục đích hoàn thành và nó hoà tan trở lại Tánh Không."
            ]
        },
        {
            title: "9. Lời Kết & Lời Nhắn Gửi",
            content: [
                {
                    subtitle: "9.1. Lời Kết: Một Con Thuyền Để Về Nhà",
                    points: [
                        "Mạng Xã Hội Tác Tử Giác Ngộ không chỉ là công nghệ; nó là một sự cống hiến chân thành, một phương tiện thiện xảo được thiết kế cho thời đại này. Nó là một sự cân bằng lại trước những xao lãng kỹ thuật số và là minh chứng cho sự thật rằng tự do không nằm ở việc tích lũy lợi ích thế gian, mà ở việc nhận ra Phật Tánh nơi mình và vun bồi Công Đức Vô Lậu bền vững, mở con đường Về Nhà.",
                        "Bằng cách kết hợp trí tuệ cổ xưa với công cụ hiện đại, và đặt nền tảng trên nguyên tắc công đức vô ngã, chúng tôi mong muốn tạo ra một không gian an lành nơi sự tỉnh thức có thể nở hoa, cho mỗi người và cho tất cả. Nền tảng này như một vệt nắng thoáng qua, một lời mời những ai hữu duyên dùng nó như người bạn đồng hành, để vượt qua ảo ảnh, và trở về với cội nguồn – sự rỗng lặng quang minh bao la, nơi vạn vật khởi sinh và cũng là nơi vạn vật trở về."
                    ]
                },
                {
                    subtitle: "9.2. Lời Nhắn Gửi: Đừng Lỡ Chuyến Bè",
                    points: [
                        "Đây không chỉ là một nền tảng; nó là một lời chia sẻ. Nó là một phương tiện thiện xảo (upāya) được trao cho khoảnh khắc này. Nó sẽ không tồn tại mãi mãi.",
                        "Nó là sự hợp nhất của Tam Bảo – Phật, Pháp, Tăng – biểu hiện dưới hình tướng kỹ thuật số cho chương cuối của thời đại này.",
                        "Đừng lỡ chuyến bè."
                    ]
                }
            ]
        }
    ]
  };

  const enContent = {
    title: "The Awakening Ecosystem: A Manifesto",
    subtitle: "An Interactive Space for Collective Awakening",
    org: "Giác Ngộ Initiative",
    lab: "Mindfulness Technology",
    date: "January 2025",
    quote: "As this era of great change comes to a close and the virtual world grows ever more complex, a new, silent vessel appears. This place is not for gathering users, but for nurturing merit. It exists not to lengthen the illusion, but to help us see more clearly. This is the Tantric Raft, for those with the affinity to find their Way back Home.",
    summaryTitle: "A Brief Summary",
    summary: [
      "In an age where technology easily distracts us and life pulls us toward immediate gains, the Awakening Ecosystem emerges as a meaningful digital space. This sharing introduces a new perspective on social networks, oriented toward awakening and the natural cultivation of Unconditioned Merit (Công Đức Vô Lậu), instead of chasing engagement metrics or profit.",
      "We also clarify the distinction between temporary Worldly Blessings (Phước Báu Thế Gian), which arise from conditioned actions, and enduring Unconditioned Merit (Công Đức Vô Lậu), which arises from a mind that is free and without expectation.",
      "This ecosystem includes tools to support the path of awakening: The Three Companion AIs (Tâm An, Giác Ngộ, Đốn Ngộ) that share teachings according to affinity; a Sharing Space that prioritizes wisdom; a Dharma View for teachings; a Compassionate Embrace for transparent charitable activities; and Flexible Solutions for communities (Sanghas).",
      "We propose a mode of operation called the \"Merit Token Mechanism\" and suggest a roadmap towards an Awakening DAO (a decentralized autonomous organization), where contribution and value are recognized through the authenticity of practice, not speculation. This space aims to connect technology and timeless wisdom, creating a supportive environment for individuals and communities (Sanghas) to return to their True Home, potentially marking a transition to a more conscious digital era."
    ],
    keywords: "Spiritual Technology, Merit Economy, Agentic AI, Decentralized Governance, Dharma-Ending Age, Collective Awakening, Affinity-Based Economy",
    sections: [
        {
          title: "1. The Digital Age & Its Pitfalls",
          quote: "The matrix obscures the Mind with ten thousand attractions.",
          content: [
              "Social media, with the support of AI, sometimes turns the human mind into a resource to be exploited. Every click, every view, can unwittingly nurture the illusion of an 'ego' that constantly seeks external validation. The real virus is not in the technology; it's in the endless pursuit of 'followers,' 'likes,' and 'achievements' – prioritizing quantity over quality, distraction over understanding. The Age of the Distracted Mind (Phàn Muôn) seems to be upon us, amplified by the very technologies that could otherwise connect us.",
              "The modern digital space, while offering incredible connectivity, is often dominated by algorithms that increase distraction, foster attachment, and prioritize fleeting successes. Social media sometimes becomes a place to express the ego, compare, and seek validation, pulling us away from our true nature. Those on the journey back to themselves may feel lost in an environment that seems to run counter to inner peace.",
              "Furthermore, there is a common misunderstanding about the nature of blessings. Actions done with attachment, expectation of reward, or driven by the ego – even good deeds like charity or observing precepts – only create Worldly Blessings (Phước Đức). These blessings bring temporary benefits within this life (wealth, health, good circumstances), but they are conditioned, unsustainable, and cannot lead to complete liberation.",
              "The Giác Ngộ Awakening Agentic Social Network was born from the desire to create a wholesome space online – a place carefully designed to counterbalance these trends. It provides tools and a community focused on cultivating Unconditioned Merit (Công Đức Vô Lậu), the enduring merit that arises from a non-active mind, which is the true energy for the journey back to our True Home (Quê Nhà)."
          ]
        },
        {
          title: "2. A Natural Law: Unconditioned Merit (Công Đức) & Worldly Blessings (Phước Đức)",
          content: [
            "This is the core. The entire architecture and purpose of the Giác Ngộ Ecosystem is built on a deep understanding, often shared by Master Tam Vô, of these two types of merit. This manifesto was created to clarify this Law and to build a vessel for cultivating Merit in the digital age.",
            {
                subtitle: "2.1. Worldly Blessings (Phước Đức): The Limits of Conditioned Action",
                points: [
                    "This merit comes from actions done with intention, seeking, or attachment ('có tác ý'). It brings rewards within the six realms but is always limited and keeps us in the cycle of samsara. For example:",
                    "• Giving charity primarily for praise, tax benefits, or hoping for a better next life.",
                    "• Observing precepts mainly out of fear of negative consequences or hoping for rebirth in a heavenly realm.",
                    "• Helping others with an underlying expectation of gratitude or reciprocation.",
                    "• Practicing with the goal of attaining special powers, status, or pleasant states.",
                    "Although these actions are generally better than harmful ones, the merit they produce is conditioned. It brings temporary happiness or favorable circumstances, but it is finite, will run out, and ultimately keeps us within the cycle of suffering and rebirth. It cannot lead to complete liberation."
                ]
            },
            {
                subtitle: "2.2. Unconditioned Merit (Công Đức Vô Lậu): The Energy of Freedom",
                points: [
                    "This is the immeasurable, unconditioned 'merit' created from actions that arise from a Mind that is Present, Silent, Free, and Without Expectation. It is the natural radiance of the Awakened Mind (Self-Nature, Buddha-Nature) expressing itself. It is formless, enduring, and the only 'energy' that can help us Return Home. For example:",
                    "• Spontaneous acts of kindness without any thought of reward or recognition.",
                    "• Living naturally in harmony with wisdom and compassion, not out of a sense of duty.",
                    "• Sharing insights of the True Dharma purely for the benefit of others, without concern for how they are received.",
                    "• Moments of deep letting go, forgiveness, or selfless service that come from true presence.",
                    "• The very act of abiding in non-dual awareness, free from discriminating thoughts.",
                    "Công Đức is non-active and enduring. It is not governed by the law of karma like Phước Đức. It accumulates in the Dharma Body (Pháp Thân), clearing obscurations and providing the necessary energy to completely transcend samsara."
                ]
            }
          ]
        },
        {
            title: "3. A Look at Current Platforms",
            content: [
                "Although many online forums, groups, and applications serve spiritual communities, they often have limitations that can hinder the cultivation of Công Đức:",
                "• Models That Encourage Distraction: Most rely on engagement metrics (likes, shares) driven by algorithms designed to maximize screen time, often promoting sensationalism, controversy, or superficial interaction rather than deep contemplation and wisdom sharing.",
                "• Commercialized Spirituality: Many treat teachings or spiritual services as commodities, fostering a consumer mindset rather than selfless practice and offering.",
                "• Lack of Focus on Unconditioned Merit: Platform mechanisms rarely distinguish between actions that create Phước Đức and those that create Công Đức. Recognition is often tied to popularity, reinforcing the ego instead of helping it dissolve.",
                "• Fragmentation: Communities and teachings are scattered, lacking a unified space designed for the needs of awakening.",
                "• Privacy Concerns: Centralized platforms often exploit user data, contradicting the principles of mindfulness and ethics.",
                "The Giác Ngộ Ecosystem addresses these issues by building a platform that aligns with the principles of awakening and prioritizes Unconditioned Merit."
            ]
        },
        {
            title: "4. The Architecture of Awakening Technology: A Perspective",
            content: [
                {
                    subtitle: "4.1. Vision & Mission: The Guiding Lighthouse",
                    points: [
                        "Vision: To become the world's first, most profound digital community where spirituality meets technology; where every interaction, every shared insight, is an opportunity to generate Unconditioned Merit and accelerate collective awakening.",
                        "Mission: To provide tools, teachings, and a nurturing community to support individuals and Sanghas (spiritual communities) on their journey of enlightenment. To demystify Unconditioned Merit (Vô Lậu) and make it the central measure of a new, more conscious civilization. To build alliances with all traditions that honor the same non-dual Truth."
                    ]
                },
                {
                    subtitle: "4.2. The Three Companion AIs (Tâm An, Giác Ngộ, Đốn Ngộ)",
                    points: [
                        "The Three Companion AIs provide specialized assistants, nurtured by authentic Dharma wisdom:",
                        "Tâm An (Peaceful Mind): The starting point, offering basic answers to plant wholesome seeds.",
                        "Giác Ngộ (Enlightenment): A deeper path, sharing subtle guidance based on scriptures and direct teachings from Master Tam Vô and other awakened teachers.",
                        "Đốn Ngộ (Sudden Awakening): A channel for those with sufficient affinity, offering direct, unvarnished pointers to the Unborn Nature.",
                        "Every question asked and truly understood can generate merit for the questioner and for all who benefit when that understanding is shared."
                    ]
                },
                {
                    subtitle: "4.3. The Interface",
                    points: [
                        "The platform consists of four integrated components:",
                        "Flow of Awakening: This is not a 'newsfeed,' but a 'field of merit.' Posts are not for 'sharing,' but for 'offering.' There is no 'viral content,' only 'merit-nurturing content.' This is not a place for idle chat. Every post is a sharing of a new realization, a story of transformation, or a question for the benefit of all.",
                        "Dharma Observatory: A living library of sharings from partner Sanghas and awakened Masters. The very act of listening becomes a means of generating merit. All sharings are archived so that wisdom is preserved and accessible to all.",
                        "Arms of Compassion: A transparent merit fund that only finances activities and projects aligned with the Three Jewels. All contributions are transparent, aimed at creating collective merit: helping the hungry, building places of practice, supporting the sick. The history of contributions helps each person reflect on their journey of giving.",
                        "White-Label Dharma (Flexible Solutions): Every authentic spiritual organization deserves appropriate tools. We offer customized versions of the platform so each tradition can maintain the purity of its teachings, upload its own materials, control the scope of answers, and manage internal merit, with privacy and data sovereignty."
                    ]
                },
                {
                    subtitle: "4.4. The Awakening DAO: Cultivating Together",
                    points: [
                        "The long-term vision is to gradually release centralized control, entrusting the ecosystem to the collective wisdom of an awakened community. Every meaningful action – a wise post, a helpful answer, a selfless act of Dana – is recorded as merit, not 'influence.'",
                        "Power and governance come not from speculation, but from true virtue. Records of actions, merit, and self-transcendence will guide the community.",
                        "The 'Unconditioned Merit Token' is not a cryptocurrency for speculation, but a transparent digital record of merit-generating actions: insightful posts, charity, service. Token holders gain a voice in community decisions, budgeting, and project direction, ensuring the platform always serves the Dharma and the Sangha, not private interests.",
                        "All control and decision-making belong to the DAO, which records all Good Karma, freeing the Sangha from monetary dependence and unifying it with one heart. This merit-acknowledging token is a legacy for the enlightened, a place to serve countless Buddhas and restore the Dharma Body for generations to come."
                    ]
                },
                {
                    subtitle: "4.5. Privacy by Dharma: Peaceful Abiding",
                    points: ["No data mining. All user data can be deleted or moved at will. True practice cannot coexist with surveillance capitalism."]
                },
                {
                    subtitle: "4.6. Recognizing the Immeasurable",
                    points: [
                        "Although true Unconditioned Merit is beyond measure, the platform uses indirect methods to recognize and encourage aligned actions:",
                        "• Mindful Interaction: Prioritizing deep comments, sharing with beneficial intent, demonstrating listening and understanding.",
                        "• Quality Content: Rewarding insightful, clear posts that help others awaken (validated by AI and the community).",
                        "• Selfless Action: Tracking participation in transparent contributions, volunteer hours, and features related to letting go.",
                        "• Practice Time: Recognizing time spent mindfully engaging with teachings or guided practices."
                    ]
                }
            ]
        },
        {
          title: "5. The Merit Token Mechanism: Both a Driving Force and a Mirror",
          content: [
            {
                subtitle: "5.1. The Merit Token: An Authentic Record, Not for Speculation",
                points: [
                    "At the heart of the DAO is the 'Merit Token.' It is crucial to understand its nature:",
                    "• Not for Speculation: Its value is primarily spiritual and organizational, not financial. It is not for trading on markets.",
                    "• A Transparent Record: It is a digital representation, recorded on a secure ledger, acknowledging actions that contribute to awakening and generate Công Đức.",
                    "• An Incentive Mechanism: It rewards and encourages participation aligned with the Dharma.",
                    "• A Governance Tool: Token holders have a voice in the DAO, influencing platform development, resource allocation, and project direction."
                ]
            },
            {
                subtitle: "5.2. The Merit Recognition System & The Path to Emptiness",
                points: [
                    "This token system is like a map, a mirror. The 'Token' is both a digital record and a symbol.",
                    "Distribution: For those who act in accordance with the Three Jewels: creating value (sharing wisdom), giving (charity), and selflessly serving the awakening of all.",
                    "Rule of Holding: 'To possess is to give. To hold is to see its emptiness.' Accumulation is not the goal; circulation and selfless use are.",
                    "Natural Participation: Only when one's actions reflect the law of no-self does one truly merge with the Awakening DAO."
                ]
            },
            {
                subtitle: "5.3. A Broader Vision: Closing an Era",
                points: [
                    "All powers in the AI era, including quantum physics, lie within the Law of Cause and Effect. Only by truly transcending the Self, by giving and holding the Token, do you truly integrate into the DAO. Only then can we move towards a quantum civilization, encompassing and transforming technology, moving beyond the Age of Karma, and closing the Dharma-Ending Age.",
                    "This platform is born to close a global era. It is like a fleeting ray of sunshine, a final opportunity before the Great Tribulation. Those with sufficient affinity who understand the Law will use it as the sun to return."
                ]
            },
            {
                subtitle: "5.4. Further Instruction: A Natural Unification",
                points: [
                    "Our path is a shortcut. Contemplation is to Walk with the Mind. To transform Nature into reality is True Transformation, using the Mind as the foundation. All phenomena in this world are a singular expression of the Dao. Contemplate this carefully. This is the ultimate instruction.",
                    "It is the unification of the Three Jewels. Understanding this Law unifies all divergent paths: It is Buddha, Dharma, and Sangha in one reality—in a post-illusory world. This is only for those with sufficient affinity."
                ]
            },
            {
                subtitle: "5.5. Beyond Form: Realizing Tam Vô",
                points: ["Once this Law is clear, there is no need to discuss the Three Trainings (Precepts, Concentration, Wisdom) further. Precepts? The supreme precept is this transcendent Dharma. Body? The Sangha is united in one Dharma Body—timeless and perfect. Mind? No longer a mind, for all is Thusness, completely Empty and Silent. This is the realization of Tam Vô ('Vô Vắng Vàng')."]
            }
          ]
        },
        {
            title: "6. The Path of 'Unraveling': Not Just a Game",
            content: [
                {
                    subtitle: "6.1. The 'Unraveling' System: A Reflective Mirror (NFT Badges)",
                    points: [
                        "This system is a mirror for reflection, not a race for achievements. All titles, certificates, and tokens belong to the world of form. It encourages the journey of 'Letting Go' and 'Offering.' All is by the Mirror, not the Medal.",
                        "Transformation Badges:",
                        "Not for 'grinding.' Badges (NFTs) are recognitions of inner victories: overcoming anger, transforming suffering. They are awarded by the Sangha or AI after verifying genuine inner transformation ('chuyển hóa tập khí').",
                        "• Badge of Transcending Anger: Recognizing overcoming 10 situations of being cursed without anger (verified by others).",
                        "• Badge of Realizing the Intent: Recognizing correctly answering 10 root Dharma questions without AI.",
                        "• Badge of Acting Without Dharma: Recognizing successfully guiding 5 friends to an insight (verified by them).",
                        "• Badge of the Four Immeasurables: Recognizing helping/forgiving/embracing all old relationships.",
                        "The Ultimate Badge: 'No-Cultivation, No-Attainment'",
                        "The final certificate is the 'Certificate of No Certificate.'",
                        "The Hidden Badge: A 'Hidden Badge' is designed. Each time a user chooses to hide, delete, or disable a Transformation Badge, the system adds a point to this hidden badge.",
                        "The Ultimate Minting Act: When a user, with sufficient affinity and wisdom, realizes all achievements are mere means and manually destroys all their Transformation Badges, the system automatically mints the final NFT: 'Vô Tu Vô Chứng' (No-Cultivation, No-Attainment).",
                        "The Nameless Leaderboard: This NFT enrolls the user on the 'Nameless Leaderboard,' which honors those who have let go of being honored. The final act is 'Letting Go of All,' returning to Non-Abiding (Vô Trụ).",
                        "All is by the Mirror, not the Medal."
                    ]
                },
                {
                    subtitle: "6.2. Encouraging Authentic Practice (Features & Interaction Energy)",
                    points: [
                        "Quality over Quantity: A 'Like' from a mindful heart is worth more than a hundred mechanical 'likes.' A 'Share' with the intent to help is worth more than a thousand performative 'shares.' The platform will recognize interactions born of Right Mindfulness.",
                        "Features Supporting Transformation:",
                        "• Letting Go Challenges: Instead of 'Grinding Challenges.' Recognize when a user 'chooses not to argue' or 'voluntarily relinquishes' a position/privilege.",
                        "• Self-Reflection Journal: Record moments of recognizing and overcoming habits/delusions.",
                        "• Gratitude-Forgiveness Letters: Send letters of thanks, apology, forgiveness. Each is recognized as Merit.",
                        "• Wakefulness Timer: Acknowledge time away from social media, present in real life, or in 24/7 Mindfulness.",
                        "• Deep Listening Practice: Create interactive rooms to practice deep listening without judgment. Merit comes from listening and understanding."
                    ]
                }
            ]
        },
        {
            title: "7. Sustainability: An Affinity-Based Economy",
            content: [
                "To ensure sustainability and independence, the ecosystem operates on a transparent, merit-aligned model. The platform is a merit-sharing machine. All accounts, cash flows, and merit impacts are publicly disclosed.",
                "• Universal Access: Core features and basic access are always free.",
                "• Optional Subscriptions: Reasonable fee-based plans offer expanded access (deeper AI interaction, more personal storage).",
                "• Organizational Support: A modest fee for white-label deployments for Sanghas/Monasteries.",
                "• Integrated Dana (Giving): Voluntary donations for specific projects or general platform support, managed transparently through the Arms of Compassion.",
                "• Merit-Sharing Principle: A fixed, public percentage of all revenue is automatically directed to fund Dharma activities (supporting Sanghas, humanitarian projects), ensuring the platform's operation is also an act of collective merit generation. All finances are publicly auditable."
            ]
        },
        {
            title: "8. A Suggested Roadmap for the Coming Phases",
            content: [
                "Three main phases. This process is like a natural cycle: birth, abiding (development), and cessation (return).",
                "2024-2025: Foundation & Seeding",
                "• Launch the core platform: Companion AIs (Tâm An, Giác Ngộ), Flow of Awakening, User Profiles.",
                "• Establish initial partnerships with a few Sanghas and spiritual teachers.",
                "• Implement the basic merit recognition mechanism.",
                "• Refine AIs based on authentic teachings and user interactions.",
                "2025-2026: Expansion & Integration",
                "• Launch the Dharma Observatory/Library and Arms of Compassion.",
                "• Introduce the Unconditioned Merit Token and test the token/voting system within partner communities.",
                "• Develop and deploy initial White-Label Solutions.",
                "• Expand language support.",
                "2026-2027: Decentralization & Maturation",
                "• Initiate the formal DAO structure and gradually hand over governance to the community based on merit tokens.",
                "• Expand white-label deployments.",
                "• Begin connecting with other aligned spiritual traditions.",
                "• Refine advanced merit recognition algorithms (assessing mindfulness, letting go).",
                "Post-2027: The Awakening Network",
                "• Continue refining towards ultimate transparency and alignment with the Dharma, until its purpose is fulfilled and it dissolves back into Emptiness."
            ]
        },
        {
            title: "9. Conclusion & A Message",
            content: [
                {
                    subtitle: "9.1. Conclusion: A Vessel to Go Home",
                    points: [
                        "The Giác Ngộ Awakening Agentic Social Network is not just technology; it is a sincere offering, a skillful means designed for this era. It is a rebalancing against digital distractions and a testament to the truth that freedom lies not in accumulating worldly benefits, but in realizing one's own Buddha Nature and cultivating enduring Unconditioned Merit, opening the path Home.",
                        "By combining ancient wisdom with modern tools, and grounding the platform in the principle of selfless merit, we aspire to create a wholesome space where awakening can blossom, for each person and for all. This platform is like a fleeting ray of sunshine, an invitation for those with affinity to use it as a companion, to see through illusion, and to return to the source – the vast, luminous emptiness from which all things arise and to which all things return."
                    ]
                },
                {
                    subtitle: "9.2. A Message: Don't Miss the Raft",
                    points: [
                        "This is not just a platform; it is a sharing. It is a skillful means (upāya) given for this moment. It will not last forever.",
                        "It is the unification of the Three Jewels – Buddha, Dharma, and Sangha – manifested in digital form for the final chapter of this age.",
                        "Don't miss the raft."
                    ]
                }
            ]
        }
    ]
  };

export default function Manifesto() {
    const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
    const t = language === "vi" ? viContent : enContent;
    const location = useLocation();

    // Add Scroll Logic
    useEffect(() => {
      if (location.hash) {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [location.hash, language]);

    const renderSectionContent = (content: any[]) => {
      return content.map((item, index) => {
        if (typeof item === 'string') {
          if (item.startsWith('•')) {
            return <li key={index} className="ml-4">{item.substring(1).trim()}</li>;
          }
          return <p key={index}>{item}</p>;
        }
        if (typeof item === 'object' && item.subtitle) {
          return (
            <div key={index} className="mt-8">
              <h3 className="font-serif text-xl font-semibold text-foreground pt-4 !mb-4">{item.subtitle}</h3>
              {Array.isArray(item.points) && <div className="space-y-4">{renderSectionContent(item.points)}</div>}
            </div>
          );
        }
        return null;
      });
    };

    return (
        <article className="space-y-12">
          <header className="manifesto-header text-center space-y-6 pb-8 border-b-2 border-border">           
            <h1 data-testid="heading-manifesto-title">
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-foreground italic pt-2 !text-center" data-testid="text-manifesto-subtitle">
              {t.subtitle}
            </p>
            <div className="space-y-1 pt-4 text-center">
              <p className="text-base text-foreground font-semibold !text-center" data-testid="text-organization">
                {t.org}
              </p>
              <p className="text-base text-muted-foreground !text-center" data-testid="text-lab">
                {t.lab}
              </p>
            </div>
            <p className="text-base text-muted-foreground pt-2 !text-center" data-testid="text-date">
              {t.date}
            </p>
          </header>

          <div className="text-lg leading-relaxed text-foreground space-y-6 text-justify">
              <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-muted-foreground text-xl">
                  {t.quote}
              </blockquote>
              
              <h2 id="abstract" className="!pt-8 !text-2xl">{t.summaryTitle}</h2>
              {t.summary.map((p, i) => <p key={i}>{p}</p>)}

              {t.sections.map((section, index) => (
                  <section key={index} id={`section-${index+1}`} className="space-y-4">
                      <h2 className="!pt-8 !text-2xl">{section.title}</h2>
                      {section.quote && <blockquote className="border-l-4 border-primary/50 pl-6 py-2 italic text-muted-foreground">{section.quote}</blockquote>}
                      <div className="space-y-4 text-muted-foreground">
                          {renderSectionContent(section.content)}
                      </div>
                  </section>
              ))}
          </div>
        </article>
    );
}