"use client";

import { PenLine } from "@/components/icons";

export function Letter() {
  return (
    <section
      id="letter"
      className="relative flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-accent/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="glass rounded-3xl border border-border p-10 shadow-2xl md:p-16">
          <div className="mb-8 flex justify-center">
            <PenLine className="h-10 w-10 text-accent" size={40} />
          </div>

          <h2
            className="mb-8 text-center font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Mến tặng vợ iu của anh
          </h2>

          <div
            className="space-y-6 text-card-foreground"
            style={{
              fontFamily: "var(--font-cursive), cursive, serif",
              fontSize: "1.125rem",
              lineHeight: 2,
            }}
          >
            <p>Hellu em iuuu,</p>

            <p>
              Hôm nay là ngày 4 tháng 2, và cũng sắp đến ngày 14 tháng 2 rồi nhỉ. Nhanh ghê ha, chỉ khoảng 1 tháng nữa thôi là anh sẽ lại được gặp em rồi.
              Chúng mình quen nhau cũng lâu ghê rồi á, cũng đã đi được khá xa rồi nhỉ. Từ lúc bắt đầu nói chuyện mỗi tối với em từ tháng 9/2023
              đến hè mình về gặp nhau rồi đi chơi đi ăn đi làm cùng nhau, rồi cũng cãi vã với chia tay nhau không ít lần.
            </p>

            <p>
              Vậy mà mình vẫn yêu nhau đến tận bây giờ, vẫn call và nhắn tin nhau hàng ngày, vẫn luôn ở cạnh nhau dù buồn hay vui, dù mệt mỏi hay đầy năng lượng.
              Cảm ơn Mỡ đã luôn ở đây với anh, cảm ơn em đã luôn kiên nhẵn và chịu đựng cái tính nết khó ở của anh, cảm ơn em đã không trách mắng hay giận dỗi anh dù đôi khi 
              anh có làm em buồn phiền.
            </p>

            <p>
              Mỗi ngày với em là một ngày đặc biệt, một ngày đáng nhớ, một ngày đáng yêu.
              Anh cảm ơn em đã luôn hiện diện ở đây, cho anh cười thật nhiều, vui thật nhiều, và học được thật nhiều.
            </p>

            <p>
              Cảm ơn em vì hành trình này, và anh hy vọng mình sẽ cùng nhau bước tiếp thật lâu lâu nữa.
              Và dù có một điều này anh làm hơi muộn, nhưng anh không muốn bỏ lỡ và cũng không muốn tình yêu này thiếu nó. 
              Anh hy vọng em có thể giúp anh nhấn Command + T.
            </p>

            <p>Anh yêu em lắm lắm ❤️</p>
            <p>Hoàng của em</p>

            <p className="font-serif text-2xl text-accent">
              With all my heart ♡
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
