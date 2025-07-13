document.addEventListener('DOMContentLoaded', () => {
  const cartCountElem = document.getElementById('cart-count');
  let cartCount = 0;

  document.querySelectorAll('.add-cart').forEach(button => {
    button.addEventListener('click', () => {
      cartCount++;
      cartCountElem.textContent = cartCount;
    });
  });
});