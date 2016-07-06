/* jslint browser: true, indent: 2 */
/* global Modernizr, imagesLoaded, Stickyfill */

(function (window) {
  'use strict';

  var doc = window.document,
    docElem = doc.documentElement,
    body = doc.body || doc.getElementsByTagName('body')[0],
    joy;

  function getViewport() {
    return {
      width: Math.max(docElem.clientWidth, window.innerWidth || 0),
      height: Math.max(docElem.clientHeight, window.innerHeight || 0)
    };
  }

  function debounce(func, threshold, execAsap) {
    var timeout;

    return function debounced () {
      var obj = this,
        args = arguments;

      function delayed () {
        if (!execAsap) {
          func.apply(obj, args);
        }
        timeout = null;
      }

      if (timeout) {
        window.clearTimeout(timeout);
      } else if (execAsap) {
        func.apply(obj, args);
      }

      timeout = window.setTimeout(delayed, threshold || 100);
    };
  }

  joy = {

    init: function () {
      joy.tictailLogo();

      if (body.getAttribute('id') === 'page-product') {
        joy.productSticky();
      }
    },

    productSticky: function () {
      var productContent = doc.getElementById('product-content'),
        productImages = doc.getElementById('product-images'),
        contentHeight,
        viewport,
        offset,
        STICKY_ACTIVE = 'is-sticky';

      function setSticky() {
        viewport = getViewport();
        contentHeight = productContent.clientHeight;
        offset = Math.round((viewport.height / 2) - (contentHeight / 2));

        if (viewport.width > 800 && (viewport.height > (contentHeight + 40)) && (offset > 40)) {
          productContent.style.top = offset + 'px';

          if (!Modernizr.csspositionsticky) {
            Stickyfill.add(productContent);
          }

          productContent.classList.add(STICKY_ACTIVE);

        } else if (productContent.classList.contains(STICKY_ACTIVE)) {
          if (!Modernizr.csspositionsticky) {
            Stickyfill.remove(productContent);
          }
          productContent.classList.remove(STICKY_ACTIVE);
        }
      }

      imagesLoaded(productImages, function () {
        setSticky();

        window.addEventListener('resize', debounce(function () {
          setSticky();
        }, 500), false);
      });

    },

    // Sorry Tictail but you have some serious issues with the position of your logo :)
    tictailLogo: function () {
      var logo = doc.getElementById('__ttLogo');

      function hideLogo() {
        logo.style.display = 'none';
      }

      if (logo) {
        hideLogo();
      } else {
        window.setTimeout(function () {
          joy.tictailLogo();
        }, 3000);
      }
    }
  };

  window.onload = function () {
    joy.init();
  };

}(this));
