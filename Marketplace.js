const itemsGrid = document.getElementById('itemsGrid');
const searchInput = document.getElementById('searchInput');

// Example items
const exampleItems = [
  {
    title: "Used Backpack — Laptop Compartment",
    desc: "Complete backpack with laptop compartment and extra pockets for school supplies.",
    price: "1500 DA",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
    email: "nina@uni.edu"
  },
  {
    title: "Wireless Headphones",
    desc: "Noise-cancelling wireless headphones, barely used.",
    price: "3500 DA",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
    email: "ali@uni.edu"
  },
  {
    title: "Wireless Headphones",
    desc: "Noise-cancelling wireless headphones, barely used.",
    price: "3500 DA",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
    email: "ali@uni.edu"
  },

  {
    title: "Used Backpack — Laptop Compartment",
    desc: "Complete backpack with laptop compartment and extra pockets for school supplies.",
    price: "1500 DA",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
    email: "nina@uni.edu"
  },
];

// Function to create item card
function createItemCard(item) {
  const card = document.createElement('div');
  card.classList.add('item-card');
  card.dataset.title = item.title;
  card.dataset.desc = item.desc;
  card.dataset.price = item.price;
  card.dataset.img = item.img;
  card.dataset.email = item.email;

  card.innerHTML = `
    <div class="img-box"><img src="${item.img}" alt="${item.title}"></div>
    <div class="info">
      <div class="title">${item.title}</div>
      <div class="sub">${item.email}</div>
      <div class="price">${item.price}</div>
    </div>
  `;
  itemsGrid.appendChild(card);
}

exampleItems.forEach(item => createItemCard(item));

// Search functionality
searchInput.addEventListener('input', () => {
  const value = searchInput.value.toLowerCase();
  const cards = itemsGrid.querySelectorAll('.item-card');
  cards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const desc = card.dataset.desc.toLowerCase();
    card.style.display = title.includes(value) || desc.includes(value) ? 'flex' : 'none';
  });
});

itemsGrid.addEventListener('click', e => {
  const card = e.target.closest('.item-card');
  if (!card) return;


  const popup = document.createElement('div');
  popup.classList.add('popup-overlay');


  const box = document.createElement('div');
  box.classList.add('popup-box');

  const left = document.createElement('div');
  left.classList.add('popup-left');

  const img = document.createElement('img');
  img.src = card.dataset.img;
  img.alt = card.dataset.title;

  const title = document.createElement('div');
  title.classList.add('title');
  title.innerText = card.dataset.title;

  const price = document.createElement('div');
  price.classList.add('price');
  price.innerText = card.dataset.price;

  const email = document.createElement('div');
  email.classList.add('email');
  email.innerText = card.dataset.email;

  left.append(img, title, price, email);

  
  const right = document.createElement('div');
  right.classList.add('popup-right');
  right.innerText = card.dataset.desc;

  box.append(left, right);
  popup.appendChild(box);
  document.body.appendChild(popup);


  popup.addEventListener('click', event => {
    if (event.target === popup) popup.remove();
  });
});
