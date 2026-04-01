/* ============================================
   Towing Service Queens NYC - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', function() {
      navList.classList.toggle('active');
      this.classList.toggle('active');
    });
  }

  // Mobile Dropdown Toggle
  const dropdowns = document.querySelectorAll('.nav-dropdown > a');
  dropdowns.forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        this.parentElement.classList.toggle('active');
      }
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-question');
  faqItems.forEach(function(item) {
    item.addEventListener('click', function() {
      const parent = this.parentElement;
      const wasActive = parent.classList.contains('active');

      // Close all FAQ items
      document.querySelectorAll('.faq-item').forEach(function(faq) {
        faq.classList.remove('active');
      });

      // Toggle the clicked one
      if (!wasActive) {
        parent.classList.add('active');
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (navList && navList.classList.contains('active')) {
      if (!e.target.closest('.nav') && !e.target.closest('.menu-toggle')) {
        navList.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
      }
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
