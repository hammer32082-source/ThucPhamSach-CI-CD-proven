document.addEventListener("DOMContentLoaded", function () {
    var swiper = new Swiper('.swiper-container', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        speed: 1500,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return `
                  <span class="${className} swiper-pagination-bullet--svg">
                    <svg width="26" height="26" viewBox="0 0 28 28">
                      <circle class="svg-progress" cx="14" cy="14" r="12"></circle>
                      <circle class="svg-dot" cx="14" cy="14" r="6" stroke-width="3"></circle>
                    </svg>
                  </span>
                `;
            }
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            slideChangeTransitionStart() {
                document.querySelectorAll('.svg-progress').forEach(el => {
                    el.style.animation = 'none';
                    el.offsetHeight; // force reflow
                    el.style.animation = '';
                });
            }
        }
    });
});
