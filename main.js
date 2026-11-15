// Draftline Studio pre-launch site.

// Where waitlist sign-ups are sent. Leave empty until an email service is set up.
// Works with any endpoint that accepts a JSON POST, such as a Formspree form URL
// ("https://formspree.io/f/your-id").
const WAITLIST_ENDPOINT = '';

// The rail fills as the page scrolls.
const root = document.documentElement;
let ticking = false;
function setProgress() {
  const max = root.scrollHeight - window.innerHeight;
  root.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '1');
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(setProgress); }
}, { passive: true });
window.addEventListener('resize', setProgress);
setProgress();

// Cap colors.
const capFigure = document.querySelector('.cap-fig');
const swatches = document.querySelectorAll('.swatch');
swatches.forEach((button) => {
  button.addEventListener('click', () => {
    capFigure.dataset.color = button.dataset.color;
    const names = { asphalt: 'Asphalt', chalk: 'Chalk', blue: 'Grid Blue' };
    const picture = capFigure.querySelector('img');
    picture.src = `img/cap-${button.dataset.color}.jpg`;
    picture.alt = `3D render of the cycling cap in ${names[button.dataset.color]} with one line around the crown`;
    swatches.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  });
});

// "Tell me when it lands" links tick the matching box on the waitlist form.
const form = document.querySelector('.wait');
const email = form.querySelector('#email');
const statusLine = form.querySelector('.status');
document.querySelectorAll('.notify').forEach((link) => {
  link.addEventListener('click', () => {
    const box = form.querySelector(`input[value="${link.dataset.item}"]`);
    if (box) box.checked = true;
    setTimeout(() => email.focus({ preventScroll: true }), 600);
  });
});

function say(message, state) {
  statusLine.textContent = message;
  statusLine.dataset.state = state || '';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const address = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    say('Enter an email address, like you@example.com.', 'error');
    email.focus();
    return;
  }
  if (!WAITLIST_ENDPOINT) {
    say('The waitlist is not open yet. Check back soon.', 'error');
    return;
  }
  const items = [...form.querySelectorAll('input[name="items"]:checked')].map((b) => b.value);
  const button = form.querySelector('button');
  button.disabled = true;
  say('Joining the waitlist…');
  try {
    const response = await fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: address, items: items.join(', ') }),
    });
    if (!response.ok) throw new Error(String(response.status));
    form.reset();
    say('You are on the waitlist. We will write when the kit is ready.');
  } catch (error) {
    say('That did not go through. Check your connection and try again.', 'error');
  } finally {
    button.disabled = false;
  }
});
