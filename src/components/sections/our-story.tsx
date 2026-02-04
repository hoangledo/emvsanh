"use client";

import { Sparkles } from "@/components/icons";
import { useScroll } from "@/components/scroll-provider";

export function OurStory() {
  const { scrollY } = useScroll();
  const sectionTop = 800;
  const parallaxOffset = (scrollY - sectionTop) * 0.3;

  return (
    <section
      id="story"
      className="relative flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl bg-accent/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="glass rounded-3xl border border-border p-12 shadow-lg md:p-16">
          <div className="mb-8 flex justify-center">
            <Sparkles className="h-10 w-10 text-accent" size={40} />
          </div>

          <h2
            className="mb-8 text-center font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Câu chuyện của chúng mình
          </h2>

          <div className="space-y-6 text-card-foreground">
            <p className="text-lg leading-relaxed">
              Hôm nay là ngày 4 tháng 2 năm 2026. Nhưng anh muốn chúng mình quay ngược thời gian chút, và cùng trở lại tháng 9 năm 2023.
              Khi mà em chủ động nhắn tin kết bạn với anh :)))

            </p>

            <p className="text-lg leading-relaxed">
              Đây là lần đầu tiên anh nhắn tin với em, và cũng là lần đầu có một người làm anh muốn nhắn tin và call lâu đến thế.
              Hihi, mặc dù lúc call hay nhắn tin thì anh có hơi hãm l, nhưng mà em vẫn luôn ở đây, kiên nhẫn và trò chuyện với anh.
            </p>

            <p className="text-lg leading-relaxed">
              Chuyện thì còn dài và nhiều tình tiết lắm nma anh phải ưu tiên các phần khác cho kịp công đoạn nên là tạm thế đã nha, heheeee.
            </p>

            <p className="text-lg leading-relaxed">
              Anyways, cảm ơn em rất nhiều vì đã đồng hành cùng anh trong suốt thời gian qua.
            </p>

            <p className="pt-4 text-center font-serif italic">
              Anh yêu em nhiều lắm lắm ❤️
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
