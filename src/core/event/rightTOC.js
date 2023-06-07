


import { isMobile } from '../util/env';

let lastClickedItem = null;
let isUserClick = false;
let sections = [];
let currentActive = null;

export function initRightTOC(router) {
  if (isMobile) {
    return;
  }

  let rightTOC = document.querySelector('.right-toc');
  if (rightTOC) {
    rightTOC.remove();
  }

  const headers = document.querySelectorAll('.markdown-section h1, .markdown-section h2, .markdown-section h3, .markdown-section h4, .markdown-section h5, .markdown-section h6');
  
  sections = Array.from(headers);
  window.addEventListener('scroll', handleScroll);

  headers.forEach(header => {
    const link = header.querySelector('a');
    if (link) {
      const href = link.getAttribute('href');
      const id = href.substring(href.lastIndexOf('=') + 1);
      header.id = id;
    }

    header.addEventListener('click', (e) => {
      e.preventDefault();

      const id = header.id;
      isUserClick = true;
      document.getElementById(id).scrollIntoView({
        behavior: "smooth"
      });
      highlightRightTOCElement(id);

      setTimeout(() => {
        isUserClick = false;
      }, 1000);
    });
  });

  rightTOC = document.createElement('div');
  rightTOC.classList.add('right-toc');

  const tocHeading = document.createElement('h3');
  tocHeading.textContent = 'On this page';
  rightTOC.appendChild(tocHeading);

  const links = Array.from(headers);

  links.forEach(link => {
    const anchor = link.querySelector('a');
    const href = anchor.getAttribute('href');
    const id = href.substring(href.lastIndexOf('=') + 1);

    const a = document.createElement('a');
    a.href = '#' + link.id;
    a.setAttribute('data-href', href);
    a.textContent = link.textContent;

    const level = parseInt(link.tagName.slice(1));
    a.classList.add('level-' + level);

    rightTOC.appendChild(a);

    a.addEventListener('click', (e) => {
      e.preventDefault();

      lastClickedItem = a.getAttribute('data-href');
      isUserClick = true; 
      location.hash = a.getAttribute('data-href');
      highlightRightTOCElement(link.id);
      setTimeout(() => {
        isUserClick = false;
      }, 1000);
    });
  });

  document.body.appendChild(rightTOC);

 
}

function handleScroll() {
  if (isUserClick) {
    return;  // If it's a user click event, don't interfere with highlighting.
  }

  const viewportHeight = window.innerHeight;
  const offsetThreshold = viewportHeight * 0.2; // 20% from the top
  const bottomThreshold = viewportHeight * 0.8; // 80% from the top, i.e., 20% from the bottom
  let nextActiveTopHalf = null;
  let nextActiveBottomHalf = null;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const rect = section.getBoundingClientRect();
    
    // Check if the section's top is within the offsetThreshold for the top half
    if (rect.top <= offsetThreshold) {
      nextActiveTopHalf = section.id;
    } 

    // Check if the section's bottom is within the bottomThreshold for the bottom half
    if (rect.bottom <= bottomThreshold) {
      nextActiveBottomHalf = section.id;
    } 
  }

  // Check if we're in the top half or bottom half of the page and set the next active section accordingly
  const scrollPosition = window.scrollY || window.pageYOffset;
  const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let nextActive = null;
  if (scrollPosition <= documentHeight / 2) {
    nextActive = nextActiveTopHalf;
  } else {
    nextActive = nextActiveBottomHalf;
  }

  if (currentActive !== nextActive) {
    currentActive = nextActive;
    highlightRightTOCElement(currentActive);
  }
}








export function destroyRightTOC() {
  window.removeEventListener('scroll', handleScroll);
}

export function highlightRightTOCElement(id, highlight = true) {
  const rightTOC = document.querySelector('.right-toc');
  if (!rightTOC) {
    return;
  }

  const activeLinks = Array.from(rightTOC.querySelectorAll('.active'));
  activeLinks.forEach(link => {
    if (link.getAttribute('href') !== `#${id}`) {
      link.classList.remove('active');
    }
  });

  const targetLink = rightTOC.querySelector(`[href="#${id}"]`);
  if (targetLink) {
    if (highlight) {
      targetLink.classList.add('active');
    } else {
      targetLink.classList.remove('active');
    }
  }
}
