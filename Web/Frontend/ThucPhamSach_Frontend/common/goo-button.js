// GOO BUTTON EFFECT INITIALIZER

window.initGooEffects = function() {
    // 1. Inject SVG Filter
    if (!document.getElementById('goo-filter-svg')) {
        const svgHTML = `
      <div id="goo-filter-svg">
      <svg xmlns="http://www.w3.org/2000/svg" class="goo" style="position: absolute; width: 1px; height: 1px; visibility: hidden;">
        <defs>
          <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      </div>
    `;
        document.body.insertAdjacentHTML('beforeend', svgHTML);
    }

    // 2. Wrap matching buttons
    document.querySelectorAll('.apply-goo').forEach(el => {
        // Tránh wrap lại lần 2 nếu đã có class button--bubble
        if (el.classList.contains('button--bubble')) return;

        const container = document.createElement('span');
        container.className = 'button--bubble__container';
        
        // Wrap the element
        el.parentNode.insertBefore(container, el);
        container.appendChild(el);
        
        // Add class
        el.classList.add('button--bubble');

        // Create sibling effect container
        const effectContainer = document.createElement('span');
        effectContainer.className = 'button--bubble__effect-container';
        effectContainer.innerHTML = `
          <span class="circle top-left"></span>
          <span class="circle top-left"></span>
          <span class="circle top-left"></span>
          <span class="button-bg effect-button"></span>
          <span class="circle bottom-right"></span>
          <span class="circle bottom-right"></span>
          <span class="circle bottom-right"></span>
        `;
        container.appendChild(effectContainer);
    });

    // Nếu scripts đã load rồi thì chạy animation ngay cho các phần tử mới
    if (window.jQuery && window.TweenMax) {
        initAnimations();
    }
};

// Khởi tạo lần đầu khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    window.initGooEffects();
    // 3. Load dependencies & animate
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.head.appendChild(script);
        });
    };

    Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js")
    ]).then(() => {
        initAnimations();
    });
});

function initAnimations() {
    // Tìm các nút chưa được gán sự kiện hover (tránh gán trùng lặp)
    $('.button--bubble:not(.is-animated)').each(function () {
        const $btn = $(this);
        $btn.addClass('is-animated');
        const $container = $btn.parent();
        const $circlesTL = $container.find('.circle.top-left');
        const $circlesBR = $container.find('.circle.bottom-right');
        const $effectBtn = $container.find('.effect-button');

        const tl = new TimelineLite();
        const tl2 = new TimelineLite();
        const master = new TimelineLite({ paused: true });

        tl.set($circlesTL, { x: 0, y: 0, rotation: -45, scale: 1, opacity: 1 });
        tl.to($circlesTL, 1.2, { x: -25, y: -25, scaleY: 2, ease: SlowMo.ease.config(0.1, 0.7, false) })
          .to($circlesTL, 1, { scale: 0, opacity: 0 });

        tl2.set($circlesBR, { x: 0, y: 0, rotation: 45, scale: 1, opacity: 1 });
        tl2.to($circlesBR, 1.2, { x: 30, y: 30, ease: SlowMo.ease.config(0.1, 0.7, false) })
           .to($circlesBR, 1, { scale: 0, opacity: 0 });

        master.add(tl);
        master.to($effectBtn, 0.8, { scaleY: 1.1 }, 0.1);
        master.add(tl2, 0.2);
        master.to($effectBtn, 1.6, { scale: 1, ease: Elastic.easeOut.config(1.2, 0.4) }, 1);

        master.timeScale(2.5);

        $btn.on('mouseenter', function () {
            master.restart();
        });
    });
}