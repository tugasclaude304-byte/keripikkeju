/* Dropdown "Lainnya" di navbar. Berdiri sendiri, tidak mengubah navbar.js */
(function(){
  'use strict';
  var box=document.querySelector('.nav-more'); if(!box) return;
  var btn=box.querySelector('button'), menu=box.querySelector('.nav-more-menu');
  function set(open){box.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',open?'true':'false')}
  btn.addEventListener('click',function(e){e.stopPropagation();set(!box.classList.contains('is-open'))});
  document.addEventListener('click',function(e){if(!box.contains(e.target))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('is-open')){set(false);btn.focus()}});
  menu.addEventListener('focusout',function(e){if(!box.contains(e.relatedTarget))set(false)});
})();
