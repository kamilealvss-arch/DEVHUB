const cards = document.querySelectorAll('.card');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

let currentIndex = 0;

function updateCarousel() {
  const totalCards = cards.length;

  cards.forEach(card => {
    card.classList.remove('active', 'prev-card', 'next-card');
  });

  cards[currentIndex].classList.add('active');

  const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
  cards[prevIndex].classList.add('prev-card');

  const nextIndex = (currentIndex + 1) % totalCards;
  cards[nextIndex].classList.add('next-card');
}

btnNext.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateCarousel();
});

btnPrev.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateCarousel();
});

updateCarousel();