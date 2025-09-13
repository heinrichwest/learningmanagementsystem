/* eslint-disable no-param-reassign */
import utils from './utils';

/*-----------------------------------------------
|  Testimonial Swiper
-----------------------------------------------*/

const setBgImage = (el, testimonialAvatar) => {
  const avatar = utils.getData(el.querySelector('[data-avatar]'), 'avatar');
  testimonialAvatar.style.backgroundImage = `url(${avatar})`;
};

const testimonialSwiperInit = () => {
  const testimonials = document.querySelectorAll('.testimonial');

  if (testimonials.length) {
    testimonials.forEach(testimonial => {
      const testimonialSlider = testimonial.querySelector('.testimonial-slider');
      if (testimonialSlider) {
        const testimonialAvatar = testimonial.querySelector('.testimonial-avatar');
        if (testimonialAvatar) {
          setBgImage(testimonial, testimonialAvatar);
        }
        const { swiper } = testimonialSlider;
        if (swiper) {
          swiper.on('slideChange', e => {
            const slider = e.slides[e.snapIndex];
            setBgImage(slider, testimonialAvatar);
          });
        }
      }
    });
  }
};

export default testimonialSwiperInit;
